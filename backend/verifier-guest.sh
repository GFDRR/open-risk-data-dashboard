#!/bin/bash
set -e
#display each command before executing it
set -x

BRANCH_ID="$1"

#
#  code
#
BASE_DIR="$(dirname $0)"

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
# cleanups
if [ -d venv ]; then
    rm -rf venv
fi

if [ -f "$BASE_DIR/db.sqlite3" ]; then
    rm "$BASE_DIR/db.sqlite3"
fi

# remove previous tests result file
if [ -f xunit-dev.xml ]; then
    rm xunit-dev.xml
fi

#
#  MAIN
#
if [ -f .gem_init.sh ]; then
    . .gem_init.sh
fi

sudo apt-get -y --force-yes update
sudo apt-get -y --force-yes upgrade

sudo apt-get -y --force-yes install python-virtualenv python3-virtualenv python-pip


virtualenv -p /usr/bin/python3 venv
. venv/bin/activate
pip install -r $BASE_DIR/requirements.txt

# manage migrations
cd "$BASE_DIR"
python3 manage.py makemigrations api_exp01
python3 manage.py migrate

python3 manage.py jenkins
cd -

cp "$BASE_DIR/reports/junit.xml" ./xunit-dev.xml
