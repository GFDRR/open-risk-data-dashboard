# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-08-11 11:50
from __future__ import unicode_literals

from django.db import migrations


def forwards_func(apps, schema_editor):
    # We get the model from the versioned app registry;
    # if we directly import it, it'll be the wrong version
    KeyCategory = apps.get_model("ordd_api", "KeyCategory")
    db_alias = schema_editor.connection.alias
    try:
        category = KeyCategory.objects.using(db_alias).get(code='BA')
        category.name = 'Base Data'
        category.save()
    except Exception:
        pass
    
    KeyTag = apps.get_model("ordd_api", "KeyTag")
    db_alias = schema_editor.connection.alias
    try:
        tag = KeyTag.objects.using(db_alias).get(name='Vulcano')
        tag.name = 'Volcano'
        tag.save()
    except Exception:
        pass


def backwards_func(apps, schema_editor):
    # We get the model from the versioned app registry;
    # if we directly import it, it'll be the wrong version
    KeyCategory = apps.get_model("ordd_api", "KeyCategory")
    db_alias = schema_editor.connection.alias
    try:
        category = KeyCategory.objects.using(db_alias).get(code='BA')
        category.name = 'Basic Data'
        category.save()
    except Exception:
        pass

    KeyTag = apps.get_model("ordd_api", "KeyTag")
    db_alias = schema_editor.connection.alias
    try:
        tag = KeyTag.objects.using(db_alias).get(name='Volcano')
        tag.name = 'Vulcano'
        tag.save()
    except Exception:
        pass


class Migration(migrations.Migration):

    dependencies = [
        ('ordd_api', '0009_auto_20170822_1347'),
    ]

    operations = [
        migrations.RunPython(forwards_func, backwards_func),
    ]