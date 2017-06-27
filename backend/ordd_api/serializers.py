# ordd_api/serializers.py

from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password
import django.core.exceptions
from django.db import transaction
from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.serializers import ValidationError
from .models import Region, Country, Profile, OptIn, Dataset

from .keydatasets_serializers import KeyDataset4on4Serializer
from .mailer import mailer


class RegionSerializer(serializers.ModelSerializer):
    """Serializer of regions"""
    class Meta:
        model = Region
        fields = ('name',)


class CountrySerializer(serializers.ModelSerializer):
    """Serializer of countries"""
    class Meta:
        model = Country
        fields = ('iso2', 'name', 'region')


class GroupsRelatedField(serializers.StringRelatedField):
    def to_internal_value(self, data):
        return Group.objects.filter(name=data)[0].pk


class ProfileSerializer(serializers.ModelSerializer):
    # A field from the user's profile:
    title = serializers.CharField(source='profile.title', allow_blank=True)
    institution = serializers.CharField(source='profile.institution',
                                        allow_blank=True)
    groups = GroupsRelatedField(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('pk', 'username', 'first_name', 'last_name', 'email',
                  'groups', 'title', 'institution')
        read_only_fields = ('pk', 'username', 'groups', 'is_staff')
        extra_kwargs = {'password': {'write_only': True}}

    # maybe the create method will be never called
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
    institution = serializers.CharField(source='profile.institution',
                                        allow_blank=True)
    groups = GroupsRelatedField(many=True)

    class Meta:
        model = User
        fields = ('pk', 'username', 'first_name', 'last_name', 'email',
                  'groups', 'is_staff', 'title', 'institution')
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


class RegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'is_active', 'email')
        extra_kwargs = {'password': {'write_only': True},
                        'is_active': {'write_only': True},
                        'email': {'write_only': True}}

    def create(self, validated_data):
        try:
            with transaction.atomic():
                user = super().create(validated_data)
                try:
                    validate_password(validated_data['password'])
                except django.core.exceptions.ValidationError as exc:
                    raise ValidationError({"detail": exc})

                user.set_password(validated_data['password'])
                user.is_active = False
                user.save()
                optin = OptIn(user=user)
                optin.save()
                subject = 'Open Risk Data Dashboard: registration for user %s' % user.username
                reply_url = "https://%s/confirm_registration.html?username=%s&key=%s" % (
                                        self.context['request'].get_host(),
                                        user.username,
                                        optin.key)
                content_txt = '''To complete the registration to Open Risk Data Dashboard site
open this link in your favorite browser: %s .

If you don't subscribe to this site, please ignore this message.''' % (reply_url, )
                content_html = '''<div>To complete the registration to Open Risk Data Dashboard site<br>
click here <a href="%s">%s</a><br>
or open the link in your favorite browser.<br><br>
If you don't subscribe to this site, please ignore this message.</div>''' % (reply_url, reply_url)
                mailer(user.email, subject,
                       {"title": subject, "content": content_txt}, {"title": subject, "content":content_html})
        except IntegrityError:
            raise ValidationError({
                'ret': 'Some DB error occurred.'
            })

        return user


class ProfileDatasetListSerializer(serializers.ModelSerializer):
    owner = serializers.SlugRelatedField(slug_field='username',
                                         queryset=User.objects.all())
    changed_by = serializers.SlugRelatedField(slug_field='username',
                                              queryset=User.objects.all())
    country = serializers.SlugRelatedField(slug_field='iso2',
                                           queryset=Country.objects.all())
    keydataset = KeyDataset4on4Serializer(read_only=True)

    class Meta:
        model = Dataset
        fields = '__all__'
        read_only_fields = ('owner', 'changed_by', 'create_time',
                            'modify_time', 'is_reviewed')


class ProfileDatasetCreateSerializer(serializers.ModelSerializer):
    country = serializers.SlugRelatedField(slug_field='iso2',
                                           queryset=Country.objects.all())

    class Meta:
        model = Dataset
        fields = '__all__'
        read_only_fields = ('owner', 'changed_by', 'create_time',
                            'modify_time', 'is_reviewed')
