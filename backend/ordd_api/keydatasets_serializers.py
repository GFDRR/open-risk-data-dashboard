from rest_framework import serializers
from .models import (
    Category, LevDataset, LevDescription,
    LevScale, KeyDataset)


class KeyCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')


class KeyDataset0on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets -> categories """

    category = KeyCategorySerializer()

    class Meta:
        model = KeyDataset
        fields = ('category',)


class KeyLevDatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevDataset
        fields = ('id', 'name')


class KeyDataset1on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets filtered by category -> datasets"""

    dataset = KeyLevDatasetSerializer()

    class Meta:
        model = KeyDataset
        fields = ('dataset',)


class KeyLevDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevDescription
        fields = ('id', 'name')


class KeyDataset2on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets filtered by category
 and dataset -> descriptions"""

    description = KeyLevDescriptionSerializer()

    class Meta:
        model = KeyDataset
        fields = ('description',)


class KeyLevScaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevScale
        fields = ('id', 'name')


class KeyDataset3on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets filtered by category,
 dataset and description -> scales"""

    scale = KeyLevScaleSerializer()

    class Meta:
        model = KeyDataset
        fields = ('scale',)


class KeyDataset4on4Serializer(serializers.ModelSerializer):
    """Serializer of key datasets filtered by category, dataset, description
 and scale"""
    category = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    dataset = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    description = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    scale = serializers.SlugRelatedField(
        read_only=True, slug_field='name')

    class Meta:
        model = KeyDataset
        fields = ('id', 'category', 'dataset', 'description', 'scale')
