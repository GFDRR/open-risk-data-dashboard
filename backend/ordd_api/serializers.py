# ordd_api/serializers.py

from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password
from django.utils.http import (urlencode, quote as http_quote)
import django.core.exceptions
from django.db import transaction
from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.serializers import ValidationError
from .models import (Country, KeyTag, Profile, OptIn, Dataset, Url)
from ordd_api import MAIL_SUBJECT_PREFIX
from ordd.settings import EMAIL_CONFIRM_PROTO

from .keydatasets_serializers import KeyDataset4on4Serializer
from .mailer import mailer


class CountrySerializer(serializers.ModelSerializer):
    """Serializer of countries"""

    class Meta:
        model = Country
        fields = ('iso2', 'name')


class KeyPerilSerializer(serializers.ModelSerializer):
    """Serializer of perils"""
    class Meta:
        model = KeyTag
        fields = ('name',)


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


class ResetPasswordReqSerializer(serializers.Serializer):
    """
    Serializer for password reset request.
    """
    username = serializers.CharField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for password update after a password request reset confirmation.
    """
    username = serializers.CharField(required=True, write_only=True)
    key = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    new_password_again = serializers.CharField(required=True, write_only=True)


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
    title = serializers.CharField(source='profile.title', allow_blank=True)
    institution = serializers.CharField(source='profile.institution',
                                        allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'is_active', 'email',
                  'first_name', 'last_name', 'groups', 'title', 'institution')
        extra_kwargs = {'password': {'write_only': True},
                        'is_active': {'write_only': True},
                        'email': {'write_only': True}}

    def create(self, validated_data):
        try:
            with transaction.atomic():
                profile_data = validated_data.pop('profile', None)
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
                Profile.objects.update_or_create(user=user,
                                                 defaults=profile_data)

                subject = ('%s: registration for user %s'
                           % (MAIL_SUBJECT_PREFIX, user.username))
                # use 'http' because where 'https' is required an automatic
                # redirect is triggered
                reply_url = ("%s://%s/confirm_registration.html"
                             "?%s&%s"
                             % (EMAIL_CONFIRM_PROTO,
                                self.context['request'].get_host(),
                                urlencode({'username': user.username}),
                                urlencode({'key': optin.key}),
                                ))
                mailer(user.email, subject,
                       {"title": subject,
                        "subject_prefix": MAIL_SUBJECT_PREFIX,
                        "reply_url": reply_url},
                       None, 'registration_confirm')
        except IntegrityError:
            raise ValidationError({
                'ret': 'Some DB error occurred.'
            })

        return user


class CreateSlugRelatedField(serializers.SlugRelatedField):

    def to_internal_value(self, data):
        try:
            item = self.get_queryset().get(**{self.slug_field: data})
            return item
        except django.core.exceptions.ObjectDoesNotExist:
            try:
                item = self.get_queryset().create(**{self.slug_field: data})
                item.full_clean()
                item.save()
                return item
            except django.core.exceptions.ObjectDoesNotExist:
                self.fail('does_not_exist', slug_name=self.slug_field, value=data)
        except (TypeError, ValueError):
            self.fail('invalid')


class ProfileDatasetListSerializer(serializers.ModelSerializer):
    owner = serializers.SlugRelatedField(slug_field='username',
                                         queryset=User.objects.all())
    changed_by = serializers.SlugRelatedField(slug_field='username',
                                              queryset=User.objects.all())
    country = serializers.SlugRelatedField(slug_field='iso2',
                                           queryset=Country.objects.all())
    keydataset = KeyDataset4on4Serializer(read_only=True)
    url = serializers.SlugRelatedField(slug_field='url',
                                       queryset=Url.objects.all(), many=True)
    tag = serializers.SlugRelatedField(slug_field='name',
                                       queryset=KeyTag.objects.all(),
                                       many=True)

    class Meta:
        model = Dataset
        fields = '__all__'
        read_only_fields = ('owner', 'changed_by', 'create_time',
                            'modify_time', 'is_reviewed', 'score')


class ProfileDatasetCreateSerializer(serializers.ModelSerializer):
    country = serializers.SlugRelatedField(slug_field='iso2',
                                           queryset=Country.objects.all())
    url = CreateSlugRelatedField(slug_field='url',
                                 queryset=Url.objects.all(), many=True)
    tag = serializers.SlugRelatedField(slug_field='name',
                                       queryset=KeyTag.objects.all(),
                                       many=True)

    class Meta:
        model = Dataset
        fields = '__all__'
        read_only_fields = ('owner', 'changed_by', 'create_time',
                            'modify_time', 'is_reviewed', 'score')


class DatasetListSerializer(serializers.ModelSerializer):
    owner = serializers.SlugRelatedField(slug_field='username',
                                         queryset=User.objects.all())
    changed_by = serializers.SlugRelatedField(slug_field='username',
                                              queryset=User.objects.all())
    country = serializers.SlugRelatedField(slug_field='iso2',
                                           queryset=Country.objects.all(
                                           ).order_by('name'))
    keydataset = KeyDataset4on4Serializer(read_only=True)
    url = serializers.SlugRelatedField(slug_field='url',
                                       queryset=Url.objects.all(), many=True)
    tag = serializers.SlugRelatedField(slug_field='name',
                                       queryset=KeyTag.objects.all(),
                                       many=True)

    class Meta:
        model = Dataset
        fields = '__all__'
        read_only_fields = ('changed_by', 'create_time', 'modify_time',
                            'score')


class DatasetPutSerializer(serializers.ModelSerializer):
    owner = serializers.SlugRelatedField(slug_field='username',
                                         queryset=User.objects.all())
    changed_by = serializers.SlugRelatedField(slug_field='username',
                                              queryset=User.objects.all())
    country = serializers.SlugRelatedField(slug_field='iso2',
                                           queryset=Country.objects.all(
                                           ).order_by('name'))
    url = CreateSlugRelatedField(slug_field='url',
                                 queryset=Url.objects.all(), many=True)
    tag = serializers.SlugRelatedField(slug_field='name',
                                       queryset=KeyTag.objects.all(),
                                       many=True)

    class Meta:
        model = Dataset
        fields = '__all__'
        read_only_fields = ('changed_by', 'create_time', 'modify_time',
                            'score')


class ProfileCommentSendSerializer(serializers.Serializer):
    """
