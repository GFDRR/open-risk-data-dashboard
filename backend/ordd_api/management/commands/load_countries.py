from django.core.management.base import BaseCommand, CommandError
import csv, codecs
from ordd_api.models import Region, Country

class Command(BaseCommand):
    help = 'Populare Region and Country tables'

    def add_arguments(self, parser):
        parser.add_argument('--filein', nargs=1, type=str, help='path of csv input file')
        parser.add_argument('--reload', action='store_true', help='reload tables if already exists', required=False)


    def handle(self, *args, **options):
        try:
            with codecs.open(options['filein'][0], 'rb', encoding='utf-8') as csvfile:
                countries = csv.reader(csvfile, delimiter=',')

                if options['reload']:
                    Country.objects.all().delete()
                    Region.objects.all().delete()

                region_cur = None
                for country_in in countries:
                    if country_in[1]:
                        region_cur = Region(name=country_in[1])
                        region_cur.save()
                    country = Country(iso3=country_in[0], name=country_in[2], region=region_cur)
                    country.save()

                self.stdout.write(self.style.SUCCESS('Successfully imported Regions and Countries"'))
        except Exception:
            raise CommandError('Import Regions and Countries failed')
