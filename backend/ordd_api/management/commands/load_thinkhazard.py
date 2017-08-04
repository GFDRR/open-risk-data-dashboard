import os
from django.core.management.base import BaseCommand, CommandError
from pprint import pprint
import json, codecs
from ordd_api.models import Country

class Command(BaseCommand):
    help = 'Populare Region and Country tables'

    def add_arguments(self, parser):
        parser.add_argument('--datapath', nargs=1, type=str,
                            help='path where found json files')

    def handle(self, *args, **options):
        country_mapping = {
            "Iran": "Iran  (Islamic Republic of)",
            "the Republic of Korea": "Dem People's Rep of Korea",
            "Czechia": "Czech Republic",
            "Macedonia": "The former Yugoslav Republic of Macedonia",
            "Moldova": "Moldova, Republic of",
            # does is it the right approssimation ?
            "United Kingdom of Great Britain and Northern Ireland":
                "United Kingdom",
            "Cabo Verde": "Cape Verde",
            "the Democratic Republic of the Congo":
                "Democratic Republic of the Congo",
            "the Congo": "Congo",
            # does is it the right approssimation ? 
            "Saint Helena, Ascension and Tristan da Cunha": "Saint Helena",
            "Tanzania": "United Republic of Tanzania",
            "Western Sahara*": "Western Sahara",
        }
        try:
            th_data = []

            for filename in os.listdir(options['datapath'][0]):
                if (filename.startswith("adm_division_") and
                        filename.endswith(".json")):
                    with codecs.open(
                            os.path.join(options['datapath'][0], filename),
                            'rb', encoding='utf-8') as json_file:
                        th_data += json.load(json_file)['data']

            found = 0
            not_found = 0
            for country in Country.objects.all().order_by('id'):
                if country.name in country_mapping:
                    country_name = country_mapping[country.name]
                else:
                    country_name = country.name

                for th in th_data:
                    if 'admin0' not in th:
                        continue
                    if th['admin0'] == country_name:
                        if 'admin1' in th:
                            # print("FOUND BUT WITH admin1, continue")
                            continue
                        print("Found: %d) %s: %s" % (
                            country.id, country_name, th['code']))
                        found += 1
                        break
                else:
                    print("%d) %s NOT FOUND" % (country.id, country_name))
                    not_found += 1

            print("Report: found %d, Not found %d" % (found, not_found))
            self.stdout.write(self.style.SUCCESS(
                'Successfully imported Regions and Countries.'))
        except KeyError:
            raise CommandError('Import Regions and Countries failed.')
