# -*- coding: utf-8 -*-
# Generated by Django 1.11.18 on 2019-02-04 15:24
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ordd_api', '0035_dataset_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataset',
            name='score_new',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='dataset',
            name='score_new_cat',
            field=models.IntegerField(default=-1),
        ),
    ]
