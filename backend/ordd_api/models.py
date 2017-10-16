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
    insert_time = models.DateTimeField(auto_now=True)

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
    thinkhazard_appl = models.ManyToManyField("ordd_api.KeyTag")

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
    def get_by_natural_key(self, name, category):
        return self.get(name=name, category=category)


class KeyDatasetName(models.Model):
    objects = KeyDatasetNameManager()

    name = models.CharField(max_length=128, blank=False)
    category = models.CharField(max_length=32, blank=True, null=True)

    class Meta:
        unique_together = (
            ('name', 'category'),
        )

    def natural_key(self):
        return [self.name, self.category]

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
    def get_by_natural_key(self, name, group):
        return self.get(name=name, group__name=group)


class KeyTag(models.Model):
    objects = KeyTagManager()

    group = models.ForeignKey(KeyTagGroup, related_name='tags',
                              on_delete=models.CASCADE)
    name = models.CharField(max_length=32, blank=False, unique=True)
    is_peril = models.BooleanField(default=False)

    class Meta:
        unique_together = (
            ('group', 'name'),
        )

    def natural_key(self):
        return [self.name, self.group.name]

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


class KeyDatasetManager(models.Manager):
    def get_by_natural_key(self, code):
        return self.get(code=code)


class KeyDataset(models.Model):
    objects = KeyDatasetManager()

    code = models.CharField(max_length=6, null=False, blank=False,
                            primary_key=True)
    category = models.ForeignKey(KeyCategory)
    dataset = models.ForeignKey(KeyDatasetName, related_name='keydatasets')
    tag_available = models.ForeignKey(KeyTagGroup, null=True, blank=True)
    description = models.CharField(max_length=1024, blank=False, unique=True)
    applicability = models.ManyToManyField('ordd_api.KeyTag')
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
    notes = models.TextField("Notes about dataset", blank=True, null=False)
    url = models.ManyToManyField(Url, blank=True)
    is_existing = models.BooleanField(
        "Does the data exist?",
        help_text="Does the data exist at all? The data can be in any form "
        "(paper or digital, offline or online etc). If it is not, then "
        "all the other questions are not answered.")
    is_existing_txt = models.TextField("Comments on 'Does the data exist?'",
                                       blank=True, null=False)
    is_digital_form = models.BooleanField(
        "Is data in digital form?", help_text="This question addresses "
        "whether the data is in digital form (stored on computers or "
        "digital storage) or if it only in e.g. paper form.")
    is_avail_online = models.BooleanField(
        "Is available Online?", help_text="This question addresses whether "
        "the data is available online from an official source. In the cases "
        "that this is answered with a 'yes', then the link is put "
        "in a URL field.")
    is_avail_online_meta = models.BooleanField(
        "Is the metadata available online?", help_text="This question "
        "addresses whether the metadata is available online from an official "
        "source. In the cases that this is answered with a 'yes', then the "
        "link is put in a URL field.")
    is_bulk_avail = models.BooleanField(
        "Available in bulk?", help_text="Data is available in bulk if the "
        "whole dataset can be downloaded or accessed easily. Conversely it "
        "is considered non-bulk if the citizens are limited to just getting "
        "parts of the dataset (for example, if restricted to querying a web "
        "form and retrieving a few results at a time from a very large "
        "database).")
    is_machine_read = models.BooleanField(
        "Is the data machine-readable?", help_text="Data is machine-readable "
        "if it is in a format that can be easily structured by a computer. "
        "Data can be digital but not machine-readable. For example, consider "
        "a PDF document containing tables of data. These are definitely "
        "digital but are not machine-readable because a computer would "
        "struggle to access the tabular information (even though they are "
        "very human-readable!). The equivalent tables in a format such as a "
        "spreadsheet would be machine-readable. Note: The appropriate machine-"
        "readable format may vary by type of data – so, for example, machine-"
        "readable formats for geographic data may be different than for "
        "tabular data. In general, HTML and PDF are not machine-readable."
    )
    is_machine_read_txt = models.TextField(
        "Comments on 'is the data machine-readable?'", blank=True, null=False)
    is_pub_available = models.BooleanField(
        "Publicly available?", help_text="This question addresses whether "
        "the data is \"public\". This does not require it to be "
        "freely available, but does require that someone outside of "
        "the government can access it in some form (examples include if "
        "the data is available for purchase, if it exists as a PDF on a "
        "website that you can access, if you can get it in paper form - "
        "then it is public). If a freedom of information request or "
        "similar is needed to access the data, it is not considered public.")
    is_avail_for_free = models.BooleanField(
        "Is the data available for free?", help_text="This question addresses "
        "whether the data is available for free or if there is a charge. "
        "If there is a charge, then that is stated in the comments section.")
    is_open_licence = models.BooleanField(
        "Openly licensed?", help_text="This question addresses whether the "
        "dataset is open as per http://opendefinition.org. It needs to state "
        "the terms of use or license that allow anyone to freely use, reuse "
        "or redistribute the data (subject at most to attribution or share "
        "alike requirements). It is vital that a licence is available (if "
        "there is no licence, the data is not openly licensed). Open licences "
        "which meet the requirements of the Open Definition are listed at "
        "http://opendefinition.org/licenses/.")
    is_open_licence_txt = models.TextField("Comments on: 'Openly licensed?'",
                                           blank=True, null=False)
    is_prov_timely = models.BooleanField(
        "Is the data provided on a timely and up to date basis?",
        help_text="This question addresses whether the data is up to date and "
        "timely - or long delayed. For example, for census data that it is "
        "made available soon after the census is performed or if it is only "
        "available many years later. Any comments around uncertainty are put "
        "in the comments field.")
    is_prov_timely_last = models.TextField(blank=True, null=False)
    tag = models.ManyToManyField(KeyTag, blank=True)


#  Don't remove 'KeyPeril' model (now 'KeyPerilObsolete') allow
#  backward migrations.
class KeyPerilObsoleteManager(models.Manager):
    def get_by_natural_key(self, name):
        return self.get(name=name)


class KeyPerilObsolete(models.Model):
    objects = KeyPerilObsoleteManager()

    name = models.CharField(max_length=32, blank=False, unique=True)

    def natural_key(self):
        return [self.name]

    def __str__(self):
        return self.name
