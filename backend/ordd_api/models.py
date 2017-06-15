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
    name = models.CharField(max_length=64, blank=False, primary_key=True)

class Country(models.Model):
    """List of world countries with a region reference."""

    iso2 = models.CharField(max_length=2, blank=False, primary_key=True)
    name = models.CharField(max_length=64, blank=False, unique=True)
    region = models.ForeignKey(Region)
    
    
