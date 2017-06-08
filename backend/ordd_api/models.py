from django.db import models

class Region(models.Model):
    """World regions"""
    name = models.CharField(max_length=64, blank=False, primary_key=True)

class Country(models.Model):
    """List of world countries with a region reference."""

    iso3 = models.CharField(max_length=3, blank=False, primary_key=True)
    name = models.CharField(max_length=64, blank=False, unique=True)
    region = models.ForeignKey(Region)
    
    
