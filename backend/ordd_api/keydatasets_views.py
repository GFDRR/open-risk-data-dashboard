# keydatasets_views.py
from rest_framework import generics
from rest_framework.exceptions import NotFound

# from django_filters.rest_framework import DjangoFilterBackend
# import django_filters.rest_framework
# from .permissions import IsOwner

from .keydatasets_serializers import (
    KeyDataset0on5Serializer, KeyDataset1on5Serializer, KeyDataset2on5Serializer,
    KeyDataset3on5Serializer, KeyDataset4on5Serializer, KeyDataset5on5Serializer,
    )
from .models import KeyDataset

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
