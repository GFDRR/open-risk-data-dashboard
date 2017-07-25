from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from randstr import randstr


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=256, blank=True)
    institution = models.CharField(max_length=256, blank=True)


def my_random_key():
    return randstr(16)


class OptIn(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    key = models.CharField(max_length=16, default=my_random_key)

    def __str__(self):
        return self.key


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


class RegionManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)


class Region(models.Model):
    """World regions"""
    objects = RegionManager()

    name = models.CharField(max_length=64, blank=False)

    def natural_key(self):
        return [self.name]

    def __str__(self):
        return self.name


class CountryManager(models.Manager):
    def get_by_natural_key(self, iso2):
        return self.get(iso2=iso2)


class Country(models.Model):
    """List of world countries with a region reference."""
    objects = CountryManager()

    iso2 = models.CharField(max_length=2, blank=False, unique=True)
    name = models.CharField(max_length=64, blank=False, unique=True)
    region = models.ForeignKey(Region)

    def __str__(self):
        return self.name

    def natural_key(self):
        return [self.iso2]


class KeyCategoryManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)


class KeyCategory(models.Model):
    objects = KeyCategoryManager()

    code = models.CharField(max_length=2, blank=False, unique=True)
    name = models.CharField(max_length=64, blank=False, unique=True)
    weight = models.IntegerField(blank=False)

    def natural_key(self):
        return [self.name]

    def __str__(self):
        return self.name


class KeyDatasetNameManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)


class KeyDatasetName(models.Model):
    objects = KeyDatasetNameManager()

    name = models.CharField(max_length=128, blank=False)
    category = models.CharField(max_length=32, blank=True, null=True)

    class Meta:
        unique_together = (
            ('name', 'category'),
        )

    def natural_key(self):
        return [self.name]

    def __str__(self):
        return ("%s - %s" % (self.category, self.name) if self.category
                is not None else self.name)


class KeyTagGroupManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)


class KeyTagGroup(models.Model):
    objects = KeyTagGroupManager()

    name = models.CharField(max_length=16, blank=False, unique=True)

    def natural_key(self):
        return [self.name]

    def __str__(self):
        return (self.name)


class KeyTagManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)


class KeyTag(models.Model):
    objects = KeyTagManager()

    group = models.ForeignKey(KeyTagGroup, related_name='tags',
                              on_delete=models.CASCADE)
    name = models.CharField(max_length=32, blank=False)

    class Meta:
        unique_together = (
            ('group', 'name'),
        )

    def natural_key(self):
        return [self.name]

    def __str__(self):
        return "%s - %s" % (self.group, self.name)


class KeyLevelManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)


class KeyLevel(models.Model):
    objects = KeyLevelManager()

    name = models.CharField(max_length=32, blank=False, unique=True)

    def natural_key(self):
        return [self.name]

    def __str__(self):
        return self.name


class KeyPerilManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)


class KeyPeril(models.Model):
    objects = KeyPerilManager()

    name = models.CharField(max_length=32, blank=False, unique=True)

    def natural_key(self):
        return [self.name]

    def __str__(self):
        return self.name


class KeyDatasetManager(models.Manager):
    def get_by_natural_key(self, code):
        return self.get(code=code)


class KeyDataset(models.Model):
    objects = KeyDatasetManager()

    code = models.CharField(max_length=6, null=False, blank=False,
                            primary_key=True)
    category = models.ForeignKey(KeyCategory)
    dataset = models.ForeignKey(KeyDatasetName)
    tag_available = models.ForeignKey(KeyTagGroup, null=True, blank=True)
    description = models.CharField(max_length=256, blank=False, unique=True)
    applicability = models.ManyToManyField(KeyPeril)
    level = models.ForeignKey(KeyLevel)

    resolution = models.CharField(max_length=32, blank=True)
    format = models.CharField(max_length=32, blank=True)
    comment = models.CharField(max_length=1024, blank=True)
    weight = models.IntegerField(blank=False)

    class Meta:
        unique_together = (
            ('category', 'code'),
            ('category', 'dataset', 'description', 'level')
        )

    def natural_key(self):
        return [self.code]

    def __str__(self):
        return "%s: %s - %s - %s" % (self.code, self.dataset,
                                     self.description, self.level)


class UrlManager(models.Manager):
    def get_by_natural_key(self, url):
        return self.get(url=url)


class Url(models.Model):
    objects = UrlManager()

    url = models.URLField(max_length=4096, blank=True)

    def natural_key(self):
        return [self.url]

    def __str__(self):
        return self.url


class Dataset(models.Model):
    owner = models.ForeignKey('auth.User', related_name='datasets',
                              on_delete=models.CASCADE)
    country = models.ForeignKey(Country, blank=False, null=False)
    keydataset = models.ForeignKey(KeyDataset, blank=False, null=False,
                                   related_name='user_dataset',
                                   on_delete=models.CASCADE)
    is_reviewed = models.BooleanField(default=False)
    review_date = models.DateTimeField(blank=True, null=True)
    create_time = models.DateTimeField(auto_now_add=True)
    modify_time = models.DateTimeField(auto_now=True)
    changed_by = models.ForeignKey('auth.User', blank=True, null=True)
    notes = models.TextField(blank=True, null=False)
    url = models.ManyToManyField(Url, blank=True)
    is_existing = models.BooleanField()
    is_existing_txt = models.TextField(blank=True, null=False)
    is_digital_form = models.BooleanField()
    is_avail_online = models.BooleanField()
    is_avail_online_meta = models.BooleanField()
    is_bulk_avail = models.BooleanField()
    is_machine_read = models.BooleanField()
    is_machine_read_txt = models.TextField(blank=True, null=False)
    is_pub_available = models.BooleanField()
    is_avail_for_free = models.BooleanField()
    is_open_licence = models.BooleanField()
    is_open_licence_txt = models.TextField(blank=True, null=False)
    is_prov_timely = models.BooleanField()
    is_prov_timely_last = models.TextField(blank=True, null=False)
    tag = models.ManyToManyField(KeyTag, blank=True)