Serializer for user comments
"""
    comment = serializers.CharField(required=True, max_length=10240)
    page = serializers.URLField(required=True, max_length=1024)


class DatasetsDumpSerializer(serializers.ModelSerializer):
    owner = serializers.SlugRelatedField(
        slug_field='username', read_only=True)
    changed_by = serializers.SlugRelatedField(
        slug_field='username', read_only=True)
    tag = serializers.SlugRelatedField(
        slug_field='name', read_only=True, many=True)
    url = serializers.SlugRelatedField(
        slug_field='url', read_only=True, many=True)

    class Meta:
        model = Dataset
        fields = (
            'owner', 'country', 'keydataset', 'is_reviewed', 'review_date',
            'create_time', 'modify_time', 'changed_by', 'notes', 'url',
            'is_existing', 'is_existing_txt', 'is_digital_form',
            'is_avail_online',
            'is_avail_online_meta', 'is_bulk_avail', 'is_machine_read',
            'is_machine_read_txt', 'is_pub_available', 'is_avail_for_free',
            'is_open_licence', 'is_open_licence_txt', 'is_prov_timely',
            'is_prov_timely_last', 'tag', 'score'
            )

    def to_representation(self, obj):
        repres = super(DatasetsDumpSerializer, self).to_representation(obj)
        tag_flat = ""
        for tag in repres['tag']:
            if tag_flat == "":
                tag_flat = tag
            else:
                tag_flat += "|" + tag
        repres['tag'] = tag_flat

        url_flat = ""
        for url in repres['url']:
            if url_flat == "":
                url_flat = http_quote(url)
            else:
                url_flat += "|" + http_quote(url)
        repres['url'] = url_flat

        return repres
