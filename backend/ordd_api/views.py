# views.py
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
# from django_filters.rest_framework import DjangoFilterBackend
# import django_filters.rest_framework
from django.db.models import Func, F
from django.contrib.auth.models import User

from .serializers import (
    RegionSerializer, CountrySerializer,
    ProfileSerializer, UserSerializer, RegistrationSerializer,
    ChangePasswordSerializer,
    ProfileDatasetListSerializer, ProfileDatasetCreateSerializer,
    )
from .models import Region, Country, OptIn, Dataset


# class IsOwner(permissions.BasePermission):
#     """
#     Custom permission to only allow owners of an object to edit it.
#     """
#     def has_permission(self, request, view):
#         return request.user and request.user.is_authenticated()

#     def has_object_permission(self, request, view, obj):
#         return obj.user == request.user


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
        print("Request GET: username [%s] key [%s]" % (request.GET['username'],
              request.GET['key']))
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
        print(self.request.method)
        if self.request.method == "GET":
            return ProfileDatasetListSerializer
        elif self.request.method == "POST":
            return ProfileDatasetCreateSerializer

    def get_queryset(self):
        return Dataset.objects.filter(
            owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, changed_by=self.request.user)


class ProfileDatasetDetailsView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProfileDatasetListSerializer
    permission_classes = (IsOwner, )

    def get_serializer_class(self):
        print(self.request.method)
        if self.request.method == "GET":
            return ProfileDatasetListSerializer
        else:
            return ProfileDatasetCreateSerializer

    def get_queryset(self):
        return Dataset.objects.filter(
            owner=self.request.user)


class DatasetListView(generics.ListAPIView):
    """This class handles the GET requests of our rest api."""
    queryset = Dataset.objects.all().order_by('country')
    serializer_class = ProfileDatasetListSerializer


class TagsListView(APIView):
    """This class handles the GET requests of our rest api."""

    def get_queryset(self):
        return list(Dataset.objects.values('tags')
                    .annotate(tags_list=Func(F('tags'), function='unnest'))
                    .values_list('tags_list', flat=True)
                    .distinct())

    def get(self, request):
        return Response({'tags': self.get_queryset()})
