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


class Region(models.Model):
    """World regions"""
    name = models.CharField(max_length=64, blank=False)

    def natural_key(self):
        return self.name

    def __str__(self):
        return self.name


class Country(models.Model):
    """List of world countries with a region reference."""

    iso2 = models.CharField(max_length=2, blank=False, unique=True)
    name = models.CharField(max_length=64, blank=False, unique=True)
    region = models.ForeignKey(Region)

    def natural_key(self):
        return self.iso2

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=64, blank=False, unique=True)
    weight = models.IntegerField(blank=False)

    def natural_key(self):
        return self.name

    def __str__(self):
        return self.name


class LevDataset(models.Model):
    name = models.CharField(max_length=128, blank=False, unique=True)

    def natural_key(self):
        return self.name

    def __str__(self):
        return self.name


class LevDescription(models.Model):
    name = models.CharField(max_length=128, blank=False, unique=True)

    def natural_key(self):
        return self.name

    def __str__(self):
        return self.name


class LevScale(models.Model):
    name = models.CharField(max_length=32, blank=False, unique=True)

    def natural_key(self):
        return self.name

    def __str__(self):
        return self.name


class Peril(models.Model):
    name = models.CharField(max_length=32, blank=False, unique=True)

    def natural_key(self):
        return self.name

    def __str__(self):
        return self.name


class KeyDataset(models.Model):
    code = models.IntegerField(null=False, blank=False)
    category = models.ForeignKey(Category)
    dataset = models.ForeignKey(LevDataset)
    description = models.ForeignKey(LevDescription)
    scale = models.ForeignKey(LevScale)
    applicability = models.ManyToManyField(Peril)

    format = models.CharField(max_length=32)
    comment = models.CharField(max_length=1024)
    weight = models.IntegerField(blank=False)

    class Meta:
        unique_together = (
            ('category', 'code'),
            ('category', 'dataset', 'description', 'scale')
        )

    def natural_key(self):
        return (self.category, self.code)

    def __str__(self):
        return "%s: %d - %s - %s - %s" % (self.category, self.code,
                                          self.dataset, self.description,
                                          self.scale)


class Element(models.Model):
    name = models.CharField(max_length=64, blank=True)

    def __str__(self):
        return self.name


class Url(models.Model):
    url = models.URLField(max_length=4096, blank=True)

    def __str__(self):
        return self.url


class Dataset(models.Model):
    owner = models.ForeignKey('auth.User', related_name='datasets',
                              on_delete=models.CASCADE)

    country = models.ForeignKey(Country, blank=False, null=False)
    keydataset = models.ForeignKey(KeyDataset, blank=False, null=False,
                                   related_name='user_dataset')

    is_reviewed = models.BooleanField(default=False)
    review_date = models.DateTimeField(blank=True, null=True)
    create_time = models.DateTimeField(auto_now_add=True)
    modify_time = models.DateTimeField(auto_now=True)
    changed_by = models.ForeignKey('auth.User', blank=True, null=True)
    notes = models.TextField(blank=True, null=False)
    url = models.ManyToManyField(Url, blank=True)
    is_existing = models.BooleanField()
    is_existing_txt = models.CharField(max_length=256, blank=True, null=False)
    is_digital_form = models.BooleanField()
    is_avail_online = models.BooleanField()
    is_avail_online_meta = models.BooleanField()
    is_bulk_avail = models.BooleanField()
    is_machine_read = models.BooleanField()
    is_machine_read_txt = models.CharField(max_length=256,
                                           blank=True, null=False)
    is_pub_available = models.BooleanField()
    is_avail_for_free = models.BooleanField()
    is_open_licence = models.BooleanField()
    is_open_licence_txt = models.CharField(max_length=256,
                                           blank=True, null=False)
    is_prov_timely = models.BooleanField()
    is_prov_timely_last = models.CharField(max_length=128,
                                           blank=True, null=False)
    elements = models.ManyToManyField(Element, blank=True)
