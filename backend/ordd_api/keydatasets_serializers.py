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
        fields = ('name', 'tags')


class KeyDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyDescription
        fields = ('id', 'name')


class KeyDataset0on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets -> scale """

    scale = KeyScaleSerializer()

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
    dataset = KeyDatasetSerializer()

    class Meta:
        model = KeyDataset
        fields = ('scale', 'category', 'dataset')


class KeyDataset3on4Serializer(serializers.ModelSerializer):
    """Partial serializer of key datasets filtered by scale, category,
       and dataset -> description"""

    scale = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    category = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    dataset = serializers.StringRelatedField()
    description = KeyDescriptionSerializer()

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
    dataset = serializers.StringRelatedField()
    description = serializers.SlugRelatedField(
        read_only=True, slug_field='name')
    tag_group = KeyTagSerializer()
    applicability = serializers.SlugRelatedField(
        read_only=True, many=True, slug_field='name')

    class Meta:
        model = KeyDataset
        fields = ('id', 'scale', 'category', 'dataset', 'description',
                  'tag_group', 'applicability')
