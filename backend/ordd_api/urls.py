# ordd_api/urls.py

from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns

from rest_framework.authtoken.views import obtain_auth_token
from .views import RegionCreateView, CountryCreateView, ProfileCreateView, UserCreateView

urlpatterns = {
    url(r'^profile$', ProfileCreateView, name="profile_create"),
    url(r'^user/$', UserCreateView, name="user_create"),
    url(r'^region/$', RegionCreateView.as_view(), name="region_create"),
    url(r'^country/$', CountryCreateView.as_view(), name="country_create"),
    
    url(r'^get-token/', obtain_auth_token),
}

urlpatterns = format_suffix_patterns(urlpatterns)
