#!/bin/bash
#
# verifier.sh  Copyright (c) 2017, GEM Foundation.
#
# FIXME: Licence header
#
# DESCRIPTION
#
# script to perform tests on jenkins
#

#
#  FUNCTIONS
#
#  usage <exitcode> - show usage of the script
#      <exitcode>    value of exitcode
#
usage () {
    local ret

    ret=$1

    echo
    echo "USAGE:"
    echo "    $0 devtest <branch-name>"
    echo "                                                 put ORDD in a lxc,"
    echo "                                                 setup environment and run development tests."
#    TODO: to be implemented
#    echo "    $0 prodtest <branch-name> <smtp_address> ['notest']"
#    echo "                                                 production installation and tests."
#    echo
    exit $ret
}



if [ $GEM_SET_DEBUG ]; then
    set -x
fi

set -e

GEM_GIT_REPO="git@github.com:GFDRR"
GEM_GIT_PACKAGE="open-risk-data-dashboard"

if [ "$GEM_EPHEM_CMD" = "" ]; then
    GEM_EPHEM_CMD="lxc-copy"
fi
if [ "$GEM_EPHEM_NAME" = "" ]; then
    GEM_EPHEM_NAME="ubuntu16-x11-lxc-eph"
fi

LXC_VER=$(lxc-ls --version | cut -d '.' -f 1)

if [ $LXC_VER -lt 1 ]; then
    echo "lxc >= 1.0.0 is required." >&2
    exit 1
fi

if command -v lxc-copy &> /dev/null; then
    # New lxc (>= 2.0.0) with lxc-copy
    GEM_EPHEM_EXE="${GEM_EPHEM_CMD} -n ${GEM_EPHEM_NAME} -e"
else
    # Old lxc (< 2.0.0) with lxc-start-ephimeral
    GEM_EPHEM_EXE="${GEM_EPHEM_CMD} -o ${GEM_EPHEM_NAME} -d"
fi

if [ "$GEM_EPHEM_DESTROY" != "" ]; then
    LXC_DESTROY="$GEM_EPHEM_DESTROY"
else
    LXC_DESTROY="true"
fi

#
#  remote init files
cat >.gem_init.sh <<EOF
export GEM_SET_DEBUG=$GEM_SET_DEBUG
if [ "$OQ_MOON_STATS" = "true" ]; then
    export OQ_MOON_STATS=$OQ_MOON_STATS
fi

set -e
if [ -n "\$GEM_SET_DEBUG" -a "\$GEM_SET_DEBUG" != "false" ]; then
    export PS4='+\${BASH_SOURCE}:\${LINENO}:\${FUNCNAME[0]}: '
    set -x
fi
source .gem_ffox_init.sh
EOF

cat >.gem_ffox_init.sh <<EOF
export GEM_FIREFOX_ON_HOLD=$GEM_FIREFOX_ON_HOLD
if [ "\$GEM_FIREFOX_ON_HOLD" ]; then
    sudo apt-mark hold firefox firefox-locale-en
else
    sudo apt-get update
    ffox_pol="\$(apt-cache policy firefox)"
    ffox_cur="\$(echo "\$ffox_pol" | grep '^  Installed:' | sed 's/.*: //g')"
    ffox_can="\$(echo "\$ffox_pol" | grep '^  Candidate:' | sed 's/.*: //g')"
    if [ "\$ffox_cur" != "\$ffox_can" ]; then
        echo "WARNING: firefox has been upgraded, run it to accomplish update operations"
        sudo apt-get -y upgrade
        sudo apt-get -y install wmctrl
        export DISPLAY=:1
        firefox &
        ffox_pid=\$!
        st="none"
        for i in \$(seq 1 1000) ; do
            ffox_wins="\$(wmctrl -l | grep -i "firefox" || true)"
            if [ "\$st" = "none" ]; then
                if echo "\$ffox_wins" | grep -qi 'update'; then
                    st="update"
                elif echo "\$ffox_wins" | grep -qi 'mozilla'; then
                    break
                fi
            elif [ "\$st" = "update" ]; then
                if echo "\$ffox_wins" | grep -qvi 'update'; then
                    break
                fi
            fi
            sleep 0.02
        done
        kill \$ffox_pid || true
        sleep 2
    fi
fi
EOF

#
#  _wait_ssh <lxc_ip> - wait until the new lxc ssh daemon is ready
#      <lxc_ip>    the IP address of lxc instance
#
_wait_ssh () {
    local lxc_ip="$1"

    for i in $(seq 1 20); do
        if ssh $lxc_ip "echo begin"; then
            break
        fi
        sleep 2
    done
    if [ $i -eq 20 ]; then
        return 1
    fi
}


LXC_TERM="lxc-stop -t 10"

LXC_KILL="lxc-stop -k"

