import os
import csv
import codecs

from django.core.management.base import BaseCommand, CommandError
from ordd_api.models import Country

FILEIN_DEFAULT = os.path.join('contents', 'countries',
                              'country_groups.csv')


class Command(BaseCommand):
    help = 'Verify codes of countries included in country groups'

    def add_arguments(self, parser):
        parser.add_argument('--filein', nargs=1, type=str,
                            help='path of csv input file')

    def handle(self, *args, **options):
        try:
            filein = getattr(args, 'filein', FILEIN_DEFAULT)

            with codecs.open(filein,
                             'rb', encoding='utf-8') as csvfile:
                next(csvfile)
                country_groups = csv.reader(csvfile,
                                            delimiter=',')

                for country_group in country_groups:
                    cg_name = country_group[0]
                    # cg_id = country_group[1]
                    cg_countries = country_group[2:]

                    print(cg_name)
                    row_end = False
                    already_there = []
                    for country_id in cg_countries:
                        if country_id == '':
                            row_end = True
                            continue
                        else:
                            if row_end is True:
                                raise Exception(
                                    'For country %s there are empty columns'
                                    ' for related countries' % cg_name)
                        if country_id in already_there:
                            raise Exception(
                                'Country %s already in the list'
                                % country_id)

                        try:
                            country = Country.objects.get(iso2=country_id)
                            already_there.append(country_id)
                        except:
                            raise Exception(
                                'Country %s not found' % country_id)

                        print('  %s: %s' % (country.iso2, country.name))

            self.stdout.write(self.style.SUCCESS(
                'CSV defining country-groups is consistent with the current'
                ' countries list'))

        except Exception as ex:
            raise CommandError(
                'CSV defining country-groups is inconsistent with the current'
                ' country list,\ncheck failed with exception of'
                ' class %s and error string:\n  %s.' % (ex.__class__, ex))
