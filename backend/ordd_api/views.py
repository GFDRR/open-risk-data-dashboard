# views.py
from datetime import datetime, timedelta

import pytz
import json
import django.core.exceptions
from django.db.models import Sum
from django.utils import timezone
from rest_framework.renderers import JSONRenderer
from rest_framework import generics, permissions, status
from rest_framework.generics import GenericAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework.serializers import ValidationError
from collections import OrderedDict
from django.core.exceptions import ObjectDoesNotExist
from django.utils.http import urlencode
from django.db.models import Q
from django.db.models.aggregates import Max
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.http import Http404

from rest_framework_csv import renderers as csv_rend

from .serializers import (
    CountrySerializer, CountryGroupSerializer, KeyPerilSerializer,
    ProfileSerializer, UserSerializer, RegistrationSerializer,
    ChangePasswordSerializer, ResetPasswordReqSerializer,
    ResetPasswordSerializer, ProfileCommentSendSerializer,
    ProfileDatasetListSerializer, ProfileDatasetCreateSerializer,
    DatasetListSerializer, DatasetPutSerializer, DatasetsDumpSerializer)
from .models import (Country, CountryGroup, OptIn, Dataset, KeyDataset,
                     KeyDatasetName, KeyCategory, KeyTag,
                     my_random_key, Profile)
from .mailer import mailer
from ordd_api import __version__, MAIL_SUBJECT_PREFIX
from ordd.settings import EMAIL_CONFIRM_PROTO

fullscore_filterargs_old = {
    'is_existing': True, 'is_digital_form': True,
    'is_avail_online': True, 'is_avail_online_meta': True,
    'is_bulk_avail': True, 'is_machine_read': True,
    'is_pub_available': True, 'is_avail_for_free': True,
    'is_open_licence': True, 'is_prov_timely': True
}

fullscore_filterargs = {
    'score__range': (0.999999, 1.000001)
}


def check_tags_consistency(serializer):
    for tag in serializer.validated_data['tag']:
        if (tag.group !=
                serializer.validated_data['keydataset'].tag_available):
            raise ValidationError(
                {"detail": "Tag '%s' not allowed for KeyDataset '%s'" %
                 (tag.name, serializer.validated_data[
                     'keydataset'].description)})


class VersionGet(APIView):
    """This class handles the GET requests of our rest api."""

    def get(self, request):
        return Response(__version__)


