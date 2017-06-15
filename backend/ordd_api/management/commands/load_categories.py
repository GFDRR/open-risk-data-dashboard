from django.core.management.base import BaseCommand, CommandError
import csv, codecs
from ordd_api.models import Category, SubCategory

class Command(BaseCommand):
    help = 'Populare Category and SubCategory tables'

    def add_arguments(self, parser):
        parser.add_argument(
            '--filein', nargs=2, type=str,
            help='path of psv input files (taxonomy-categories.csv and taxonomy-subcategories.csv)')
        parser.add_argument(
            '--reload', action='store_true',
            help='reload tables if already exists', required=False)


    def handle(self, *args, **options):
        try:
            with codecs.open(options['filein'][1], 'rb', encoding='utf-8') as psvfile:
                subcategories = csv.reader(psvfile, delimiter='|')

                if options['reload']:
                    Category.objects.all().delete()
                    SubCategory.objects.all().delete()

                prev_cat = None
                cat_cur = None
                for subcat_in in subcategories:
                    print(subcat_in[1])
                    if prev_cat != subcat_in[0]:
                        prev_cat = subcat_in[0]
                        cat_cur = Category(name=subcat_in[0], weight=100)
                        cat_cur.save()
                    subcat_cur = SubCategory(name=subcat_in[1], category=cat_cur)
                    subcat_cur.save()

        except Exception:
            raise CommandError('Import Category and SubCategory failed.')


        # set Category weight
        try:
            with codecs.open(options['filein'][0], 'rb', encoding='utf-8') as psvfile:
                categories = csv.reader(psvfile, delimiter='|')
                for cat_in in categories:
                    cat_cur = Category.objects.filter(name=cat_in[0])
                    if len(cat_cur) != 1:
                        raise CommandError('Category query return a number of items not equal to 1')
                    cat_cur[0].weight = int(cat_in[1])
                    cat_cur[0].save()
        except Exception:
            raise CommandError('Import Category and SubCategory failed.')
                
                
        self.stdout.write(self.style.SUCCESS('Successfully imported Category and SubCategory.'))
                
                
        