#
#  _lxc_name_and_ip_get <filename> - retrieve name and ip of the runned ephemeral lxc and
#                                    put them into global vars "lxc_name" and "lxc_ip"
#      <filename>    file where lxc-start-ephemeral output is saved
#
_lxc_name_and_ip_get()
{
    if [ "$GEM_EPHEM_IP_GET" = "" ]; then
        local filename="$1" i e

        i=-1
        e=-1
        for i in $(seq 1 40); do
            if [ "$GEM_EPHEM_EXE" = "$GEM_EPHEM_NAME" ]; then
                lxc_name="$GEM_EPHEM_NAME"
                break
            elif grep -q " as clone of $GEM_EPHEM_NAME" $filename 2>&1 ; then
                lxc_name="$(grep " as clone of $GEM_EPHEM_NAME" $filename | tail -n 1 | sed "s/Created \(.*\) as clone of ${GEM_EPHEM_NAME}/\1/g")"
                break
            else
                sleep 2
            fi
        done
        if [ $i -eq 40 ]; then
            return 1
        fi

        for e in $(seq 1 40); do
            sleep 2
            lxc_ip="$(sudo lxc-ls -f --filter "^${lxc_name}\$" | tail -n 1 | sed 's/ \+/ /g' | cut -d ' ' -f 5)"
            if [ "$lxc_ip" -a "$lxc_ip" != "-" ]; then
                break
            fi
        done
        if [ $e -eq 40 ]; then
            return 1
        fi
        echo "SUCCESSFULY RUNNED $lxc_name ($lxc_ip)"

        return 0
    else
        lxc_ip="$(sudo $GEM_EPHEM_IP_GET "$GEM_EPHEM_NAME")"
        lxc_name="$GEM_EPHEM_NAME"
        if [ $? -ne 0 ]; then
            return 1
        fi
        echo "SUCCESSFULY RUNNED $lxc_name ($lxc_ip)"

        return 0
    fi
}

#
#  _devtest_innervm_run <branch_id> <lxc_ip> - part of source test performed on lxc
#                     the following activities are performed:
#                       files and install them
#
#      <branch_id>    name of the tested branch
#      <lxc_ip>       the IP address of lxc instance
#
_devtest_innervm_run () {
    local i old_ifs pkgs_list dep branch_id="$1" lxc_ip="$2"

    trap 'local LASTERR="$?" ; trap ERR ; (exit $LASTERR) ; return' ERR

    scp .gem_init.sh ${lxc_ip}:
    scp .gem_ffox_init.sh ${lxc_ip}:

    repo_id="$GEM_GIT_REPO"

    git archive --prefix=$GEM_GIT_PACKAGE/ --format tar HEAD | ssh -t $lxc_ip "tar -x"


    ssh -t  $lxc_ip "export GEM_SET_DEBUG=\"$GEM_SET_DEBUG\"
export GEM_GIT_REPO=\"$GEM_GIT_REPO\"
export GEM_GIT_PACKAGE=\"$GEM_GIT_PACKAGE\"
rem_sig_hand() {
    trap ERR
    echo 'signal trapped'
}
trap rem_sig_hand ERR
set -e
if [ \$GEM_SET_DEBUG ]; then
    set -x
fi
echo \$PWD
pwd
ls open-risk-data-dashboard/backend

./$GEM_GIT_PACKAGE/backend/verifier-guest.sh $branch_id
"
    echo "_devtest_innervm_run: exit"

    return 0
}

#
#  devtest_run <branch_id> - main function of source test
#      <branch_id>    name of the tested branch
#
devtest_run () {
    local deps old_ifs branch_id="$1"

    trap sig_hand SIGINT SIGTERM ERR
    
    sudo echo
    if [ "$GEM_EPHEM_EXE" = "$GEM_EPHEM_NAME" ]; then
        _lxc_name_and_ip_get
    else
        sudo ${GEM_EPHEM_EXE} 2>&1 | tee /tmp/packager.eph.$$.log &
        _lxc_name_and_ip_get /tmp/packager.eph.$$.log
        rm /tmp/packager.eph.$$.log
    fi

    _wait_ssh $lxc_ip
    set +e
    _devtest_innervm_run "$branch_id" "$lxc_ip"
    inner_ret=$?

    copy_common dev
    copy_dev

    if [ $inner_ret != 0 ]; then
        # cleanup in error case
        :
    fi

    if [ "$LXC_DESTROY" = "true" ]; then
        sudo $LXC_TERM -n $lxc_name
    fi

    set -e

    return $inner_ret
}

copy_common () {
    scp "${lxc_ip}:ssh.log" "out/${1}_ssh_history.log" || true
}

copy_dev () {
    :
    scp "${lxc_ip}:dev_xunit.xml" "out/dev_xunit.xml" || true
    # scp "${lxc_ip}:/var/log/apache2/error.log" "out/prod_apache2_error.log" || true
    # scp "${lxc_ip}:prod_*.png" "out/" || true
    # scp "${lxc_ip}:xunit-platform-prod.xml" "out/" || true
}


#
#  sig_hand - manages cleanup if the build is aborted
#
sig_hand () {
    trap "" ERR SIGINT SIGTERM
    set +e
    echo "signal trapped"
    echo "sig_hand begin $$" >> /tmp/sig_hand.log
    if [ "$lxc_name" != "" ]; then
        copy_common "$ACTION"
        copy_prod

        echo "Destroying [$lxc_name] lxc"
        if [ "$LXC_DESTROY" = "true" ]; then
            sudo $LXC_KILL -n $lxc_name
        fi
    fi
    if [ -f /tmp/packager.eph.$$.log ]; then
        rm /tmp/packager.eph.$$.log
    fi

    echo "sig_hand end $$" >> /tmp/sig_hand.log
    exit 1
}


#
#  MAIN
#
BUILD_FLAGS=""

trap sig_hand SIGINT SIGTERM
trap sig_hand ERR

echo "sig_hand trap $$" >> /tmp/sig_hand.log

# create folder to save logs
if [ ! -d "out" ]; then
    mkdir "out"
fi

#  args management
while [ $# -gt 0 ]; do
    case $1 in
        devtest)
            if [ $# -lt 1 ]; then
                usage 1
            fi
            ACTION="$1"
            devtest_run $(echo "$2" | sed 's@.*/@@g')
            break
            ;;
        *)
            usage 1
            break
            ;;
    esac
    BUILD_FLAGS="$BUILD_FLAGS $1"
    shift
done

exit 0

