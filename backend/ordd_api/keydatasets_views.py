# keydatasets_views.py
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

# from django_filters.rest_framework import DjangoFilterBackend
# import django_filters.rest_framework
# from .permissions import IsOwner

from .keydatasets_serializers import (
    KeyDataset0on4Serializer, KeyDataset1on4Serializer,
    KeyDataset2on4Serializer, KeyDataset3on4Serializer,
    KeyDataset4on4Serializer, KeyTagSerializer
    )
from .models import KeyDataset, KeyTagGroup

# import django_filters
# class KeyDatasetFilter(django_filters.FilterSet):
#     category = django_filters.CharFilter(name='category__name',
#                                          distinct=True)
#
#     class Meta:
#         model = KeyDataset
#         fields = ['category__name']


class KeyDataset0on4ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = (KeyDataset.objects.all().order_by("level")
                .distinct("level"))
    serializer_class = KeyDataset0on4Serializer


class KeyDataset1on4ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset1on4Serializer

    def get_queryset(self):
        level = self.kwargs['level']

        filters = {}
        if level > '0':
            filters['level'] = level

        return (KeyDataset.objects.filter(**filters).
                order_by("category").distinct("category"))


class KeyDataset2on4ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset2on4Serializer

    def get_queryset(self):
        level = self.kwargs['level']
        category = self.kwargs['category']

        filters = {}
        if level > '0':
            filters['level'] = level
        if category > '0':
            filters['category'] = category

        return (KeyDataset.objects.filter(**filters)
                .order_by("dataset").distinct("dataset"))


class KeyDataset3on4ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset3on4Serializer

    def get_queryset(self):
        level = self.kwargs['level']
        category = self.kwargs['category']
        dataset = self.kwargs['dataset']

        filters = {}
        if level > '0':
            filters['level'] = level
        if category > '0':
            filters['category'] = category
        if dataset > '0':
            filters['dataset'] = dataset

        qs = KeyDataset.objects.filter(**filters).order_by(
            "description").distinct("description")

        return qs


class KeyDataset4on4ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset4on4Serializer

    def get_queryset(self):
        level = self.kwargs['level']
        category = self.kwargs['category']
        dataset = self.kwargs['dataset']
        description = self.kwargs['description']

        filters = {}
        if level > '0':
            filters['level'] = level
        if category > '0':
            filters['category'] = category
        if dataset > '0':
            filters['dataset'] = dataset
        if description > '0':
            filters['description'] = description

        qs = KeyDataset.objects.filter(**filters)

        if len(qs) != 1:
            raise NotFound('key not found')

        return qs

#    filter_backends = (KeyDatasetFilter,)
#    filter_fields = ('category',)


class KeyDatasetTagGroup(APIView):
    """This class handles the GET requests of our rest api."""

    def get_queryset(self):
        return list(KeyTagGroup.objects.values_list('group', flat=True))

    def get(self, request):
        return Response({'tags': self.get_queryset()})


class KeyDatasetTag(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyTagSerializer

    def get_queryset(self):
        return KeyTagGroup.objects.filter(group=self.kwargs['group'])
