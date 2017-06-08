#!/bin/bash

# OVERRIDABLE VARIABLES

# admin password
ORDD_ADMIN_PASSWORD="${ORDD_ADMIN_PASSWORD:-adminadmin}"
# listen port
ORDD_SERVER_PORT="${ORDD_SERVER_PORT:-8000}"

if [ $_ != $0 ]; then
    BASE_DIR="$(dirname $BASH_SOURCE)"
    if [ -z "$VIRTUAL_ENV" ]; then
        source $HOME/venv/bin/activate
    fi
    cd "$BASE_DIR"
    python3 ./manage.py runserver 0.0.0.0:${ORDD_SERVER_PORT} &
    echo "ssh -L 127.0.1.1:8000:127.0.1.1:${ORDD_SERVER_PORT} <your-django-machine>"
    echo "and then connect your browser to localhost.localdomain:8000"
    cd -
    return 0
fi

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

# generate content
if [ -n "$GENERATE_FROM_SOURCES" ]; then
    pushd "${BASE_DIR}/contents/countries"
    ./process.sh
    popd
fi

# manage migrations
cd "$BASE_DIR"
python3 manage.py makemigrations api_exp01
python3 manage.py makemigrations ordd_api
python3 manage.py migrate

echo "from django.contrib.auth.models import User ; User.objects.create_superuser(username='admin', password='$ORDD_ADMIN_PASSWORD', email='admin@openquake.org')" | python3 manage.py shell

python3 manage.py load_countries --filein contents/countries/ordd_countries_list_iso3166.csv
python3 manage.py jenkins
cd -

cp "$BASE_DIR/reports/junit.xml" ./dev_xunit.xml
