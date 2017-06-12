# api_exp01/views.py

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.decorators import login_required

from django.contrib.auth import get_user
# from .permissions import IsOwner
from ordd.settings import ORDD_API_BASEPATH
from .serializers import RegionSerializer, CountrySerializer, UserSerializer
from .models import Region, Country

#
#  NOTE:
#    permission_classes = (
#        permissions.IsAuthenticated, IsOwner)

@api_view(['GET'])
def ProfileCreateView(request):
    """This view return base user fields, included groups"""
    if not request.user.is_authenticated:
        raise PermissionDenied()

    instance = get_user(request)
    serializer = UserSerializer(instance)
    return Response(serializer.data)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def UserCreateView(request):
    if not request.user.is_authenticated:
        raise PermissionDenied()

    user = get_user(request)
    if not user.groups.filter(name='admin'):
        raise PermissionDenied()

    return Response({'answer': 'Work In Progress'})

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
