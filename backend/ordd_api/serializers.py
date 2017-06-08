# ordd_api/serializers.py

from rest_framework import serializers
from .models import Region, Country

class RegionSerializer(serializers.ModelSerializer):
    """Serializer of regions"""
    class Meta:
        model = Region
        fields = ('name',)


class CountrySerializer(serializers.ModelSerializer):
    """Serializer of country"""
    class Meta:
        model = Country
        fields = ('iso3', 'name', 'region')
        # read_only_fields = ('date_created', 'date_modified')
