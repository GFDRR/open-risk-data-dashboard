# api_exp01/views.py
import urllib
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django_filters.rest_framework import DjangoFilterBackend
import django_filters.rest_framework
from django.contrib.auth.models import User

# from .permissions import IsOwner
from .serializers import (
    RegionSerializer, CountrySerializer,
    KeyDataset0on5Serializer, KeyDataset1on5Serializer, KeyDataset2on5Serializer,
    KeyDataset3on5Serializer, KeyDataset4on5Serializer, KeyDataset5on5Serializer,
    ProfileSerializer, UserSerializer, RegistrationSerializer,
    ChangePasswordSerializer)
from .models import Region, Country, KeyDataset


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated()

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


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
        return Response({"response": "ok"})

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
        """Save the post data when creating a new bucketlist."""
        serializer.save()

class UserDetailsView(generics.RetrieveUpdateDestroyAPIView):
    """This class handles GET, PUT, PATCH and DELETE requests."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)

# import django_filters
# class KeyDatasetFilter(django_filters.FilterSet):
#     category = django_filters.CharFilter(name='category__name', distinct=True)

#     class Meta:
#         model = KeyDataset
#         fields = ['category__name']

class KeyDataset0on5ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = KeyDataset.objects.all().order_by("category").distinct("category")
    serializer_class = KeyDataset0on5Serializer


class KeyDataset1on5ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset1on5Serializer

    def get_queryset(self):
        category = self.kwargs['category']

        return KeyDataset.objects.filter(
            category=category).order_by("dataset").distinct("dataset")


class KeyDataset2on5ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset2on5Serializer

    def get_queryset(self):
        category = self.kwargs['category']
        dataset = self.kwargs['dataset']

        return KeyDataset.objects.filter(
            category=category,
            dataset=dataset).order_by("description").distinct("description")


class KeyDataset3on5ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset3on5Serializer

    def get_queryset(self):
        category = self.kwargs['category']
        dataset = self.kwargs['dataset']
        description = self.kwargs['description']

        return KeyDataset.objects.filter(
            category=category, dataset=dataset,
            description=description
            ).order_by("resolution").distinct("resolution")

class KeyDataset4on5ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset4on5Serializer

    def get_queryset(self):
        category = self.kwargs['category']
        dataset = self.kwargs['dataset']
        description = self.kwargs['description']
        resolution = self.kwargs['resolution']

        filters = {'category': category,
                   'dataset': dataset,
                   'description': description}

        if self.kwargs['resolution'] == '':
            filters['resolution__isnull'] = True
        else:
            filters['resolution'] = resolution

        qs = KeyDataset.objects.filter(**filters).order_by(
            "scale").distinct("scale")

        return qs


class KeyDataset5on5ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset5on5Serializer

    def get_queryset(self):
        category = self.kwargs['category']
        dataset = self.kwargs['dataset']
        description = self.kwargs['description']
        resolution = self.kwargs['resolution']
        scale = self.kwargs['scale']

        filters = {'category': category,
                   'dataset': dataset,
                   'description': description,
                   'scale': scale}

        if self.kwargs['resolution'] == '':
            filters['resolution__isnull'] = True
        else:
            filters['resolution'] = resolution

        qs = KeyDataset.objects.filter(**filters)

        if len(qs) != 1:
            raise NotFound('key not found')

        return qs

#    filter_backends = (KeyDatasetFilter,)
#    filter_fields = ('category',)
