from rest_framework import serializers
from .models import (
    KeyCategory, KeyDatasetName, KeyDescription, KeyTagGroup,
    KeyScale, KeyDataset)


class KeyScaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyScale
        fields = ('id', 'name')


class KeyCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyCategory
        fields = ('id', 'name')


class KeyDatasetSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField('name_str')

    # We want the str representation of the object, not just the name field
    def name_str(self, obj):
        return str(obj)

    class Meta:
        model = KeyDatasetName
        fields = ('id', 'name')


class KeyTagSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(read_only=True, many=True,
                                        slug_field='name')

    class Meta:
        model = KeyTagGroup
        fields = ('group', 'tags')


class KeyDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyDescription
        fields = ('id', 'name')


class KeyDataset0on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets -> level """

    level = KeyScaleSerializer()

    class Meta:
        model = KeyDataset
        fields = ('level',)


class KeyDataset1on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets filtered by level -> category"""

    level = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    category = KeyCategorySerializer()

    class Meta:
        model = KeyDataset
        fields = ('level', 'category')


class KeyDataset2on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets filtered by level and
       category -> dataset"""

    level = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    category = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    dataset = KeyDatasetSerializer()

    class Meta:
        model = KeyDataset
        fields = ('level', 'category', 'dataset')


class KeyDataset3on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets filtered by level, category,
       and dataset -> description"""

    level = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    category = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    dataset = serializers.StringRelatedField()
    description = KeyDescriptionSerializer()

    class Meta:
        model = KeyDataset
        fields = ('level', 'category', 'dataset', 'description',)


class KeyDataset4on4Serializer(serializers.ModelSerializer):
    """Serializer of key datasets filtered by level, category, dataset,
       description"""
    level = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    category = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    dataset = serializers.StringRelatedField()
    description = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    tag_available = KeyTagSerializer()
    applicability = serializers.SlugRelatedField(
        read_only=True, many=True, slug_field='name')

    class Meta:
        model = KeyDataset
        fields = ('id', 'level', 'category', 'dataset', 'description',
                  'tag_available', 'applicability')
