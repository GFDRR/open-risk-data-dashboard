# views.py
from datetime import datetime
import pytz
import json
from django.db.models import Sum
from rest_framework.renderers import JSONRenderer
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from django.db.models import Q
from django.contrib.auth.models import User

from .serializers import (
    RegionSerializer, CountrySerializer,
    ProfileSerializer, UserSerializer, RegistrationSerializer,
    ChangePasswordSerializer,
    ProfileDatasetListSerializer, ProfileDatasetCreateSerializer,
    DatasetListSerializer, DatasetPutSerializer)
from .models import (Region, Country, OptIn, Dataset, KeyDataset,
                     KeyCategory, KeyPeril)
from .mailer import mailer
from ordd_api import __VERSION__, MAIL_SUBJECT_PREFIX
from ordd.settings import ORDD_ADMIN_MAIL


class VersionGet(APIView):
    """This class handles the GET requests of our rest api."""

    def get(self, request):
        return Response(__VERSION__)


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
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            old_password = serializer.data.get("old_password")
            if not self.object.check_password(old_password):
                return Response({"old_password": ["Wrong password."]},
                                status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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

        detail = "user not exists, is already activated or passed key is wrong"
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

        return Response(status=status.HTTP_204_NO_CONTENT)


class RegionListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = Region.objects.all()
    serializer_class = RegionSerializer


class CountryListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = Country.objects.all()
    serializer_class = CountrySerializer


class CountryDetailsView(generics.RetrieveAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = Country.objects.all()
    serializer_class = CountrySerializer


class UserCreateView(generics.ListCreateAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)

    def perform_create(self, serializer):
        serializer.save()


class UserDetailsView(generics.RetrieveUpdateDestroyAPIView):
    """This class handles GET, PUT, PATCH and DELETE requests."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)


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
            owner=self.request.user)

    def perform_create(self, serializer):
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
            else:
                post_value = post[field].value

            rows.append(
                {"is_list": (type(post_value) is list),
                 "name":
                 post_field._meta.get_field(field).verbose_name,
                 "post": post_value})

        mailer(
            ORDD_ADMIN_MAIL, subject,
            {"title": subject,
             "owner": post_field.changed_by.username,
             "table_title": "Created Dataset",
             "rows": rows},
            {"title": subject,
             "owner": post_field.changed_by.username,
             "table_title": "Created Dataset",
             "rows": rows},
            'create_by_owner')


class ProfileDatasetDetailsView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProfileDatasetListSerializer
    permission_classes = (IsOwner, )

    def get_serializer_class(self):
        try:
            if self.request.method == 'PUT':
                return DatasetPutSerializer
            elif self.request.method != 'GET':
                return ProfileDatasetCreateSerializer
        except:
            pass
        return ProfileDatasetListSerializer

    def get_queryset(self):
        return Dataset.objects.filter(
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
            code=pre['keydataset'].value).__str__()

        # update fields
        serializer.validated_data['changed_by'] = self.request.user
        serializer.validated_data['is_reviewed'] = False

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
            mailer(
                ORDD_ADMIN_MAIL, subject,
                {"title": subject,
                 "changed_by": self.request.user.username,
                 "is_reviewed": post['is_reviewed'].value,
                 "rows": rows},
                {"title": subject,
                 "changed_by": self.request.user.username,
                 "is_reviewed": post['is_reviewed'].value,
                 "rows": rows},
                'update_by_owner')

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
            else:
                post_value = post[field].value

            rows.append(
                {"is_list": (type(post_value) is list),
                 "name":
                 instance._meta.get_field(field).verbose_name,
                 "post": post_value})

        mailer(
            ORDD_ADMIN_MAIL, subject,
            {"title": subject,
             "owner": instance.changed_by.username,
             "table_title": "Deleted Dataset",
             "rows": rows},
            {"title": subject,
             "owner": instance.changed_by.username,
             "table_title": "Deleted Dataset",
             "rows": rows},
            'delete_by_owner')
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
    queryset = Dataset.objects.all()
    serializer_class = DatasetListSerializer

    def get_serializer_class(self):
        try:
            if self.request.method == 'PUT':
                return DatasetPutSerializer
        except:
            pass
        return DatasetListSerializer

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
            mailer(
                post_field.owner.email, subject,
                {"title": subject,
                 "changed_by": post_field.changed_by.username,
                 "is_reviewed": post['is_reviewed'].value, "rows": rows},
                {"title": subject,
                 "changed_by": post_field.changed_by.username,
                 "is_reviewed": post['is_reviewed'].value, "rows": rows},
                'update_by_reviewer')

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
            else:
                post_value = post[field].value

            rows.append(
                {"is_list": (type(post_value) is list),
                 "name":
                 instance._meta.get_field(field).verbose_name,
                 "post": post_value})

        mailer(
            instance.owner.email, subject,
            {"title": subject,
             "reviewer": self.request.user.username,
             "table_title": "Deleted Dataset",
             "rows": rows},
            {"title": subject,
             "reviewer": self.request.user.username,
             "table_title": "Deleted Dataset",
             "rows": rows},
            'delete_by_reviewer')
        instance.delete()


class DatasetListView(generics.ListAPIView):
    serializer_class = DatasetListSerializer

    def get_queryset(self):
        queryset = Dataset.objects.all()
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
            q = q | Q(country__iso2__iexact=v)
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


class Score(object):
    @classmethod
    def dataset_old(cls, request, dataset):
        sum = 0.0

        if dataset.is_existing:
            sum += 5.0
        if dataset.is_digital_form:
            sum += 5.0
        if dataset.is_avail_online:
            sum += 5.0
        if dataset.is_avail_online_meta:
            sum += 5.0
        if dataset.is_bulk_avail:
            sum += 10.0
        if dataset.is_machine_read:
            sum += 15.0
        if dataset.is_pub_available:
            sum += 5.0
        if dataset.is_avail_for_free:
            sum += 15.0
        if dataset.is_open_licence:
            sum += 30.0
        if dataset.is_prov_timely:
            sum += 5.0
        return sum / 100.0

    @classmethod
    def keydataset_old(cls, queryset, request, country, category, keydataset):
        score_max = 0

        queryset = queryset.filter(country=country, keydataset=keydataset)

        applicability = request.query_params.getlist('applicability')
        if applicability:
            q = Q()
            for v in applicability:
                # FIXME currently in tag we may have extra applicabilities
                # when category (tag group) is 'hazard'
                q = q | (Q(keydataset__applicability__name__iexact=v) |
                         Q(tag__name__iexact=v))
            queryset = queryset.filter(q)

        for dataset in queryset:
            score = cls.dataset_old(request, dataset)
            print(score)
            if score_max < score:
                score_max = score

        return score_max

    @classmethod
    def country_old(cls, request, country):

        queryset = Dataset.objects.filter(country=country)

        category_weights_sum = KeyCategory.objects.aggregate(
            Sum('weight'))
        category_weights_sum = float(category_weights_sum['weight__sum'])

        keydataset_weights_sum = KeyDataset.objects.aggregate(
            Sum('weight'))
        keydataset_weights_sum = float(keydataset_weights_sum['weight__sum'])

        applicability_n = KeyPeril.objects.count()
        country_score = 0
        for category in KeyCategory.objects.all():
            category_score = 0
            for keydataset in KeyDataset.objects.filter(category=category):
                keydataset_score = cls.keydataset_old(
                    queryset, request, country, category, keydataset)

                # score must be multiplied by
                #  len(keydataset.applicabilty ⋂ Nation.applicability)
                #      / len(Nation.applicability)
                # Currently we are fallback to this more simple approach
                keydataset_score *= (float(keydataset.applicability.count()) /
                                     float(applicability_n))
                category_score += float(keydataset_score * keydataset.weight)

            category_score /= keydataset_weights_sum
            country_score += float(category_score * category.weight)

        country_score /= category_weights_sum

        return country_score

    @classmethod
    def all_countries_old(cls, request):
        print("BEGIN: %s" % datetime.now())
        ret = []
        for country in Country.objects.all():
            score = cls.country_old(request, country)
            if score == 0:
                continue
            ret.append({"iso2": country.iso2, "name": country.name,
                        "score": score})
        print("END: %s" % datetime.now())
        return ret

    @classmethod
    def dataset(cls, dataset):
        sum = 0.0

        if dataset.is_existing:
            sum += 5.0
        if dataset.is_digital_form:
            sum += 5.0
        if dataset.is_avail_online:
            sum += 5.0
        if dataset.is_avail_online_meta:
            sum += 5.0
        if dataset.is_bulk_avail:
            sum += 10.0
        if dataset.is_machine_read:
            sum += 15.0
        if dataset.is_pub_available:
            sum += 5.0
        if dataset.is_avail_for_free:
            sum += 15.0
        if dataset.is_open_licence:
            sum += 30.0
        if dataset.is_prov_timely:
            sum += 5.0

        return sum / 100.0

    @classmethod
    def country(cls, country_score_tree, country):
        category_weights_sum = KeyCategory.objects.aggregate(
            Sum('weight'))
        category_weights_sum = float(category_weights_sum['weight__sum'])

        keydataset_weights_sum = KeyDataset.objects.aggregate(
            Sum('weight'))
        keydataset_weights_sum = float(keydataset_weights_sum['weight__sum'])

        applicability_n = KeyPeril.objects.count()
        country_score = 0
        for category in KeyCategory.objects.all():
            if category.code not in country_score_tree:
                continue
            category_score_tree = country_score_tree[category.code]

            category_score = 0
            for keydataset in KeyDataset.objects.filter(category=category):
                if keydataset.code not in category_score_tree:
                    continue
                keydataset_score = category_score_tree[keydataset.code][
                    'value']

                # score must be multiplied by
                #  len(keydataset.applicabilty ⋂ Nation.applicability)
                #      / len(Nation.applicability)
                # Currently we are fallback to this more simple approach
                # import pdb ; pdb.set_trace()

                keydataset_score *= (float(keydataset.applicability.count()) /
                                     float(applicability_n))
                category_score += float(keydataset_score * keydataset.weight)

            category_score /= keydataset_weights_sum
            country_score += float(category_score * category.weight)

        country_score /= category_weights_sum

        return country_score

    @classmethod
    def all_countries(cls, request):
        print("BEGIN: %s" % datetime.now())
        queryset = Dataset.objects.all()
        applicability = request.query_params.getlist('applicability')
        if applicability:
            q = Q()
            for v in applicability:
                # FIXME currently in tag we may have extra applicabilities
                # when category (tag group) is 'hazard'
                print("filter")
                q = q | (Q(keydataset__applicability__name__iexact=v) |
                         Q(tag__name__iexact=v))
            queryset = queryset.filter(q).distinct()

        print("Number of item: %d" % queryset.count())

        # preloaded tree with data from datasets to avoid bad performances
        world_score = {}
        for dataset in queryset:
            country_id = dataset.country.iso2
            category_id = dataset.keydataset.category.code
            keydataset_id = dataset.keydataset.code
            if country_id not in world_score:
                world_score[country_id] = {}
            country_score = world_score[country_id]
            if (category_id not in country_score):
                country_score[category_id] = {}
            category_score = country_score[category_id]
            if keydataset_id not in category_score:
                category_score[keydataset_id] = {'value': 0}
            keydataset_score = category_score[keydataset_id]
            score = cls.dataset(dataset)
            if score > keydataset_score['value']:
                keydataset_score['value'] = score

        ret = []

        for country in Country.objects.all():
            # print("COUNTRY: %s" % country.name)
            if country.iso2 not in world_score:
                score = 0
            else:
                score = cls.country(world_score[country.iso2], country)
            if score == 0:
                continue
            ret.append({"iso2": country.iso2, "name": country.name,
                        "score": score})
        print("END: %s" % datetime.now())

        return ret


class ScoringWorldGet(APIView):
    """This class handles the GET requests of our rest api."""

    def get(self, request):
        ret = Score.all_countries(request)
        return Response(ret)
