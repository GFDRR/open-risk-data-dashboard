# api_exp01/views.py

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view

from django.contrib.auth import get_user
# from .permissions import IsOwner
from .serializers import RegionSerializer, CountrySerializer, UserSerializer
from .models import Region, Country

#
#  NOTE:
#    permission_classes = (
#        permissions.IsAuthenticated, IsOwner)


# class UserGetView(generics.RetrieveAPIView):
#     serializer_class = serializers.PostSerializer
@api_view(['GET'])
def UserRetrieveView(request):
    """This view return base user fields, included groups"""
    instance = get_user(request)
    serializer = UserSerializer(instance)
    return Response(serializer.data)


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
