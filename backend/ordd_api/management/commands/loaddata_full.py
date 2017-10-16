from django.core.management.base import BaseCommand, CommandError
import csv, codecs
from ordd_api.models import Region, Country
from ordd_api.lib.sig_management import (designals, resignals,
                                             printsignals)
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Import json dump without trigger any signal'

    def add_arguments(self, parser):
        parser.add_argument('--filein', nargs=1, type=str,
                            help='json dump file')

    def handle(self, *args, **options):
#        try:
        printsignals()
        designals()
        call_command('loaddata', options['filein'][0])
        resignals()
        printsignals()
        self.stdout.write(self.style.SUCCESS('Successfully imported data.'))
#        except Exception:
#            raise CommandError('Data import failed.')
