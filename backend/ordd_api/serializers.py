# ordd_api/serializers.py

from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Region, Country, Profile

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


class GroupsRelatedField(serializers.StringRelatedField):
    def to_internal_value(self, data):
        print(Group.objects.filter(name=data)[0].pk)
        return Group.objects.filter(name=data)[0].pk


class ProfileSerializer(serializers.ModelSerializer):
    # A field from the user's profile:
    title = serializers.CharField(source='profile.title', allow_blank=True)
    institution = serializers.CharField(source='profile.institution', allow_blank=True)
    groups = GroupsRelatedField(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('pk', 'username', 'first_name', 'last_name', 'email', 'groups', 'title', 'institution')
        read_only_fields = ('pk', 'username', 'groups', 'is_staff')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        user = super(ProfileSerializer, self).create(validated_data)
        self.update_or_create_profile(user, profile_data)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        self.update_or_create_profile(instance, profile_data)
        return super(ProfileSerializer, self).update(instance, validated_data)

    def update_or_create_profile(self, user, profile_data):
        # This always creates a Profile if the User is missing one;
        # change the logic here if that's not right for your app
        Profile.objects.update_or_create(user=user, defaults=profile_data)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class UserSerializer(serializers.ModelSerializer):
    # A field from the user's profile:
    title = serializers.CharField(source='profile.title', allow_blank=True)
    institution = serializers.CharField(source='profile.institution', allow_blank=True)
    groups = GroupsRelatedField(many=True)

    class Meta:
        model = User
        fields = ('pk', 'username', 'first_name', 'last_name', 'email', 'groups', 'is_staff', 'title', 'institution')
        read_only_fields = ('pk', )

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        user = super(UserSerializer, self).create(validated_data)
        self.update_or_create_profile(user, profile_data)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        self.update_or_create_profile(instance, profile_data)
        return super(UserSerializer, self).update(instance, validated_data)

    def update_or_create_profile(self, user, profile_data):
        # This always creates a Profile if the User is missing one;
        # change the logic here if that's not right for your app
        Profile.objects.update_or_create(user=user, defaults=profile_data)
