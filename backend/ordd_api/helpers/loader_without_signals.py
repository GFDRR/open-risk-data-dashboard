#!/usr/bin/env python
import os
from ordd_api.helpers.sig_management import (designals, resignals, printsignals)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ordd.settings")
from django.core.management import call_command
# exec(open('/home/ubuntu/sig-management.py').read(),{'signalnames': None, 'designals': None, 'resignals': None, 'printsignals': None})
designals()
call_command('loaddata', '/home/ubuntu/dump_full.json')
resignals()
