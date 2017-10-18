#!/bin/bash
underscore="$_"

if [ "$1" = "-p" -o "$1" == "--populate" ]; then
     cat "$0" | sed -n '/^# Vars section: BEGIN/,/^# Vars section: END/p;/^# Populate DB section: BEGIN/,/^# Populate DB section: END/p' | bash
    exit 0
fi

# OVERRIDABLE VARIABLES
# Vars section: BEGIN
ORDD_VENV="${ORDD_VENV:-venv}"
# admin password
ORDD_ADMIN_PASSWORD="${ORDD_ADMIN_PASSWORD:-adminadmin}"
export ORDD_ADMIN_PASSWORD
# listen port
ORDD_SERVER_PORT="${ORDD_SERVER_PORT:-8000}"
# skip ubuntu updates
ORDD_SKIP_APT_UPDATE="${ORDD_SKIP_APT_UPDATE:-}"

# name for database
ORDD_DB_NAME="${ORDD_DB_NAME:-ordd_dev}"
# username for database
ORDD_DB_USER="${ORDD_DB_USER:-ordd_dev}"
# password for database
ORDD_DB_PASSWD="${ORDD_DB_PASSWO:-the_db_password}"
# Vars section: END

if [ "$underscore" != "$0" ]; then
    BASE_DIR="$(dirname $BASH_SOURCE)"
    if [ -z "$VIRTUAL_ENV" ]; then
        source $HOME/$ORDD_VENV/bin/activate
    fi
    cd "$BASE_DIR"
    python3 ./manage.py runserver --nothreading 0.0.0.0:${ORDD_SERVER_PORT} &
    echo "ssh -L 127.0.1.1:8000:127.0.1.1:${ORDD_SERVER_PORT} <your-django-machine>"
    echo "and then connect your browser to localhost.localdomain:8000"
    cd -
    return 0
fi

# exit with error at the first command failure
set -e
# #display each command before executing it
# set -x

BRANCH_ID="$1"

#
#  code
#
export BASE_DIR="$(dirname $0)"

#
#  checks
if [ "$PWD" != "$HOME" ]; then
    echo "Run this script from home directory"
    exit 1
fi

if [ -n "$VIRTUAL_ENV" ]; then
    echo "Virtualenv already set to [$VIRTUAL_ENV], deactivate an run again."
    exit 2
fi


#
#  MAIN
#
if [ -f .gem_init.sh ]; then
    . .gem_init.sh
fi

if [ -z "$ORDD_SKIP_APT_UPDATE" ]; then
    sudo apt-get -y --force-yes update
    sudo apt-get -y --force-yes upgrade
fi
sudo apt-get -y --force-yes install curl python-virtualenv python3-virtualenv python-pip procps postgresql

#
#  CLEANUP
#

# remove previous environment
if [ -d $ORDD_VENV ]; then
    rm -rf $ORDD_VENV
fi

# remove previous tests result file
if [ -f xunit-dev.xml ]; then
    rm xunit-dev.xml
fi

# remove previous database
cat <<EOF | sudo -i -u postgres psql -e
DROP DATABASE IF EXISTS $ORDD_DB_NAME;
DROP USER IF EXISTS $ORDD_DB_NAME;
EOF



virtualenv -p /usr/bin/python3 $ORDD_VENV
. $ORDD_VENV/bin/activate
pip install -r $BASE_DIR/requirements.txt

# generate content
if [ -n "$GENERATE_FROM_SOURCES" ]; then
    pushd "${BASE_DIR}/contents/countries"
    ./process.sh
    popd
fi

# create database
cat <<EOF | sudo -i -u postgres psql -e
CREATE USER $ORDD_DB_USER WITH PASSWORD '$ORDD_DB_PASSWD';
-- CREATEDB for user is required to run tests
ALTER USER  $ORDD_DB_USER CREATEDB;
CREATE DATABASE $ORDD_DB_NAME;
ALTER ROLE $ORDD_DB_NAME SET client_encoding TO 'utf8';
ALTER ROLE $ORDD_DB_NAME SET default_transaction_isolation TO 'read committed';
ALTER ROLE $ORDD_DB_NAME SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE $ORDD_DB_NAME TO $ORDD_DB_USER;
EOF

