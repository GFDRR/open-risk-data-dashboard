# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-06-17 09:35
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import ordd_api.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=64, unique=True)),
                ('weight', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Country',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('iso2', models.CharField(max_length=2, unique=True)),
                ('name', models.CharField(max_length=64, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='KeyDataset',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.IntegerField()),
                ('format', models.CharField(max_length=32)),
                ('comment', models.CharField(max_length=1024)),
                ('weight', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='LevDataset',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='LevDescription',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='LevResolution',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='LevScale',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=32, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='OptIn',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(default=ordd_api.models.my_random_key, max_length=16)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Peril',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=32, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=256)),
                ('institution', models.CharField(blank=True, max_length=256)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Region',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=64)),
            ],
        ),
        migrations.AddField(
            model_name='keydataset',
            name='applicability',
            field=models.ManyToManyField(to='ordd_api.Peril'),
        ),
        migrations.AddField(
            model_name='keydataset',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ordd_api.Category'),
        ),
        migrations.AddField(
            model_name='keydataset',
            name='dataset',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ordd_api.LevDataset'),
        ),
        migrations.AddField(
            model_name='keydataset',
            name='description',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ordd_api.LevDescription'),
        ),
        migrations.AddField(
            model_name='keydataset',
            name='resolution',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='ordd_api.LevResolution'),
        ),
        migrations.AddField(
            model_name='keydataset',
            name='scale',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ordd_api.LevScale'),
        ),
        migrations.AddField(
            model_name='country',
            name='region',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ordd_api.Region'),
        ),
        migrations.AlterUniqueTogether(
            name='keydataset',
            unique_together=set([('category', 'dataset', 'description', 'resolution', 'scale'), ('category', 'code')]),
        ),
    ]