class ProfileDetails(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def get_object(self, queryset=None):
        obj = self.request.user
        return obj


class ProfilePasswordUpdate(APIView):
    """
    An endpoint for changing password.
    """
    permission_classes = (permissions.IsAuthenticated, )

    def get_object(self, queryset=None):
        return self.request.user

    def put(self, request, *args, **kwargs):
        self.object = self.get_object()
        instance = ChangePasswordSerializer(data=request.data)

        instance.is_valid(raise_exception=True)
        vdata = instance.validated_data
        # Check old password
        old_password = vdata.get("old_password")
        if not self.object.check_password(old_password):
            return Response({"old_password": ["Wrong password."]},
                            status=status.HTTP_400_BAD_REQUEST)
        # set_password also hashes the password that the user will get
        self.object.set_password(vdata.get("new_password"))
        self.object.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfilePasswordReset(GenericAPIView):
    """
    An endpoint for reset password.
    """

    def get_serializer_class(self):
        if self.request.method == "PUT":
            return ResetPasswordSerializer
        else:
            return ResetPasswordReqSerializer

    def post(self, request):
        instance = ResetPasswordReqSerializer(data=request.data)

        instance.is_valid(raise_exception=True)

        vdata = instance.validated_data

        user = User.objects.get(username=vdata['username'])

        # insert_time
        optin = OptIn.objects.filter(user=user)

        if len(optin) > 0:
            if len(optin) == 1:
                optin = optin[0]
                if optin.insert_time + timedelta(minutes=15) >= timezone.now():
                    return Response({"detail": "last request not yet expired"},
                                    status=status.HTTP_400_BAD_REQUEST)
                else:
                    optin.key = my_random_key()
                    optin.insert_time = datetime.now()
            else:
                # inconsistente case: reset optin table
                if len(optin) > 0:
                    optin.delete()
                optin = OptIn(user=user)
        else:
            optin = OptIn(user=user)
        optin.save()

        subject = ("%s: password reset for user '%s'" % (
            MAIL_SUBJECT_PREFIX, user.username))

        reply_url = ("%s://%s/password_reset.html?%s&%s"
                     % (EMAIL_CONFIRM_PROTO,
                        request.get_host(),
                        urlencode({'username': user.username}),
                        urlencode({'key': optin.key}),
                        ))

        mailer(user.email, subject,
               {"title": subject,
                "subject_prefix": MAIL_SUBJECT_PREFIX,
                "username": user.username,
                "reply_url": reply_url},
               None, 'password_reset')

        return Response(status=status.HTTP_204_NO_CONTENT)

    def put(self, request):
        instance = ResetPasswordSerializer(data=request.data)
        instance.is_valid(raise_exception=True)

        vdata = instance.validated_data
        if vdata.get('new_password') != vdata.get('new_password_again'):
            return Response({"detail": "password fields are not the same"},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(vdata.get('new_password'))
        except django.core.exceptions.ValidationError as exc:
            raise ValidationError({"detail": exc})

        try:
            user = User.objects.get(username=vdata.get('username'))
            optin = OptIn.objects.get(user=user, key=vdata.get('key'))
            user.set_password(vdata.get("new_password"))
            user.save()
            optin.delete()
        except:
            return Response({"detail": "password update failed"},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)


class RegistrationView(generics.CreateAPIView, generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = RegistrationSerializer

    def get(self, request, *args, **kwargs):
        # here all the logic to manage the registration confermation
        # - check if user exists and is disabled
        # - check if OptIn record exists
        # - check key against username is correct
        # - turn on user
        # - remove optin row
        # - return success
        # in the other cases return a generic error for security reason

        detail = "User does not exist, has already been activated or key is wrong"
        user = User.objects.filter(username=request.GET['username'])

        if len(user) != 1:
            raise NotFound(detail)
        user = user[0]

        if user.is_active is True:
            raise NotFound(detail)

        optin = OptIn.objects.filter(user=user)
        if len(optin) != 1:
            raise NotFound(detail)
        optin = optin[0]

        if optin.key != request.GET['key']:
            raise NotFound(detail)

        user.is_active = True
        user.save()
        optin.delete()

        subject = ("%s: new user '%s' has activated his or her account" % (
            MAIL_SUBJECT_PREFIX, user.username))
        content = ("""New user '%s' has activated his or her account.<br>
EMail address: '%s'.<br>""" % (user.username, user.email))
        for admin in Profile.objects.filter(user__groups__name='admin'):
            mailer(admin.user.email, subject,
                   {"title": subject,
                    "content": content},
                   None, 'base')

        return Response(status=status.HTTP_204_NO_CONTENT)


class CountryListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = CountrySerializer

    def get_queryset(self):
        queryset = Country.objects.all().order_by('name')

        country_groups = self.request.query_params.getlist(
            'country_group')

        is_real_country_s = self.request.query_params.get(
            'is_real_country')
        if is_real_country_s is not None:
            is_real_country = (True if is_real_country_s.upper() == 'TRUE'
                               else False)
        else:
            is_real_country = False

        if is_real_country:
            queryset = queryset.exclude(wb_id='AA')

        if country_groups:
            q = Q()
            for country_group in country_groups:
                q = q | Q(countrygroup__wb_id=country_group)
            queryset = queryset.filter(q)

        return queryset.distinct()


class CountryGroupListView(generics.ListAPIView):
    """Retrieve list of wb_id and names of groups of countries."""
    queryset = CountryGroup.objects.all().order_by('wb_id')
    serializer_class = CountryGroupSerializer


class KeyPerilListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = KeyTag.objects.filter(is_peril=True).order_by('name')
    serializer_class = KeyPerilSerializer


class CountryDetailsView(generics.RetrieveAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = Country.objects.all().order_by('name')
    serializer_class = CountrySerializer


class UserCreateView(generics.ListCreateAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)

    def perform_create(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        subject = ("%s: user '%s' has been deleted" % (
            MAIL_SUBJECT_PREFIX, instance.username))
        content = ("""User '%s' has been deleted by an administrator.<br>"""
                   % instance.username)
        for admin in Profile.objects.filter(user__groups__name='admin'):
            mailer(admin.user.email, subject,
                   {"title": subject,
                    "content": content},
                   None, 'base')

        instance.delete()


class UserDetailsView(generics.RetrieveUpdateDestroyAPIView):
    """This class handles GET, PUT, PATCH and DELETE requests."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)


def compose_name(user):
    human_name = ""
    if user.last_name:
        if user.profile.title:
            human_name = user.profile.title
        if user.first_name:
            human_name += "%s%s" % ((" " if human_name else ""),
                                    user.first_name)
        human_name += " %s" % user.last_name
        if user.profile.institution:
            human_name = "%s (%s)" % (human_name, user.profile.institution)
    else:
        human_name = "user with login-name '%s'" % user.username

    return human_name


class ProfileCommentSendView(APIView):
    """This class provide send comment feature sending an email"""

    serializer_class = ProfileCommentSendSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def post(self, request):
        instance = ProfileCommentSendSerializer(data=request.data)
        instance.is_valid(raise_exception=True)

        human_name = compose_name(request.user)

        subject = ("%s: comment from user '%s'" % (
            MAIL_SUBJECT_PREFIX,
            request.user.username))

        for reviewer in Profile.objects.filter(user__groups__name='reviewer'):
            mailer(reviewer.user.email, subject,
                   {"title": subject,
                    "human_name": human_name,
                    "comment": instance.validated_data['comment'],
                    "page": instance.validated_data['page']},
                   None, 'comment', from_addr=request.user.email)

        return Response(status=status.HTTP_204_NO_CONTENT)


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Write permissions are only allowed to the owner of the snippet.
        return obj.owner == request.user


class ProfileDatasetListCreateView(generics.ListCreateAPIView):
    permission_classes = (IsOwner, )

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ProfileDatasetListSerializer
        elif self.request.method == "POST":
            return ProfileDatasetCreateSerializer

    def get_queryset(self):
        return Dataset.objects.filter(
            keydataset__level__name='National',
            owner=self.request.user).order_by('country__name',
                                              'keydataset__code')

    def perform_create(self, serializer):
        # check concordance between tags and keydataset.tag_available
        check_tags_consistency(serializer)

        post_field = serializer.save(owner=self.request.user,
                                     changed_by=self.request.user)
        post = DatasetPutSerializer(post_field)
        post_json = JSONRenderer().render(post.data)
        post = DatasetPutSerializer(data=json.loads(post_json.decode()))
        post.is_valid()
        post_keydataset = KeyDataset.objects.get(
            code=post['keydataset'].value).__str__()

        # extract list of read/write field
        if post.Meta.fields == '__all__':
            fields = ()
            for field in post.get_fields():
                if post.Meta.read_only_fields:
                    if field not in post.Meta.read_only_fields:
                        fields += (field,)
                else:
                    fields += (field,)
        else:
            fields = ()
            for field in post.get_fields():
                if field in post.Meta.fields:
                    fields += (field)

        subject = ("%s: new dataset from user '%s' for"
                   " keydataset [%s] and country [%s]" % (
                       MAIL_SUBJECT_PREFIX,
                       post_field.changed_by.username,
                       post['keydataset'].value,
                       post['country'].value))

        rows = []
        # manage differences between pre and post changes
        for field in fields:
            if field in ["id", "review_date"]:
                continue

            if field == "keydataset":
                post_value = post_keydataset
            elif field == "country":
                post_value = Country.objects.get(wb_id=post[field].value).name
            else:
                post_value = post[field].value

            rows.append(
                {"is_list": (type(post_value) is list),
                 "name":
                 post_field._meta.get_field(field).verbose_name,
                 "post": post_value})

        for reviewer in Profile.objects.filter(user__groups__name='reviewer'):
            mailer(reviewer.user.email, subject,
                   {"title": subject,
                    "owner": post_field.changed_by.username,
                    "table_title": "Created dataset:",
                    "rows": rows},
                   None, 'create_by_owner')


class ProfileDatasetDetailsView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProfileDatasetListSerializer
    permission_classes = (IsOwner, )

    def get_serializer_class(self):
        try:
            if self.request.method == 'PUT':
                return DatasetPutSerializer
        except:
            pass

        return ProfileDatasetListSerializer

    def get_queryset(self):
        return Dataset.objects.filter(
            keydataset__level__name='National',
            owner=self.request.user)

    def perform_update(self, serializer):
        # to take a picture of the field before update we follow
        # a serialize->render->deserialize approach
        pre = DatasetPutSerializer(self.get_object())
        pre_json = JSONRenderer().render(pre.data)
        pre = DatasetPutSerializer(data=json.loads(pre_json.decode()))
        pre.is_valid()

        # comodity keydataset is retrieved in a custom way
        pre_keydataset = KeyDataset.objects.get(
            level__name='National',
            code=pre['keydataset'].value).__str__()

        # update fields
        serializer.validated_data['changed_by'] = self.request.user
        serializer.validated_data['is_reviewed'] = False

        # check concordance between tags and keydataset.tag_available
        check_tags_consistency(serializer)

        # save and get update version of the record
        post_field = serializer.save(owner=self.request.user,
                                     changed_by=self.request.user)

        post = DatasetPutSerializer(post_field)
        post_json = JSONRenderer().render(post.data)
        post = DatasetPutSerializer(data=json.loads(post_json.decode()))
        post.is_valid()
        post_keydataset = KeyDataset.objects.get(
            code=post['keydataset'].value).__str__()

        # extract list of read/write field
        if post.Meta.fields == '__all__':
            fields = ()
            for field in post.get_fields():
                if post.Meta.read_only_fields:
                    if field not in post.Meta.read_only_fields:
                        fields += (field,)
                else:
                    fields += (field,)
        else:
            fields = ()
            for field in post.get_fields():
                if field in post.Meta.fields:
                    fields += (field)

        subject = ("%s: user '%s' updated dataset for"
                   " keydataset [%s] and country [%s]" % (
                       MAIL_SUBJECT_PREFIX,
                       self.request.user.username,
                       pre['keydataset'].value,
                       pre['country'].value))

        rows = []
        # manage differences between pre and post changes
        for field in fields:
            if field in ["id", "owner", "review_date"]:
                continue

            if field == "keydataset":
                pre_value = pre_keydataset
                post_value = post_keydataset
            elif field == "country":
                pre_value = Country.objects.get(wb_id=pre[field].value).name
                post_value = Country.objects.get(wb_id=post[field].value).name
            else:
                pre_value = pre[field].value
                post_value = post[field].value

            rows.append(
                {"is_list": (type(pre_value) is list),
                 "name":
                 post_field._meta.get_field(field).verbose_name,
                 "post": post_value,
                 "is_changed": pre_value != post_value,
                 "pre": pre_value if pre_value != post_value else None})

        if (rows):
            for reviewer in Profile.objects.filter(
                    user__groups__name='reviewer'):
                mailer(reviewer.user.email, subject,
                       {"title": subject,
                        "changed_by": self.request.user.username,
                        "is_reviewed": post['is_reviewed'].value,
                        "rows": rows},
                       None, 'update_by_owner')

    def perform_destroy(self, instance):
        post = DatasetPutSerializer(instance)
        post_json = JSONRenderer().render(post.data)
        post = DatasetPutSerializer(data=json.loads(post_json.decode()))
        post.is_valid()
        post_keydataset = KeyDataset.objects.get(
            code=post['keydataset'].value).__str__()

        # extract list of read/write field
        if post.Meta.fields == '__all__':
            fields = ()
            for field in post.get_fields():
                if post.Meta.read_only_fields:
                    if field not in post.Meta.read_only_fields:
                        fields += (field,)
                else:
                    fields += (field,)
        else:
            fields = ()
            for field in post.get_fields():
                if field in post.Meta.fields:
                    fields += (field)

        subject = ("%s: deleted dataset from user '%s' for"
                   " keydataset [%s] and country [%s]" % (
                       MAIL_SUBJECT_PREFIX,
                       instance.changed_by.username,
                       post['keydataset'].value,
                       post['country'].value))

        rows = []
        # manage differences between pre and post changes
        for field in fields:
            if field in ["id", "review_date"]:
                continue

            if field == "keydataset":
                post_value = post_keydataset
            elif field == "country":
                post_value = Country.objects.get(wb_id=post[field].value).name
            else:
                post_value = post[field].value

            rows.append(
                {"is_list": (type(post_value) is list),
                 "name":
                 instance._meta.get_field(field).verbose_name,
                 "post": post_value})

        for reviewer in Profile.objects.filter(user__groups__name='reviewer'):
            mailer(reviewer.user.email, subject,
                   {"title": subject,
                    "owner": instance.changed_by.username,
                    "table_title": "Deleted dataset:",
                    "rows": rows},
                   None, 'delete_by_owner')
        instance.delete()


class DatasetDetailsViewPerms(permissions.BasePermission):
    """
    Custom permission to only allow members of 'reviewer' and 'admin' groups
    to manage datasets.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        else:
            perms = (request.user.groups.filter(name='reviewer').exists() or
                     request.user.groups.filter(name='admin').exists())
        return perms

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        else:
            perms = (request.user.groups.filter(name='reviewer').exists() or
                     request.user.groups.filter(name='admin').exists())
        return perms


class DatasetDetailsView(generics.RetrieveUpdateDestroyAPIView):
    """This class handles the GET requests of our rest api."""
    permission_classes = (DatasetDetailsViewPerms, )
    queryset = Dataset.objects.filter(keydataset__level__name='National')
    serializer_class = DatasetListSerializer

    def get_serializer_class(self):
        try:
            if self.request.method == 'PUT':
                return DatasetPutSerializer
        except:
            pass
        return DatasetListSerializer

#
#  NOTE: this part is became obsolete after creation of url items inside serializers
#       remove it if not create side-effects
#
#    def update(self, request, *args, **kwargs):
#        logger.error('here we are 2')
#        partial = kwargs.get('partial', False)
#        instance = self.get_object()
#
#        serializer = self.get_serializer(instance, data=request.data, partial=partial)
#        # urls_new = serializer.initial_data['url']
#
#        # for url_new in urls_new:
#        #     url, created = Url.objects.get_or_create(url=url_new)
#        #     if created:
#        #         logger.error('created add')
#        #         instance.url.add(url)
#        #     elif url not in instance.url_set.all():
#        #         logger.error('get add')
#        #         instance.url.add(url)
#
#        return super(DatasetDetailsView, self).update(request, *args, **kwargs)

    def perform_update(self, serializer):
        # to take a picture of the field before update we follow
        # a serialize->render->deserialize approach
        pre = DatasetPutSerializer(self.get_object())
        pre_json = JSONRenderer().render(pre.data)
        pre = DatasetPutSerializer(data=json.loads(pre_json.decode()))
        pre.is_valid()

        # comodity keydataset is retrieved in a custom way
        pre_keydataset = KeyDataset.objects.get(
            code=pre['keydataset'].value).__str__()

        # update fields
        serializer.validated_data['changed_by'] = self.request.user
        if (pre.validated_data['is_reviewed'] is False and
                serializer.validated_data['is_reviewed'] is True):
            serializer.validated_data['review_date'] = datetime.now(
                tz=pytz.utc).replace(microsecond=0)

        # check concordance between tags and keydataset.tag_available
        check_tags_consistency(serializer)

        # save and get update version of the record
        post_field = serializer.save()
        post = DatasetPutSerializer(post_field)
        post_json = JSONRenderer().render(post.data)
        post = DatasetPutSerializer(data=json.loads(post_json.decode()))
        post.is_valid()
        post_keydataset = KeyDataset.objects.get(
            code=post['keydataset'].value).__str__()

        # extract list of read/write field
        if post.Meta.fields == '__all__':
            fields = ()
            for field in post.get_fields():
                if post.Meta.read_only_fields:
                    if field not in post.Meta.read_only_fields:
                        fields += (field,)
                else:
                    fields += (field,)
        else:
            fields = ()
            for field in post.get_fields():
                if field in post.Meta.fields:
                    fields += (field)

        subject = "%s: update dataset for keydataset [%s] and country [%s]" % (
            MAIL_SUBJECT_PREFIX, pre['keydataset'].value, pre['country'].value)

        rows = []
        # manage differences between pre and post changes
        for field in fields:
            if field in ["id", "owner", "review_date"]:
                continue

            if field == "keydataset":
                pre_value = pre_keydataset
                post_value = post_keydataset
            elif field == "country":
                pre_value = Country.objects.get(wb_id=pre[field].value).name
                post_value = Country.objects.get(wb_id=post[field].value).name
            else:
                pre_value = pre[field].value
                post_value = post[field].value

            rows.append(
                {"is_list": (type(pre_value) is list),
                 "name":
                 post_field._meta.get_field(field).verbose_name,
                 "post": post_value,
                 "is_changed": pre_value != post_value,
                 "pre": pre_value if pre_value != post_value else None})

        if (rows):
            mailer(post_field.owner.email, subject,
                   {"title": subject,
                    "changed_by": post_field.changed_by.username,
                    "is_reviewed": post['is_reviewed'].value,
                    "rows": rows},
                   None, 'update_by_reviewer')

    def perform_destroy(self, instance):
        post = DatasetPutSerializer(instance)
        post_json = JSONRenderer().render(post.data)
        post = DatasetPutSerializer(data=json.loads(post_json.decode()))
        post.is_valid()
        post_keydataset = KeyDataset.objects.get(
            code=post['keydataset'].value).__str__()

        # extract list of read/write field
        if post.Meta.fields == '__all__':
            fields = ()
            for field in post.get_fields():
                if post.Meta.read_only_fields:
                    if field not in post.Meta.read_only_fields:
                        fields += (field,)
                else:
                    fields += (field,)
        else:
            fields = ()
            for field in post.get_fields():
                if field in post.Meta.fields:
                    fields += (field)

        subject = ("%s: deleted dataset from reviewer '%s' for"
                   " keydataset [%s] and country [%s]" % (
                       MAIL_SUBJECT_PREFIX,
                       instance.changed_by.username,
                       post['keydataset'].value,
                       post['country'].value))

        rows = []
        # manage differences between pre and post changes
        for field in fields:
            if field in ["id", "review_date"]:
                continue

            if field == "keydataset":
                post_value = post_keydataset
            elif field == "country":
                post_value = Country.objects.get(wb_id=post[field].value).name
            else:
                post_value = post[field].value

            rows.append(
                {"is_list": (type(post_value) is list),
                 "name":
                 instance._meta.get_field(field).verbose_name,
                 "post": post_value})

        mailer(instance.owner.email, subject,
               {"title": subject,
                "reviewer": self.request.user.username,
                "table_title": "Deleted dataset:",
                "rows": rows},
               None, 'delete_by_reviewer')
        instance.delete()


class DatasetListView(generics.ListAPIView):
    serializer_class = DatasetListSerializer

    def get_queryset(self):
        queryset = Dataset.objects.filter(
            keydataset__level__name='National').order_by('country__name',
                                                         'keydataset__code')
        kd = self.request.query_params.getlist('kd')
        country = self.request.query_params.getlist('country')
        category = self.request.query_params.getlist('category')
        applicability = self.request.query_params.getlist('applicability')
        tag = self.request.query_params.getlist('tag')
        is_reviewed = self.request.query_params.getlist('is_reviewed')

        q = Q()
        for v in is_reviewed:
            q = q | Q(is_reviewed__iexact=v)
        queryset = queryset.filter(q)

        q = Q()
        for v in country:
            q = q | Q(country__wb_id__iexact=v)
        queryset = queryset.filter(q)

        q = Q()
        for v in kd:
            q = q | Q(keydataset__code__iexact=v)
        queryset = queryset.filter(q)

        q = Q()
        for v in category:
            q = q | Q(keydataset__category__name__iexact=v)
        queryset = queryset.filter(q)

        q = Q()
        for v in applicability:
            # FIXME currently in tag we may have extra applicabilities
            # when category (tag group) is 'hazard'
            q = q | (Q(keydataset__applicability__name__iexact=v) |
                     Q(tag__name__iexact=v))
        queryset = queryset.filter(q)

        q = Q()
        for v in tag:
            q = q | Q(tag__name__iexact=v)
        queryset = queryset.filter(q)

        return queryset.distinct()


class DatasetsDumpRenderer(csv_rend.CSVRenderer):
    writer_opts = {'delimiter': ';'}
    header = [
        'owner', 'country', 'keydataset', 'is_reviewed', 'review_date',
        'create_time', 'modify_time', 'changed_by', 'notes', 'url',
        'is_existing', 'is_existing_txt', 'is_digital_form', 'is_avail_online',
        'is_avail_online_meta', 'is_bulk_avail', 'is_machine_read',
        'is_machine_read_txt', 'is_pub_available', 'is_avail_for_free',
        'is_open_licence', 'is_open_licence_txt', 'is_prov_timely',
        'is_prov_timely_last', 'tag',
    ]


class DatasetsDumpView(generics.ListAPIView):
    """This view return a downloadable csv with all the datasets with urls and
 tags serialized"""
    queryset = Dataset.objects.filter(keydataset__level__name='National')
    serializer_class = DatasetsDumpSerializer
    renderer_classes = (DatasetsDumpRenderer, )

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(
            request, response, *args, **kwargs)
        response['Content-Disposition'] = ("attachment; "
                                           "filename=odri_datasets.csv")
        return response


class ScoreNew(object):
    dataset_classes = ['', 'opendata', 'restricted', 'closed', 'unknown']

    @classmethod
    def dataset_class(cls, id):
        return cls.dataset_classes[id]

    @classmethod
    def all_countries_new(cls, request):
        # get number of keydatasets
        kd_num = KeyDataset.objects.all().count()
        dt_num = Dataset.objects.all().count()
        countries = Country.objects.all()

        kd_cat_arr = Country.objects.raw('''
            SELECT country_id as wb_id, score_new_cat,
                   count(score_new_cat) AS score_new_cat_n
                FROM ordd_api_dataset
                GROUP BY country_id, score_new_cat
                ORDER BY country_id, score_new_cat''')
        kd_cat = {}
        for item in kd_cat_arr:
            if item.wb_id not in kd_cat:
                kd_cat[item.wb_id] = {}
            kd_cat[item.wb_id][item.score_new_cat] = item.score_new_cat_n

        kd_unknown_arr = Country.objects.raw('''
            SELECT wb_id, (%d - COUNT(pri.part)) AS kd_num FROM (
                SELECT country_id as wb_id, keydataset_id AS part
                       FROM ordd_api_dataset
                       GROUP BY wb_id, keydataset_id)
            AS pri GROUP BY wb_id ORDER BY kd_num;''' % kd_num)

        kd_unknown = {}
        for item in kd_unknown_arr:
            kd_unknown[item.wb_id] = item.kd_num

        ret = {
            "keydatasets_count": kd_num,
            "countries_count": countries.count(),
            "datasets_count": dt_num,
            "countries": None
            }

        ret_cous = []
        for country in countries:
            score = Dataset.objects.filter(
                country_id=country.wb_id).aggregate(
                    Sum('score_new'))['score_new__sum']
            if score is None:
                score = 0

            row = [0, 0, 0, kd_num]
            if country.wb_id in kd_unknown:
                row[3] = kd_unknown[country.wb_id]
            if country.wb_id in kd_cat:
                cou_kd_cat = kd_cat[country.wb_id]
                for cat in cou_kd_cat:
                    row[int(cat) - 1] = cou_kd_cat[cat]

            country_row = {
                "datasets_open_count": row[0],
                "datasets_restricted_count": row[1],
                "datasets_closed_count": row[2],
                "datasets_unknown_count": row[3],
                "datasets_count": row[0] + row[1] + row[2],
                "country": country.wb_id
            }
            ret_cous.append(country_row)

        ret["countries"] = ret_cous

        return ret

    @classmethod
    def country_details(cls, request, country_id):
        dss = Dataset.objects.filter(
            country_id=country_id)

        kdss_arrdict = dss.values('keydataset').distinct()

        kdss_count = kdss_arrdict.count()
        kdss = [x['keydataset'] for x in kdss_arrdict]
        kdss_full_count = KeyDataset.objects.all().count()
        kdss_miss = KeyDataset.objects.exclude(code__in=kdss)

        datasets_open_count = dss.filter(score_new_cat=1).count()
        datasets_restricted_count = dss.filter(score_new_cat=2).count()
        datasets_closed_count = dss.filter(score_new_cat=3).count()
        datasets_unknown_count = kdss_full_count - kdss_count

        fullscores_count = dss.filter(score_new_cat=1).count()
        datasets = []
        for ds in dss:
            dataset = {
                'dataset_id': ds.id,
                'keydataset_id': ds.keydataset_id,
                'name': ds.keydataset.dataset.name,
                'category': cls.dataset_class(ds.score_new_cat),
                'is_existing': ds.is_existing,
                'is_digital_form': ds.is_digital_form,
                'is_avail_online': ds.is_avail_online,
                'is_avail_online_meta': ds.is_avail_online_meta,
                'is_bulk_avail': ds.is_bulk_avail,
                'is_machine_read': ds.is_machine_read,
                'is_pub_available': ds.is_pub_available,
                'is_avail_for_free': ds.is_avail_for_free,
                'is_open_licence': ds.is_open_licence,
                'is_prov_timely': ds.is_prov_timely,
                'is_existing_txt': ds.is_existing_txt,
                'is_prov_timely_last': ds.is_prov_timely_last,
                'title': ds.title,
                'modify_time': ds.is_prov_timely_last,
                'institution': ds.is_existing_txt
                }

            datasets.append(dataset)

        for kds_miss in kdss_miss:
            dataset = {
                'dataset_id': None,
                'keydataset_id': kds_miss.code,
                'name': kds_miss.dataset.name,
                'category': cls.dataset_class(4),
                'is_existing': False,
                'is_digital_form': False,
                'is_avail_online': False,
                'is_avail_online_meta': False,
                'is_bulk_avail': False,
                'is_machine_read': False,
                'is_pub_available': False,
                'is_avail_for_free': False,
                'is_open_licence': False,
                'is_prov_timely': False,
                'is_existing_txt': False,
                'is_prov_timely_last': False,
                'title': None,
                'modify_time': None,
                'institution': None
                }

            datasets.append(dataset)

        ret = {'datasets_count': dss.count(),
               'keydatasets_count': kdss_count,

               'datasets_open_count': datasets_open_count,
               'datasets_restricted_count': datasets_restricted_count,
               'datasets_closed_count': datasets_closed_count,
               'datasets_unknown_count': datasets_unknown_count,

               'scores': datasets}
        return ret


class Score(object):
    @classmethod
    def score_fmt(cls, score):
        return "%.1f" % (score * 100.0)

    @classmethod
    def country_scoring_newitem(cls):
        return OrderedDict(
            [('category', OrderedDict()),
             ('dsname', OrderedDict()),
             ('datasets_count', 0), ('fullscores_count', 0)])

    @classmethod
    def extract_ds_counters(cls, queryset):
        queryset_ds = queryset.values(
            'keydataset__dataset').annotate(Max('score'))
        datasets_count_ds = len(queryset_ds)
        fullqueryset_ds = queryset_ds.filter(score__range=(0.999999, 1.000001))
        fullscores_count_ds = len(fullqueryset_ds)
        return (datasets_count_ds, fullscores_count_ds)

    @classmethod
    def calculate_ranking(cls, world_score_tree, queryset, kd_queryset,
                          country_in=None):
        ret_score = []
        datasetname_n = kd_queryset.values('dataset').distinct().count()
        for country in Country.objects.all().order_by('name'):
            if country.wb_id not in world_score_tree:
                continue

            country_queryset = queryset.filter(
                country__wb_id=country.wb_id)
            score = cls.country_scoring_dsname(country_queryset, datasetname_n)

            datasets_count_ds, fullscores_count_ds = cls.extract_ds_counters(
                country_queryset)

            ret_score.append(
                {"country": country.wb_id,
                 "score": score,
                 "datasets_count": datasets_count_ds,
                 "fullscores_count": fullscores_count_ds,
                 "rank": 0})
        ret_score_ord = ret_score[:]
        ret_score_ord = sorted(ret_score_ord, key=lambda k: k['score'],
                               reverse=True)
        old_pos = 0
        old_score = 100000
        for el in ret_score_ord:
            # FIXME use more sofisticated comparison method
            if el['score'] < old_score:
                old_pos += 1
                old_score = el['score']
            el['rank'] = old_pos

        if country_in:
            for item in ret_score_ord:
                if item['country'] == country_in:
                    return item
            return {"country": country_in,
                    "score": -1,
                    "datasets_count": 0,
                    "fullscores_count": 0,
                    "rank": old_pos + (1 if old_score > 0.0 else 0)
                    }

        return ret_score_ord

    @classmethod
    def category(cls, category, country_score_tree):
        category_score = 0

        category_score_tree = country_score_tree[category.code]

        for keydataset in KeyDataset.objects.filter(
                level__name='National', category=category):
            if keydataset.code not in category_score_tree['score']:
                continue
            keydataset_score = category_score_tree['score'][keydataset.code][
                'value']

            if category_score < keydataset_score:
                category_score = keydataset_score

        return category_score

    @classmethod
    def category_scoring(cls, category, country_score_tree):
        category_score = 0

        category_score_tree = country_score_tree['category'][category.code]

        for keydataset in KeyDataset.objects.filter(
                level__name='National', category=category):
            if keydataset.code not in category_score_tree['score']:
                continue
            keydataset_score = category_score_tree['score'][keydataset.code][
                'value']

            if category_score < keydataset_score:
                category_score = keydataset_score

        return category_score

    @classmethod
    def country(cls, country_score_tree, country):
        category_weights_sum = KeyCategory.objects.aggregate(
            Sum('weight'))
        category_weights_sum = float(category_weights_sum['weight__sum'])

        country_score = 0
        for category in KeyCategory.objects.all().order_by('id'):
            if category.code not in country_score_tree:
                continue
            category_score = cls.category(category, country_score_tree)
            # OLD METHOD
            # category_score /= keydataset_weights_sum
            country_score += float(category_score * category.weight)

        country_score /= category_weights_sum

        return country_score

    @classmethod
    def country_scoring(cls, country_score_tree, country):
        category_weights_sum = KeyCategory.objects.aggregate(
            Sum('weight'))
        category_weights_sum = float(category_weights_sum['weight__sum'])

        country_score = 0
        for category in KeyCategory.objects.all().order_by('id'):
            if category.code not in country_score_tree['category']:
                continue
            category_score = cls.category_scoring(category, country_score_tree)
            # OLD METHOD
            # category_score /= keydataset_weights_sum
            country_score += float(category_score * category.weight)

        country_score /= float(category_weights_sum)

        return country_score

    @classmethod
    def country_scoring_dsname(cls, country_queryset, datasetname_n):
        # as described in:
        #   https://github.com/GFDRR/open-risk-data-dashboard/issues/127
        tot = country_queryset.values('keydataset__dataset').annotate(
            Max('score_th_norm')).aggregate(Sum('score_th_norm__max'))
        if 'score_th_norm__max__sum' not in tot:
            raise ValueError('country_scoring_dsname failed')

        if tot['score_th_norm__max__sum'] is not None:
            return float(tot['score_th_norm__max__sum']) / float(datasetname_n)
        else:
            return 0.0


    @classmethod
    def country_loadtree(cls, request, country_score_tree, dataset):
        category_id = dataset.keydataset.category.code
        keydataset_id = dataset.keydataset.code

        if category_id not in country_score_tree:
            country_score_tree[category_id] = OrderedDict(
                [('score', OrderedDict()), ('counter', 0)])
        category_score_tree = country_score_tree[category_id]
        category_score_tree['counter'] += 1
        if keydataset_id not in category_score_tree['score']:
            category_score_tree['score'][keydataset_id] = {
                'dataset': None, 'value': -1}
        keydataset_score_tree = category_score_tree['score'][keydataset_id]
        score = dataset.score_th_norm

        if keydataset_score_tree['value'] < score:
            keydataset_score_tree['value'] = score
            keydataset_score_tree['dataset'].insert(0, dataset)
        else:
            keydataset_score_tree['dataset'].append(dataset)

    @classmethod
    def country_scoring_loadtree(cls, request, country_score_tree, dataset):
        """
        country['category'][category]['score'][keydataset]{[datasets], value}
        country['category'][category]['count']
        country['dsname']
        country['datasets_count']
        country['fullscores_count']
        """
        category_id = dataset.keydataset.category.code
        keydataset_id = dataset.keydataset.code
        dsname_id = dataset.keydataset.dataset.id

        score = dataset.score_th_norm

        if dsname_id not in country_score_tree['dsname']:
            country_score_tree['dsname'][dsname_id] = {
                'dataset': [], 'value': -1}
        dsname_score_tree = country_score_tree['dsname'][dsname_id]
        if dsname_score_tree['value'] < score:
            dsname_score_tree['value'] = score
            dsname_score_tree['dataset'].insert(0, dataset)
        else:
            dsname_score_tree['dataset'].append(dataset)

        if category_id not in country_score_tree['category']:
            country_score_tree['category'][category_id] = OrderedDict(
                [('score', OrderedDict()), ('counter', 0)])
        category_score_tree = country_score_tree['category'][category_id]
        category_score_tree['counter'] += 1

        if keydataset_id not in category_score_tree['score']:
            category_score_tree['score'][keydataset_id] = {
                'dataset': [], 'value': -1}
        keydataset_score_tree = category_score_tree['score'][keydataset_id]

        if keydataset_score_tree['value'] < score:
            keydataset_score_tree['value'] = score
            keydataset_score_tree['dataset'].insert(0, dataset)
        else:
            keydataset_score_tree['dataset'].append(dataset)

        country_score_tree['datasets_count'] += 1
        if dataset.score > 0.999999:
            country_score_tree['fullscores_count'] += 1

    @classmethod
    def dataset_loadtree(cls, request, queryset):
        """
    world_score_tree = [(<wb_id_country>: country_score_tree), ...]
    country_score_tree = [(<category_id>: category_score_tree), ...]
    category_score_tree = [('score', [(<keydataset_id>:
                                      keydataset_score_tree), ('counter', 0)]
    keydataset_score_tree = {'dataset': None, 'value': -1}
        """

        # preloaded tree with data from datasets to avoid bad performances
        world_score_tree = OrderedDict()
        for dataset in queryset:
            country_id = dataset.country.wb_id

            # category_id = dataset.keydataset.category.code
            # keydataset_id = dataset.keydataset.code
            if country_id not in world_score_tree:
                world_score_tree[country_id] = OrderedDict()
            country_score_tree = world_score_tree[country_id]

            cls.country_loadtree(request, country_score_tree, dataset)

        return world_score_tree

    @classmethod
    def country_scoring_dataset_loadtree(cls, request, queryset):
        """
    world_score_tree = [(<wb_id_country>: country_score_tree), ...]
    country_score_tree = [(<category_id>: category_score_tree), ...]
    category_score_tree = [('score', [(<keydataset_id>:
                                      keydataset_score_tree), ('counter', 0)]
    keydataset_score_tree = {'dataset': [], 'value': -1}
        """

        # preloaded tree with data from datasets to avoid bad performances
        world_score_tree = OrderedDict()
        for dataset in queryset:
            country_id = dataset.country.wb_id

            if country_id not in world_score_tree:
                world_score_tree[country_id] = cls.country_scoring_newitem()
            country_score_tree = world_score_tree[country_id]

            cls.country_scoring_loadtree(request, country_score_tree, dataset)

        return world_score_tree

    @classmethod
    def all_countries(cls, request):
        queryset = Dataset.objects.filter(keydataset__level__name='National')
        applicability = request.query_params.getlist('applicability')
        category = request.query_params.getlist('category')
        if applicability:
            q = Q()
            for v in applicability:
                # FIXME currently in tag we may have extra applicabilities
                # when category (tag group) is 'hazard'
                q = q | (Q(keydataset__applicability__name__iexact=v) |
                         Q(tag__name__iexact=v))
            queryset = queryset.filter(q).distinct()

        if category:
            q = Q()
            for v in category:
                q = q | Q(keydataset__category__name__iexact=v)
            queryset = queryset.filter(q).distinct()

        # check-point to investigate correctness of query filtering
        # print("Number of item: %d" % queryset.count())

        world_score_tree = cls.dataset_loadtree(request, queryset)
        datasets_count = queryset.count()
        fullscores_queryset = queryset.filter(
            **fullscore_filterargs)
        world_fullscore_tree = cls.dataset_loadtree(
            request, fullscores_queryset)
        fullscores_count = fullscores_queryset.count()

        countries_count = len(world_score_tree)

        categories = KeyCategory.objects.all().order_by('id')
        categories_counters = []
        cat_cou = {}
        for cat in categories:
            cat_cou = 0
            cat_full_cou = 0
            for key, country_score in world_score_tree.items():
                if cat.code in country_score:
                    category_score = country_score[cat.code]
                    cat_cou += category_score['counter']
                    try:
                        country_fullscore = world_fullscore_tree[key]
                        category_fullscore = country_fullscore[cat.code]
                        cat_full_cou += category_fullscore['counter']
                    except Exception:
                        pass

            categories_counters.append({'category': cat.name,
                                        'count': cat_cou,
                                        'fullcount': cat_full_cou})

        ret = {'scores': [],
               'datasets_count': datasets_count,
               'fullscores_count': fullscores_count,
               'countries_count': countries_count,
               'categories_counters': categories_counters,
               'perils_counters': []}
        ret_score = ret['scores']

        for country in Country.objects.all().order_by('name'):
            if country.wb_id not in world_score_tree:
                continue

            score = cls.country(world_score_tree[country.wb_id], country)

            ret_score.append({"country": country.wb_id,
                              "score": cls.score_fmt(score)})

        perils_counters = ret['perils_counters']
        for peril in KeyTag.objects.filter(
                is_peril=True).order_by('name'):
            superset = (queryset.filter(keydataset__applicability=peril) |
                        queryset.filter(tag=peril))
            peril_queryset = superset.distinct()
            fullscore_queryset = peril_queryset.filter(
                **fullscore_filterargs)
            count = peril_queryset.count()
            fullcount = fullscore_queryset.count()
            perils_counters.append({'name': peril.name,
                                    'count': count,
                                    'fullcount': fullcount
                                    })

        return ret

    @classmethod
    def keydataset_count(cls, applicability, category):
        queryset = KeyDataset.objects.all()
        if applicability:
            q = Q()
            for v in applicability:
                # FIXME currently in tag we may have extra applicabilities
                # when category (tag group) is 'hazard'
                q = q | Q(applicability__name__iexact=v)
            queryset = queryset.filter(q).distinct()

        if category:
            q = Q()
            for v in category:
                q = q | Q(category__name__iexact=v)
            queryset = queryset.filter(q).distinct()

        return len(queryset)

    @classmethod
    def all_country_scoring(cls, request):
        queryset = Dataset.objects.filter(
            keydataset__level__name='National').exclude(country__wb_id='AA')
        kd_queryset = KeyDataset.objects.filter(level__name='National')
        applicability = request.query_params.getlist('applicability')
        category = request.query_params.getlist('category')
        country_groups = request.query_params.getlist(
            'country_group')

        if applicability:
            q = Q()
            kd_q = Q()
            for v in applicability:
                # FIXME currently in tag we may have extra applicabilities
                # when category (tag group) is 'hazard'
                q = q | (Q(keydataset__applicability__name__iexact=v) |
                         Q(tag__name__iexact=v))
                kd_q = kd_q | Q(applicability__name__iexact=v)
            queryset = queryset.filter(q).distinct()
            kd_queryset = kd_queryset.filter(kd_q).distinct()

        if category:
            q = Q()
            kd_q = Q()
            for v in category:
                q = q | Q(keydataset__category__name__iexact=v)
                kd_q = kd_q | Q(category__name__iexact=v)
            queryset = queryset.filter(q).distinct()
            kd_queryset = kd_queryset.filter(kd_q).distinct()

        if country_groups:
            q = Q()
            kd_q = Q()
            for country_group in country_groups:
                q = q | Q(country__countrygroup__wb_id=country_group)
            queryset = queryset.filter(q)

        # check-point to investigate correctness of query filtering
        # print("Number of item: %d" % queryset.count())

        world_score_tree = cls.country_scoring_dataset_loadtree(
            request, queryset)

        datasets_count = queryset.count()
        fullscores_queryset = queryset.filter(
            **fullscore_filterargs)
        fullscores_count = fullscores_queryset.count()

        countries_count = len(world_score_tree)

        ret = {'countries': [],
               'datasets_count': datasets_count,
               'fullscores_count': fullscores_count,
               'countries_count': countries_count,
               'keydatasets_count': cls.keydataset_count(
                   applicability, category)
               }

        ret['countries'] = cls.calculate_ranking(world_score_tree, queryset,
                                                 kd_queryset)
        for country in ret['countries']:
            country['score'] = cls.score_fmt(country['score'])

        return ret

    @classmethod
    def country_details(cls, request, country_id):
        try:
            country = Country.objects.get(wb_id=country_id)
        except ObjectDoesNotExist:
            raise Http404()
        queryset = Dataset.objects.filter(
            keydataset__level__name='National',
            country__wb_id=country_id).order_by('keydataset__pk')
        kqueryset = KeyDataset.objects.filter(
            level__name='National').order_by('pk')

        applicability = request.query_params.getlist('applicability')
        category = request.query_params.getlist('category')
        if applicability:
            q = Q()
            kq = Q()
            for v in applicability:
                # FIXME currently in tag we may have extra applicabilities
                # when category (tag group) is 'hazard'
                q = q | (Q(keydataset__applicability__name__iexact=v) |
                         Q(tag__name__iexact=v))
                kq = kq | Q(applicability__name__iexact=v)

            queryset = queryset.filter(q).distinct()
            kqueryset = kqueryset.filter(kq).distinct()

        if category:
            q = Q()
            kq = Q()
            for v in category:
                q = q | Q(keydataset__category__name__iexact=v)
                kq = kq | Q(category__name__iexact=v)

            queryset = queryset.filter(q).distinct()
            kqueryset = kqueryset.filter(kq).distinct()

        country_score_tree = OrderedDict()
        for dataset in queryset:
            cls.country_loadtree(request, country_score_tree, dataset)
        country_fullscore_tree = OrderedDict()
        fullscore_queryset = queryset.filter(
                **fullscore_filterargs)
        for dataset in fullscore_queryset:
            cls.country_loadtree(request, country_fullscore_tree, dataset)

        datasets_count = queryset.count()
        fullscores_count = fullscore_queryset.count()
        country_score = cls.country(country_score_tree, country)

        interesting_fields = [
            'is_existing', 'is_digital_form', 'is_avail_online',
            'is_avail_online_meta', 'is_bulk_avail', 'is_machine_read',
            'is_pub_available', 'is_avail_for_free', 'is_open_licence',
            'is_prov_timely']

        categories = KeyCategory.objects.all().order_by('id')
        categories_counters = []
        cat_cou = {}
        for cat in categories:
            cat_cou = 0
            cat_full_cou = 0
            if cat.code in country_score_tree:
                category_score_tree = country_score_tree[cat.code]
                cat_cou += category_score_tree['counter']
                try:
                    category_fullscore_tree = country_fullscore_tree[cat.code]
                    cat_full_cou += category_fullscore_tree['counter']
                except Exception:
                    pass

            categories_counters.append({'category': cat.name,
                                        'count': cat_cou,
                                        'fullcount': cat_full_cou})

        ret = {'score': cls.score_fmt(country_score),
               'scores': [["kd_code", "kd_description", "score"]],
               'datasets_count': datasets_count,
               'fullscores_count': fullscores_count,
               'categories_counters': categories_counters,
               'perils_counters': [],
               'missing_datasets': []}
        ret_score = ret['scores']
        ret_missing_datasets = ret['missing_datasets']

        for int_field in interesting_fields:
            ret_score[0].append(Dataset._meta.get_field(
                int_field).verbose_name)

        for _, category_score_tree in country_score_tree.items():
            for _, keydataset_score_tree in category_score_tree['score'
                                                                ].items():
                is_first = True
                for dataset in keydataset_score_tree['dataset']:
                    if is_first:
                        is_first = False
                        value = cls.score_fmt(keydataset_score_tree['value'])
                    else:
                        value = "0.0"
                    row = [dataset.keydataset.code,
                           dataset.keydataset.description,
                           value]
                    for int_field in interesting_fields:
                        row.append(getattr(dataset, int_field))

                    ret_score.append(row)

        th_notable = country.thinkhazard_appl.all()

        perils_counters = ret['perils_counters']
        for peril in KeyTag.objects.filter(
                is_peril=True).order_by('name'):
            superset = (queryset.filter(keydataset__applicability=peril) |
                        queryset.filter(tag=peril))
            peril_queryset = superset.distinct()
            fullscore_queryset = peril_queryset.filter(
                **fullscore_filterargs)
            count = peril_queryset.count()
            fullcount = fullscore_queryset.count()

            if peril in th_notable:
                notable = True
            else:
                notable = False

            perils_counters.append({'name': peril.name,
                                    'count': count,
                                    'fullcount': fullcount,
                                    'notable': notable})

        dsname_set = {x[0] for x in queryset.values_list(
            'keydataset__dataset').distinct()}

        if applicability or category:
            kdn = KeyDatasetName.objects.filter(
                keydatasets__in=kqueryset).distinct()
        else:
            kdn = KeyDatasetName.objects.all()

        for dsname in kdn.exclude(
                pk__in=dsname_set).order_by('category', 'name'):
            ret_missing_datasets.append(
                {"id": dsname.pk, "name": dsname.name,
                 "category": dsname.category})

        return ret

    @classmethod
    def country_scoring_details(cls, request, country_id):
        try:
            country = Country.objects.get(wb_id=country_id)
        except ObjectDoesNotExist:
            raise Http404()

        applicability = request.query_params.getlist('applicability')
        category = request.query_params.getlist('category')

        worldqueryset = Dataset.objects.filter(
            keydataset__level__name='National')
        kd_queryset = KeyDataset.objects.filter(level__name='National')
        if applicability:
            q = Q()
            kd_q = Q()
            for v in applicability:
                # FIXME currently in tag we may have extra applicabilities
                # when category (tag group) is 'hazard'
                q = q | (Q(keydataset__applicability__name__iexact=v) |
                         Q(tag__name__iexact=v))
                kd_q = kd_q | Q(applicability__name__iexact=v)

            worldqueryset = worldqueryset.filter(q).distinct()
            kd_queryset = kd_queryset.filter(kd_q).distinct()

        if category:
            q = Q()
            kd_q = Q()
            for v in category:
                q = q | Q(keydataset__category__name__iexact=v)
                kd_q = kd_q | Q(category__name__iexact=v)
            worldqueryset = worldqueryset.filter(q).distinct()
            kd_queryset = kd_queryset.filter(kd_q).distinct()

        world_score_tree = cls.country_scoring_dataset_loadtree(
            request, worldqueryset)

        rank = cls.calculate_ranking(
            world_score_tree, worldqueryset, kd_queryset,
            country_in=country_id)

        queryset = Dataset.objects.filter(
            keydataset__level__name='National',
            country__wb_id=country_id).order_by('keydataset__pk')
        kqueryset = KeyDataset.objects.filter(
            level__name='National').order_by('pk')

        if applicability:
            q = Q()
            kq = Q()
            for v in applicability:
                # FIXME currently in tag we may have extra applicabilities
                # when category (tag group) is 'hazard'
                q = q | (Q(keydataset__applicability__name__iexact=v) |
                         Q(tag__name__iexact=v))
                kq = kq | Q(applicability__name__iexact=v)

            queryset = queryset.filter(q).distinct()
            kqueryset = kqueryset.filter(kq).distinct()

        if category:
            q = Q()
            kq = Q()
            for v in category:
                q = q | Q(keydataset__category__name__iexact=v)
                kq = kq | Q(category__name__iexact=v)

            queryset = queryset.filter(q).distinct()
            kqueryset = kqueryset.filter(kq).distinct()

        country_score_tree = cls.country_scoring_newitem()
        for dataset in queryset:
            cls.country_scoring_loadtree(request, country_score_tree, dataset)
        country_fullscore_tree = cls.country_scoring_newitem()
        fullscore_queryset = queryset.filter(
                **fullscore_filterargs)
        for dataset in fullscore_queryset:
            cls.country_scoring_loadtree(request, country_fullscore_tree,
                                         dataset)
        datasets_count = queryset.count()
        fullscores_count = fullscore_queryset.count()

        queryset_ds = queryset.values('keydataset__dataset').annotate(
            Max('score'))
        datasets_count_ds = len(queryset_ds)
        fullqueryset_ds = queryset_ds.filter(score__range=(0.999999, 1.000001))
        fullscores_count_ds = len(fullqueryset_ds)

        datasetname_n = kd_queryset.values('dataset').distinct().count()

        country_score = cls.country_scoring_dsname(queryset, datasetname_n)

        interesting_fields = [
            'is_existing', 'is_digital_form', 'is_avail_online',
            'is_avail_online_meta', 'is_bulk_avail', 'is_machine_read',
            'is_pub_available', 'is_avail_for_free', 'is_open_licence',
            'is_prov_timely']

        categories = KeyCategory.objects.all().order_by('id')
        categories_counters = []
        cat_cou = {}
        for cat in categories:
            cat_cou = 0
            cat_full_cou = 0
            if cat.code in country_score_tree['category']:
                category_score_tree = country_score_tree['category'][cat.code]
                cat_cou += category_score_tree['counter']
                try:
                    category_fullscore_tree = country_fullscore_tree[
                        'category'][cat.code]
                    cat_full_cou += category_fullscore_tree[
                        'category']['counter']
                except Exception:
                    pass

            categories_counters.append({'category': cat.name,
                                        'count': cat_cou,
                                        'fullcount': cat_full_cou})

        ret = {'rank': rank['rank'],
               'score': cls.score_fmt(country_score),
               'scores': [["id", "name", "category", "instance_id",
                           "score"]],
               'datasets_count': datasets_count_ds,
               'fullscores_count': fullscores_count_ds,
               'categories_counters': categories_counters,
               'perils_counters': [],
               'keydatasets_count': cls.keydataset_count(applicability, category),
        }
        ret_score = ret['scores']

        for int_field in interesting_fields:
            ret_score[0].append(Dataset._meta.get_field(
                int_field).verbose_name)
        ret_score[0].extend(["title", "modify_time", "institution"])

        # datasetnames-based scores
        dsname_score_tree = country_score_tree['dsname']
        if applicability or category:
            kdn = KeyDatasetName.objects.filter(
                keydatasets__in=kqueryset).distinct()
        else:
            kdn = KeyDatasetName.objects.all()

        for dsname in kdn.order_by('category', 'name'):
            if dsname.pk in dsname_score_tree:
                dsname_score = dsname_score_tree[dsname.pk]
                is_first = True
                rows = []
                for dataset in dsname_score['dataset']:
                    if is_first:
                        is_first = False
                        value = cls.score_fmt(dsname_score['value'])
                    else:
                        value = "0.0"

                    row = [dsname.pk, dsname.name, dsname.category,
                           dataset.id, value]
                    for int_field in interesting_fields:
                        row.append(getattr(dataset, int_field))
                    row.extend([dataset.title, dataset.is_prov_timely_last,
                                dataset.is_existing_txt])
                    rows.append(row)
            else:
                rows = [[dsname.pk, dsname.name,
                         dsname.category, None, "-100.0"]]
                for int_field in interesting_fields:
                    rows[0].append(None)

            ret_score.extend(rows)

        th_notable = country.thinkhazard_appl.all()

        perils_counters = ret['perils_counters']
        for peril in KeyTag.objects.filter(
                is_peril=True).order_by('name'):
            superset = (queryset.filter(keydataset__applicability=peril) |
                        queryset.filter(tag=peril))
            peril_queryset = superset.distinct()
            peril_fullscore_queryset = peril_queryset.filter(
                **fullscore_filterargs)
            count = peril_queryset.count()
            fullcount = peril_fullscore_queryset.count()

            if peril in th_notable:
                notable = True
            else:
                notable = False

            perils_counters.append({'name': peril.name,
                                    'count': count,
                                    'fullcount': fullcount,
                                    'notable': notable})

        return ret

    @classmethod
    def all_countries_categories(cls, request):
        queryset = Dataset.objects.filter(keydataset__level__name='National')
        applicability = request.query_params.getlist('applicability')
        if applicability:
            q = Q()
            for v in applicability:
                # FIXME currently in tag we may have extra applicabilities
                # when category (tag group) is 'hazard'
                q = q | (Q(keydataset__applicability__name__iexact=v) |
                         Q(tag__name__iexact=v))
            queryset = queryset.filter(q).distinct()

        category = request.query_params.getlist('category')
        if category:
            categories = []
            for v in category:
                categories.append(KeyCategory.objects.filter(
                    name__iexact=v)[0])
        else:
            categories = KeyCategory.objects.all().order_by('id')

        world_score_tree = cls.dataset_loadtree(request, queryset)

        row = ['country', 'score']
        for category in categories:
            row.append(category.name)
        ret = [row]

        for country in Country.objects.all().order_by('name'):
            if country.wb_id not in world_score_tree:
                continue
            else:
                country_score_tree = world_score_tree[country.wb_id]
                country_score = cls.country(
                    world_score_tree[country.wb_id], country)

                row = [country.wb_id]
                row.append(cls.score_fmt(country_score))
                for category in categories:
                    if category.code not in country_score_tree:
                        row.append(cls.score_fmt(-1))
                        continue
                    category_score = cls.category(
                        category, country_score_tree)
                    row.append(cls.score_fmt(category_score))

                ret.append(row)

        return ret

    # ------ scoring_dataset related methods ------
    @classmethod
    def dsnames_country_loadtree(cls, request, country_score_tree, dataset):
        category_id = dataset.keydataset.category.code
        keydataset_id = dataset.keydataset.code
        # datasetname_id = dataset.keydataset.dataset.id

        if category_id not in country_score_tree['category']:
            country_score_tree['category'][category_id] = OrderedDict(
                [('score', OrderedDict()), ('counter', 0)])
        category_score_tree = country_score_tree['category'][category_id]
        category_score_tree['counter'] += 1
        if keydataset_id not in category_score_tree['score']:
            category_score_tree['score'][keydataset_id] = {
                "dataset": None, 'value': -1}
        keydataset_score_tree = category_score_tree['score'][keydataset_id]
        score = dataset.score_th_norm

        if keydataset_score_tree['value'] < score:
            keydataset_score_tree['value'] = score
            keydataset_score_tree['dataset'].insert(0, dataset)
        else:
            keydataset_score_tree['dataset'].append(dataset)

    @classmethod
    def world_statistics(cls, request):
        countries = len(Dataset.objects.all().values('country').distinct())
        datasets_count = len(Dataset.objects.all())
        fullscores_count = len(Dataset.objects.filter(
            score__range=(0.999999, 1.000001)))
        ret = {
            'countries': countries,
            'datasets_count': datasets_count,
            'fullscores_count': fullscores_count
            }
        return ret


class ScoringWorldGet(APIView):
    """This view return the list of country with dataset instances and
 their scores"""

    def get(self, request):
        ret = Score.all_countries(request)
        return Response(ret)


class CountryScoringWorldGet(APIView):
    """This view return the list of country with dataset instances and
 their scores"""

    def get(self, request):
        ret = Score.all_country_scoring(request)
        return Response(ret)


class CountryScoringNewWorldGet(APIView):
    """This view return the list of country with dataset instances and
 their scores"""

    def get(self, request):
        ret = Score_new.all_country_scoring_new(request)
        return Response(ret)

    # select country_id, count(pri.part) as kd_num from (select country_id, keydataset_id as part from ordd_api_dataset group by country_id, keydataset_id) as pri GROUP BY country_id ORDER BY kd_num;

class CountryScoringCountryDetailsGet(APIView):
    """This view return the list best datasets for each keydataset for a specific
country with related scores"""

    def get(self, request, country_id):
        ret = Score.country_scoring_details(request, country_id)
        return Response(ret)


class ScoringCountryDetailsGet(APIView):
    """This view return the list best datasets for each keydataset for a specific
country with related scores"""

    def get(self, request, country_id):
        ret = Score.country_details(request, country_id)
        return Response(ret)


class ScoringWorldCategoriesGet(APIView):
    """This view return the list of countries with score for each category"""

    def get(self, request):
        ret = Score.all_countries_categories(request)
        return Response(ret)


class WorldStatisticsGet(APIView):
    """This view return the list of countries with score for each category"""

    def get(self, request):
        ret = Score.world_statistics(request)
        return Response(ret)


class ScoringNewWorldGet(APIView):
    """This view return the list of country with dataset instances and
 their scores"""

    def get(self, request):
        ret = ScoreNew.all_countries_new(request)
        return Response(ret)


class ScoringNewCountryDetailsGet(APIView):
    """This view return the list best datasets for each keydataset for a specific
country with related scores"""

    def get(self, request, country_id):
        ret = ScoreNew.country_details(request, country_id)
        return Response(ret)


class ScoringUpdate(APIView):
    """This class allow to recalculate scores for each dataset,
    handles the GET requests."""
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        for dataset in Dataset.objects.all():
            dataset.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
