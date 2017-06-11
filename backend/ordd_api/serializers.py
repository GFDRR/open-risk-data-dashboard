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
        fields = ('iso2', 'name', 'region')
        # read_only_fields = ('date_created', 'date_modified')


class UserSerializer(serializers.BaseSerializer):
    def to_representation(self, obj):
        print("groups");
        print(obj.groups.all());
        # , 'groups': obj.groups.values_list('name', flat=True)
        return {
            'username': obj.username,
            'first_name': obj.first_name,
            'last_name': obj.last_name,
            'groups': obj.groups.values_list('name', flat=True),
            'title': obj.profile.title,
            'institution': obj.profile.institution
        }
