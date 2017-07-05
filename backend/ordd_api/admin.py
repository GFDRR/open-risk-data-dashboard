from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import (
    Profile, OptIn,
    Category, HazardCategory, Dataset, Tag, Description, Scale, Peril,
    KeyDataset, Dataset, Url, Element)


# Define an inline admin descriptor for Employee model
# which acts a bit like a singleton
class ProfilesInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'profiles'


# Define a new User admin
class UserAdmin(BaseUserAdmin):
    inlines = (ProfilesInline, )

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(OptIn)

admin.site.register(Category)
admin.site.register(HazardCategory)
admin.site.register(Dataset)
admin.site.register(Tag)
admin.site.register(Description)
admin.site.register(Peril)
admin.site.register(Scale)
admin.site.register(KeyDataset)

admin.site.register(Url)
admin.site.register(Element)
admin.site.register(Dataset)