# configure settings
cd "$BASE_DIR"
cp ordd/settings.py.tmpl ordd/settings.py
IFS='
'
for rep in $(env | grep '^ORDD_CONF__' | sed 's/=.*//g'); do
    rep_name="$(echo "$rep" | sed 's/^ORDD_CONF__//g')"
    rep_value="${!rep}"
    sed -i "s|^$rep_name[ =].*|$rep_value|g" ordd/settings.py
done

# replace db values
for rep in ORDD_DB_NAME ORDD_DB_USER ORDD_DB_PASSWD; do
    rep_name="#${rep}#"
    rep_value="${!rep}"
    sed -i "s|$rep_name|$rep_value|g" ordd/settings.py
done

# Populate DB section: BEGIN - use "cat ./verifer_guest.sh | sed -n '/^# Vars section: BEGIN/,/^# Vars section: END/p;/# Populate DB section: BEGIN /,/# Populate DB section: END/p' | bash"

python3 manage.py makemigrations api_exp01
python3 manage.py makemigrations ordd_api

# migrate all apps except ordd_api
for app in $(python ./manage.py showmigrations -p | grep '^\[ \]' | grep -v ordd_api | cut -c 6-  | sed 's/\..*//g' | uniq); do
    python3 manage.py migrate $app
done

# NOTE: we stop to optin_insert_time to be able to load v8 dataset, than we migrate the rest
python3 manage.py migrate ordd_api 0012_optin_insert_time

echo "from django.contrib.auth.models import Group ; gr = Group(name='admin'); gr.save(); gr = Group(name='reviewer'); gr.save();" | python3 manage.py shell

echo "from django.contrib.auth.models import User, Group ; us = User.objects.create_superuser(username='admin', password='$ORDD_ADMIN_PASSWORD', email='admin@openquake.org'); g = Group.objects.get(name='admin'); g.user_set.add(us);" | python3 manage.py shell

echo "from django.contrib.auth.models import User, Group ; us = User.objects.create_user(username='admin_user', password='$ORDD_ADMIN_PASSWORD', email='admin_user@openquake.org', first_name='Ängstrom', last_name='Fiordsson', is_staff=True); g = Group.objects.get(name='admin'); g.user_set.add(us); us.profile.title = 'Dr'; us.profile.institution = 'CIMA Foundation'; us.profile.save()" | python3 manage.py shell

echo "from django.contrib.auth.models import User, Group ; us = User.objects.create_user(username='reviewer_user', password='$ORDD_ADMIN_PASSWORD', first_name='Rosalinde', last_name='Flashâk'); us.save(); g = Group.objects.get(name='reviewer'); g.user_set.add(us); us.profile.title = 'Drs'; us.profile.institution = 'GEM Foundation'; us.profile.save()" | python3 manage.py shell

echo "from django.contrib.auth.models import User, Group ; us = User.objects.create_user(username='normal_user', password='$ORDD_ADMIN_PASSWORD', first_name='Giuseppe', last_name='Verdi'); us.save(); us.profile.title = 'Maestro'; us.profile.institution = 'Conservatorio di Busseto'; us.profile.save()" | python3 manage.py shell

python3 manage.py load_countries --filein contents/countries/ordd_countries_list_iso3166.csv
python3 manage.py load_key_datasets --reload --filein contents/key_datasets/kd-categories.csv contents/key_datasets/kd-tags.csv contents/key_datasets/kd-datasets.csv
python3 manage.py load_thinkhazard --datapath ./contents/thinkhazard/cache

python3 manage.py migrate ordd_api
# Populate DB section: END

cd $HOME

. $0
last_pid="$!"

sleep 5
$BASE_DIR/ordd_api/helpers/ordd_test.sh

kill $(pgrep -P $last_pid) $last_pid

cd $BASE_DIR
python3 manage.py jenkins -v 3
cd -

cp "$BASE_DIR/reports/junit.xml" ./dev_xunit.xml
