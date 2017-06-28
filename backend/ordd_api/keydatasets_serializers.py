from rest_framework import serializers
from .models import (
    Category, LevDataset, LevDescription,
    LevScale, KeyDataset)


class KeyLevScaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevScale
        fields = ('id', 'name')


class KeyCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')


class KeyLevDatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevDataset
        fields = ('id', 'name')


class KeyLevDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevDescription
        fields = ('id', 'name')


class KeyDataset0on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets -> scale """

    scale = KeyLevScaleSerializer()

    class Meta:
        model = KeyDataset
        fields = ('scale',)


class KeyDataset1on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets filtered by scale -> category"""

    scale = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    category = KeyCategorySerializer()

    class Meta:
        model = KeyDataset
        fields = ('scale', 'category')


class KeyDataset2on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets filtered by scale and
       category -> dataset"""

    scale = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    category = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    dataset = KeyLevDatasetSerializer()

    class Meta:
        model = KeyDataset
        fields = ('scale', 'category', 'dataset',)


class KeyDataset3on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets filtered by scale, category,
       and dataset -> description"""

    scale = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    category = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    dataset = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    description = KeyLevDescriptionSerializer()

    class Meta:
        model = KeyDataset
        fields = ('scale', 'category', 'dataset', 'description',)


class KeyDataset4on4Serializer(serializers.ModelSerializer):
    """Serializer of key datasets filtered by scale, category, dataset,
       description"""
    scale = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    category = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    dataset = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    description = serializers.SlugRelatedField(
        read_only=True, slug_field='name')

    class Meta:
        model = KeyDataset
        fields = ('id', 'scale', 'category', 'dataset', 'description')
