# api_exp01/views.py

from rest_framework import generics, permissions, mixins
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.exceptions import PermissionDenied
from rest_framework import status
from django.contrib.auth import get_user
from django.contrib.auth.models import User

# from .permissions import IsOwner
from .serializers import RegionSerializer, CountrySerializer, ProfileSerializer, UserSerializer
from .models import Region, Country

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated()

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

#mixins.RetrieveModelMixin,
#                    ,
class ProfileDetail(generics.GenericAPIView):
    queryset = User.objects.all()
    serializer_class = ProfileSerializer

    def get(self, request, format=None):
        if not request.user.is_authenticated:
            raise PermissionDenied()

        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied()

        serializer = ProfileSerializer(request.user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#    def options(self, request, *args, **kwargs):
#        data = super(ProfileDetail, self).metadata(request)
#        return Response({'msg': 'WIP'})

#    def metadata(self, request):
#        data = super(ProfileDetail, self).metadata(request)
#        return data
#    def delete(self, request, *args, **kwargs):
#        return self.destroy(request, *args, **kwargs)








def profile_get_queryset(self):
    user = self.request.user
    return user

class ProfileCreateViewEx(generics.RetrieveUpdateAPIView):
    """This class handles GET, PUT, PATCH and DELETE requests."""
    queryset = profile_get_queryset
    serializer_class = ProfileSerializer
    permission_classes = (IsOwner,)

@api_view(['GET'])
def ProfileCreateView(request):
    """This view return base user fields, included groups"""
    if not request.user.is_authenticated:
        raise PermissionDenied()

    instance = get_user(request)
    # request.data.pk == instance.pk
    return ProfileCreateViewEx()
#    serializer = UserSerializer(instance)
#    return Response(serializer.data)



class RegionCreateView(generics.ListCreateAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def perform_create(self, serializer):
        """Save the post data when creating a new bucketlist."""
        # owner=self.request.user
        serializer.save()


class CountryCreateView(generics.ListCreateAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    # permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def perform_create(self, serializer):
        """Save the post data when creating a new bucketlist."""
        # owner=self.request.user
        serializer.save()

class UserCreateView(generics.ListCreateAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)

    def perform_create(self, serializer):
        """Save the post data when creating a new bucketlist."""
        # owner=self.request.user
        serializer.save()

class UserDetailsView(generics.RetrieveUpdateDestroyAPIView):
    """This class handles GET, PUT, PATCH and DELETE requests."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)
