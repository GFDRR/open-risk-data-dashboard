# ordd_api/urls.py

from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns

from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    RegionListView, CountryListView, CountryDetailsView,
    ProfileDetails, ProfilePasswordUpdate,
    UserCreateView, UserDetailsView,
    RegistrationView, ProfileDatasetListCreateView, ProfileDatasetDetailsView,
    DatasetListView, DatasetDetailsView, ElementListView)

from .keydatasets_views import (
    KeyDataset0on4ListView, KeyDataset1on4ListView, KeyDataset2on4ListView,
    KeyDataset3on4ListView, KeyDataset4on4ListView
    )

# To add a namespace you need to change reverse calls around the source code.
# app_name="ordd_api"

urlpatterns = [
    url(r'^profile$', ProfileDetails.as_view(), name="profile_details"),
    url(r'^profile/password$', ProfilePasswordUpdate.as_view(),
        name="profile_password_update"),
    url(r'^profile/dataset/$', ProfileDatasetListCreateView.as_view(),
        name="profile_dataset_listcreate"),
    url(r'^profile/dataset/(?P<pk>[0-9]+)$',
        ProfileDatasetDetailsView.as_view(), name="profile_dataset_details"),
    url(r'^dataset/$', DatasetListView.as_view(), name="dataset_list"),
    url(r'^dataset/(?P<pk>[0-9]+)$',
        DatasetDetailsView.as_view(), name="dataset_details"),


    url(r'^user/$', UserCreateView.as_view(), name="user_create"),
    url(r'^user/(?P<pk>[0-9]+)$',
        UserDetailsView.as_view(), name="user_details"),

    url(r'^registration$', RegistrationView.as_view(), name="registration"),

    url(r'^region/$', RegionListView.as_view(), name="region_list"),

    url(r'^country/$', CountryListView.as_view(), name="country_list"),
    url(r'^country/(?P<pk>[A-Z]+)$', CountryDetailsView.as_view(),
        name="country_details"),

    url(r'^keydataset/(?P<scale>.+)/(?P<category>.+)/(?P<dataset>.+)/(?P<description>.+)$',
        KeyDataset4on4ListView.as_view(), name="key_dataset4on4"),
    url(r'^keydataset/(?P<scale>.+)/(?P<category>.+)/(?P<dataset>.+)/$',
        KeyDataset3on4ListView.as_view(), name="key_dataset3on4"),
    url(r'^keydataset/(?P<scale>.+)/(?P<category>.+)/$',
        KeyDataset2on4ListView.as_view(), name="key_dataset2on4"),
    url(r'^keydataset/(?P<scale>.+)/$',
        KeyDataset1on4ListView.as_view(), name="key_dataset1on4"),
    url(r'^keydataset/$', KeyDataset0on4ListView.as_view(),
        name="key_dataset0on4"),

    url(r'^elements/$', ElementListView.as_view(), name="elements"),

    url(r'^get-token/', obtain_auth_token),
]

urlpatterns = format_suffix_patterns(urlpatterns)
