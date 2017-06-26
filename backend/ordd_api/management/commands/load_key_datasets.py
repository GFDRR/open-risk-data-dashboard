from collections import namedtuple
from django.core.management.base import BaseCommand, CommandError
import csv, codecs
from ordd_api.models import (Category, Peril, KeyDataset,
                             LevDataset, LevDescription, LevScale)

# key dataset input rows description:
# (category), ID,Dataset,Description,Format,Flood,Tsunami,
#             Cyclones,Earthquakes,Vulcano,Global,National,Local, (weight)
KeyDataset_in = namedtuple('KeyDataset_in', 'category id dataset description format Flood Tsunami'
                           ' Cyclone Earthquake Vulcano glob national local comment weight')


class Command(BaseCommand):
    help = 'Populare Peril, Category, KeyDataset and all Lev* related tables'

    def add_arguments(self, parser):
        parser.add_argument(
            '--filein', nargs=3, type=str, required=True,
            help='path of peril csv file, weighted category csv file, weighted key datasets csv file')
        parser.add_argument(
            '--reload', action='store_true',
            help='reload tables if already exists', required=False)


    def handle(self, *args, **options):
        try:
            # load perils
            with codecs.open(options['filein'][0], 'rb', encoding='utf-8') as csvfile:
                if options['reload']:
                    Peril.objects.all().delete()

                perils = csv.reader(csvfile)
                for peril_in in perils:
                    peril = Peril(name=peril_in[0])
                    peril.save()

        except Exception as e:
            print(e)
            raise CommandError('Failed to import Key Datasets during peril import phase.')

        try:
            # load categories
            with codecs.open(options['filein'][1], 'rb', encoding='utf-8') as csvfile:
                if options['reload']:
                    Category.objects.all().delete()

                categories = csv.reader(csvfile)
                for category_in in categories:
                    category = Category(name=category_in[0], weight=category_in[1])
                    category.save()

        except Exception as e:
            print(e)
            raise CommandError('Failed to import Key Datasets during category import phase.')

        kd_row = -1
        try:
            with codecs.open(options['filein'][2], 'rb', encoding='utf-8') as csvfile:
                keydatasets = csv.reader(csvfile)

                if options['reload']:
                    LevDataset.objects.all().delete()
                    LevDescription.objects.all().delete()
                    LevScale.objects.all().delete()
                    KeyDataset.objects.all().delete()

                scale = LevScale(name='Global')
                scale.save()
                scale = LevScale(name='National')
                scale.save()
                scale = LevScale(name='Local')
                scale.save()

                # prev_cat = None
                # cat_cur = None

                for kd_row, kd_in in enumerate(keydatasets):
                    keyobj_in = KeyDataset_in(
                        category=kd_in[0], id=kd_in[1], dataset=kd_in[2], description=kd_in[3], format=kd_in[4],
                        Flood=kd_in[6], Tsunami=kd_in[7], Cyclone=kd_in[8], Earthquake=kd_in[9],
                        Vulcano=kd_in[10], glob=kd_in[11], national=kd_in[12], local=kd_in[13], comment=kd_in[14],
                        weight=kd_in[15])

                    category = Category.objects.filter(name=keyobj_in.category)
                    if len(category) != 1:
                        raise ValueError('Category: [%s] not exists in list' % keyobj_in.category)
                    category = category[0]

                    dataset = LevDataset.objects.filter(name=keyobj_in.dataset)
                    if len(dataset) < 1:
                        dataset = LevDataset(name=keyobj_in.dataset)
                        dataset.save()
                    else:
                        dataset = dataset[0]

                    description = LevDescription.objects.filter(name=keyobj_in.description)
                    if len(description) < 1:
                        description = LevDescription(name=keyobj_in.description)
                        description.save()
                    else:
                        description = description[0]

                    keydata = KeyDataset(
                        code=keyobj_in.id, category=category, dataset=dataset, description=description,
                        format=keyobj_in.format, comment=keyobj_in.comment, weight=keyobj_in.weight)

                    names = {'glob': 'Global', 'national': 'National', 'local': 'Local'}
                    ct = 0
                    for sca_field in ['glob', 'national', 'local']:
                        cur_value = getattr(keyobj_in, sca_field, None)
                        if cur_value is not None:
                            cur_value = cur_value.strip()
                            if cur_value == '':
                                continue
                        else:
                            continue

                        scale = LevScale.objects.filter(name=names[sca_field])
                        ct += 1

                    if ct != 1:
                        raise ValueError('Scale: number of associated scale not 1 (%d) for row %d' % (ct, kd_row))

                    keydata.scale = scale[0]
                    keydata.save()

                    for app in ['Flood', 'Tsunami', 'Cyclone', 'Earthquake', 'Vulcano']:
                        cur_value = getattr(keyobj_in, app, None)
                        if cur_value is not None:
                            cur_value = cur_value.strip()
                            if cur_value == '':
                                continue
                        else:
                            continue

                        peril = Peril.objects.filter(name=app)
                        if len(peril) != 1:
                            raise ValueError('Peril: [%s] not match 1 peril item' % app)

                        keydata.applicability.add(peril[0])

        except Exception as e:
            print(e)
            raise CommandError('Import Category and SubCategory failed at row %d.' % kd_row)

        self.stdout.write(self.style.SUCCESS('Successfully imported Peril, Category, KeyDataset and all related Lev* tables.'))

