# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2018-11-16 13:59
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ordd_api', '0031_thinkhazard2018'),
    ]

    operations = [
        migrations.AlterField(
            model_name='country',
            name='region',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='ordd_api.Region'),
        ),
    ]
