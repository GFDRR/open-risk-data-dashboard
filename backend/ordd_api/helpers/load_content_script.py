#!/usr/bin/env python
import os
import django
django.setup()
from django.contrib.auth.models import User, Group
import django.conf as conf


def main():
    print("\n%s DBNAME [%s]\n" % (
        __file__, conf.settings.DATABASES['default']['NAME']))
    ORDD_ADMIN_PASSWORD = os.environ.get('ORDD_ADMIN_PASSWORD')
    gr_adm = Group(name='admin')
    gr_adm.save()
    gr_rev = Group(name='reviewer')
    gr_rev.save()

    us = User.objects.create_superuser(
        username='admin', password=ORDD_ADMIN_PASSWORD,
        email='admin@openquake.org')
    gr_adm.user_set.add(us)

    us = User.objects.create_user(
        username='admin_user', password=ORDD_ADMIN_PASSWORD,
        email='admin_user@openquake.org', first_name='Ängstrom',
        last_name='Fiordsson', is_staff=True)

    gr_adm.user_set.add(us)
    us.profile.title = 'Dr'
    us.profile.institution = 'CIMA Foundation'
    us.profile.save()

    us = User.objects.create_user(
        username='reviewer_user', password=ORDD_ADMIN_PASSWORD,
        first_name='Rosalinde', last_name='Flashâk')
    us.save()
    gr_rev.user_set.add(us)
    us.profile.title = 'Drs'
    us.profile.institution = 'GEM Foundation'
    us.profile.save()

    us = User.objects.create_user(
        username='normal_user', password=ORDD_ADMIN_PASSWORD,
        first_name='Giuseppe', last_name='Verdi')
    us.save()
    us.profile.title = 'Maestro'
    us.profile.institution = 'Conservatorio di Busseto'
    us.profile.save()

if __name__ == "__main__":
    main()
