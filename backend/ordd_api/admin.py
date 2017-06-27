from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import (
    Profile, OptIn,
    Category, LevDataset, LevDescription, LevScale, Peril, KeyDataset,
    Dataset, Url)


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
admin.site.register(Peril)
admin.site.register(LevDataset)
admin.site.register(LevDescription)
admin.site.register(LevScale)
admin.site.register(KeyDataset)
admin.site.register(Url)

admin.site.register(Dataset)
