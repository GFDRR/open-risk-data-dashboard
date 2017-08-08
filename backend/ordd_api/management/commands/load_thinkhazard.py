import os
from time import sleep
from django.core.management.base import BaseCommand, CommandError
from urllib import request
import json
import codecs
from ordd_api.models import Country, KeyPeril

REPORT_URL = "http://thinkhazard.org/en/report/%s.json"


class Command(BaseCommand):
    help = 'Populare Region and Country tables'

    def add_arguments(self, parser):
        parser.add_argument('--datapath', nargs=1, type=str,
                            help='path where found json files')

    def handle(self, *args, **options):
        peril_mapping = {
            "FL": "River flooding",
            "UF": None,
            "CF": "Coastal flooding",
            "EQ": "Earthquake",
            "LS": "Landslide",
            "TS": "Tsunami",
            "VA": "Vulcano",
            "CY": "Cyclone",
            "DG":  "Water scarcity",
            "EH": None,
            "WF": None
            }

        level_mapping = {
            "HIG": True,
            "MED": True,
            "LOW": False,
            "VLO": False,
            "no-data": False,
            }

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

            peril_instances = KeyPeril.objects.all()
            peril = {}
            for peril_instance in peril_instances:
                peril[peril_instance.name] = peril_instance

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
                country.thinkhazard_appl.clear()

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

                        # here data loading
                        data = request.urlopen(REPORT_URL % th['code'])
                        reader = codecs.getreader("utf-8")
                        appls = json.load(reader(data))
                        for appl in appls:
                            # print(appl)
                            th_peril = appl['hazardtype']['mnemonic']
                            peril_name = peril_mapping[th_peril]
                            if peril_name is None:
                                continue
                            th_level = appl['hazardlevel']['mnemonic']
                            level = level_mapping[th_level]
                            if not level:
                                continue
                            country.thinkhazard_appl.add(peril[peril_name])
                        break
                else:
                    print("%d) %s NOT FOUND" % (country.id, country_name))
                    not_found += 1

                sleep(1)
            print("Report: found %d, Not found %d" % (found, not_found))
            self.stdout.write(self.style.SUCCESS(
                'Successfully imported ThinkHazard! countries '
                'applicabilities.'))

        except Exception as ex:
            raise CommandError(
                'Import ThinkHazard! countries applicabilities failed with '
                'exception of class %s and error string %s.' % (
                    ex.__class__, ex))
