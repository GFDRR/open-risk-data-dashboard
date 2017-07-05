from collections import namedtuple
from django.core.management.base import BaseCommand, CommandError
import csv
import codecs
import warnings
from ordd_api.models import (KeyCategory, KeyHazardCategory, KeyPeril, KeyTag,
                             KeyTagGroup, KeyDatasetName, KeyDescription,
                             KeyScale, KeyDataset)

KeyDataset_in = namedtuple('KeyDataset_in', 'category id hazard_category'
                           ' dataset tag description comment format resolution'
                           ' RiverFlooding CoastalFlooding Tsunami Cyclone'
                           ' Earthquake Vulcano Landslide WaterScarcity'
                           ' international national local weight')


class Command(BaseCommand):
    help = 'Populare Peril, Category, KeyDataset and all related tables'

    def add_arguments(self, parser):
        parser.add_argument(
            '--filein', nargs=4, type=str, required=True,
            help=('path of peril csv file, weighted category csv file,'
                  ' tags csv file, weighted key datasets csv file'))
        parser.add_argument(
            '--reload', action='store_true',
            help='reload tables if already exists', required=False)

    def handle(self, *args, **options):
        try:
            # load perils
            with (codecs.open(options['filein'][0], 'rb',
                  encoding='utf-8')) as csvfile:
                if options['reload']:
                    KeyPeril.objects.all().delete()

                perils = csv.reader(csvfile)
                for peril_in in perils:
                    peril = KeyPeril(name=peril_in[0])
                    peril.save()

        except Exception as e:
            print(e)
            raise CommandError('Failed to import Key Datasets during peril'
                               ' import phase.')

        try:
            # load categories
            with (codecs.open(options['filein'][1], 'rb',
                  encoding='utf-8')) as csvfile:
                if options['reload']:
                    KeyCategory.objects.all().delete()

                categories = csv.reader(csvfile)
                for category_in in categories:
                    category = KeyCategory(code=category_in[0],
                                           name=category_in[1],
                                           weight=category_in[2])
                    category.save()

        except Exception as e:
            print(e)
            raise CommandError('Failed to import Key Datasets during category'
                               ' import phase.')
        try:
            # load tags
            with (codecs.open(options['filein'][2], 'rb',
                  encoding='utf-8')) as csvfile:
                if options['reload']:
                    KeyTag.objects.all().delete()
                    KeyTagGroup.objects.all().delete()

                tags = csv.reader(csvfile)
                for tag_in in tags:
                    tag_group = KeyTagGroup.objects.get_or_create(
                                                            name=tag_in[0])
                    tag = KeyTag(group=tag_group[0], name=tag_in[1])
                    tag.save()
        except Exception as e:
            print(e)
            raise CommandError('Failed to import Key Datasets during tags'
                               ' import phase.')

        kd_row = -1
        try:
            with (codecs.open(options['filein'][3], 'rb',
                  encoding='utf-8')) as csvfile:
                keydatasets = csv.reader(csvfile)

                if options['reload']:
                    KeyDatasetName.objects.all().delete()
                    KeyDescription.objects.all().delete()
                    KeyScale.objects.all().delete()
                    KeyDataset.objects.all().delete()

                scale = KeyScale(name='International')
                scale.save()
                scale = KeyScale(name='National')
                scale.save()
                scale = KeyScale(name='Local')
                scale.save()

                # prev_cat = None
                # cat_cur = None

                for kd_row, kd_in in enumerate(keydatasets):
                    if kd_in[0] == '' or kd_in[0] == 'NN':
                        continue

                    composite_id = kd_in[0].split('_')
                    composite_ds = kd_in[1].split(' - ')

                    if len(composite_ds) == 2:
                        hazard_category = composite_ds[0]
                        dataset = composite_ds[1]
                    elif len(composite_ds) == 1:
                        hazard_category = None
                        dataset = composite_ds[0]
                    else:
                        raise ValueError('Too many \'-\' separators in'
                                         ' dataset \'%s\'' % kd_in[1])

                    keyobj_in = KeyDataset_in(
                        category=KeyCategory.objects.get(code=composite_id[0]),
                        id=kd_in[0], hazard_category=hazard_category,
                        dataset=dataset, tag=kd_in[2], description=kd_in[3],
                        comment=kd_in[4], format=kd_in[5], resolution=kd_in[6],
                        RiverFlooding=kd_in[7], CoastalFlooding=kd_in[8],
                        Tsunami=kd_in[9], Cyclone=kd_in[10],
                        Earthquake=kd_in[11], Vulcano=kd_in[12],
                        Landslide=kd_in[13], WaterScarcity=kd_in[14],
                        international=kd_in[15], national=kd_in[16],
                        local=kd_in[17], weight=kd_in[18])

                    # Category
                    category = KeyCategory.objects.filter(
                                                    name=keyobj_in.category)
                    if len(category) != 1:
                        raise ValueError('Category: [%s] not exists in list'
                                         % keyobj_in.category)
                    category = category[0]

                    # HazardCategory
                    if keyobj_in.hazard_category:
                        hazard_category = (
                                    KeyHazardCategory.objects.get_or_create(
                                             name=keyobj_in.hazard_category))
                        hazard_category = hazard_category[0]

                    # DatasetName
                    dataset = KeyDatasetName.objects.get_or_create(
                                                    name=keyobj_in.dataset)
                    dataset = dataset[0]

                    # TagGroup
                    if keyobj_in.tag == '':
                        tag = None
                    else:
                        tag = KeyTagGroup.objects.filter(
                                                    name__iexact=keyobj_in.tag)
                        if len(tag) != 1:
                            raise ValueError('Tag group: [%s] not exists'
                                             ' in list' % keyobj_in.tag)
                        tag = tag[0]

                    # Description
                    description = KeyDescription.objects.get_or_create(
                                     name=keyobj_in.description)
                    description = description[0]

                    keydata = KeyDataset(
                        code=keyobj_in.id, category=category, dataset=dataset,
                        description=description,
                        hazard_category=hazard_category, tag_group=tag,
                        resolution=keyobj_in.resolution,
                        format=keyobj_in.format,
                        comment=keyobj_in.comment, weight=keyobj_in.weight)

                    names = {'international': 'International',
                             'national': 'National',
                             'local': 'Local'}
                    ct = 0
                    for sca_field in ['international', 'national', 'local']:
                        cur_value = getattr(keyobj_in, sca_field, None)
                        if cur_value is not None:
                            cur_value = cur_value.strip()
                            if cur_value == '':
                                continue
                        else:
                            continue

                        scale = KeyScale.objects.filter(name=names[sca_field])
                        ct += 1

                    if ct != 1:
                        keydata.scale = KeyScale.objects.get(name='National')
                        warnings.warn('Keydataset from row %d isn\'t assinged'
                                      ' to any applicability level:'
                                      ' \'National\' will be used then.'
                                      % (kd_row), Warning)
                    else:
                        keydata.scale = scale[0]

                    keydata.save()

                    for app in ['River flooding', 'Coastal flooding',
                                'Tsunami', 'Cyclone', 'Earthquake',
                                'Vulcano', 'Landslide', 'Water scarcity']:
                        cur_value = getattr(keyobj_in,
                                            app.title().replace(' ', ''),
                                            None)
                        if cur_value is not None:
                            cur_value = cur_value.strip()
                            if cur_value == '':
                                continue
                        else:
                            continue

                        peril = KeyPeril.objects.filter(name=app)
                        if len(peril) != 1:
                            raise ValueError('Peril: [%s] not match 1'
                                             ' peril item' % app)

                        keydata.applicability.add(peril[0])

        except Exception as e:
            print(e)
            raise CommandError('Import Category and SubCategory failed at'
                               ' row %d.' % kd_row)

        self.stdout.write(self.style.SUCCESS('Successfully imported Peril,'
                                             ' Category, KeyDataset and all'
                                             ' related tables.'))
