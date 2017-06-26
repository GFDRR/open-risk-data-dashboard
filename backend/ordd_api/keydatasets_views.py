# keydatasets_views.py
from rest_framework import generics
from rest_framework.exceptions import NotFound

# from django_filters.rest_framework import DjangoFilterBackend
# import django_filters.rest_framework
# from .permissions import IsOwner

from .keydatasets_serializers import (
    KeyDataset0on4Serializer, KeyDataset1on4Serializer,
    KeyDataset2on4Serializer, KeyDataset3on4Serializer,
    KeyDataset4on4Serializer,
    )
from .models import KeyDataset

# import django_filters
# class KeyDatasetFilter(django_filters.FilterSet):
#     category = django_filters.CharFilter(name='category__name', distinct=True)

#     class Meta:
#         model = KeyDataset
#         fields = ['category__name']


class KeyDataset0on4ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    queryset = KeyDataset.objects.all().order_by("category").distinct("category")
    serializer_class = KeyDataset0on4Serializer


class KeyDataset1on4ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset1on4Serializer

    def get_queryset(self):
        category = self.kwargs['category']

        return KeyDataset.objects.filter(
            category=category).order_by("dataset").distinct("dataset")


class KeyDataset2on4ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset2on4Serializer

    def get_queryset(self):
        category = self.kwargs['category']
        dataset = self.kwargs['dataset']

        return KeyDataset.objects.filter(
            category=category,
            dataset=dataset).order_by("description").distinct("description")


class KeyDataset3on4ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset3on4Serializer

    def get_queryset(self):
        category = self.kwargs['category']
        dataset = self.kwargs['dataset']
        description = self.kwargs['description']

        filters = {'category': category,
                   'dataset': dataset,
                   'description': description}

        qs = KeyDataset.objects.filter(**filters).order_by(
            "scale").distinct("scale")

        return qs


class KeyDataset4on4ListView(generics.ListAPIView):
    """This class handles the GET and POSt requests of our rest api."""
    serializer_class = KeyDataset4on4Serializer

    def get_queryset(self):
        category = self.kwargs['category']
        dataset = self.kwargs['dataset']
        description = self.kwargs['description']
        scale = self.kwargs['scale']

        filters = {'category': category,
                   'dataset': dataset,
                   'description': description,
                   'scale': scale}

        qs = KeyDataset.objects.filter(**filters)

        if len(qs) != 1:
            raise NotFound('key not found')

        return qs

#    filter_backends = (KeyDatasetFilter,)
#    filter_fields = ('category',)
