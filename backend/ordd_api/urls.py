# ordd_api/urls.py

from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns

from rest_framework.authtoken.views import obtain_auth_token
from .views import (RegionListView,
                    CountryListView, CountryDetailsView,
                    CategoryListView, SubCategoryListView,
                    ProfileDetails, ProfilePasswordUpdate,
                    UserCreateView, UserDetailsView, RegistrationView)

urlpatterns = {
    url(r'^profile$', ProfileDetails.as_view(), name="profile_details"),
    url(r'^profile/password$', ProfilePasswordUpdate.as_view(),
        name="profile_password_update"),

    url(r'^user/$', UserCreateView.as_view(), name="user_create"),
    url(r'^user/(?P<pk>[0-9]+)$',
        UserDetailsView.as_view(), name="user_details"),

    url(r'^registration$', RegistrationView.as_view(), name="registration"),

    url(r'^region/$', RegionListView.as_view(), name="region_list"),

    url(r'^country/$', CountryListView.as_view(), name="country_list"),
    url(r'^country/(?P<pk>[A-Z]+)$', CountryDetailsView.as_view(), name="country_details"),

    url(r'^category/$', CategoryListView.as_view(), name="category_list"),

    url(r'^subcategory/$', SubCategoryListView.as_view(), name="subcategory_list"),

    url(r'^get-token/', obtain_auth_token),
}

urlpatterns = format_suffix_patterns(urlpatterns)
