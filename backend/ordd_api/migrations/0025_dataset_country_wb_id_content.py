# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-08-11 11:50

from django.db import migrations


def forwards_func(apps, schema_editor):
    db_alias = schema_editor.connection.alias

    Dataset = apps.get_model("ordd_api", "Dataset")
    datasets = Dataset.objects.using(db_alias).all()

    for dataset in datasets:
        country = dataset.country
        dataset.country_wb_id = country.iso2
        dataset.save()


def backwards_func(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('ordd_api', '0024_dataset_country_wb_id_schema'),
    ]

    operations = [
        migrations.RunPython(forwards_func, backwards_func),
    ]