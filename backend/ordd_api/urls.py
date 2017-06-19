# ordd_api/urls.py

from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns

from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    RegionListView, CountryListView, CountryDetailsView,
    ProfileDetails, ProfilePasswordUpdate,
    UserCreateView, UserDetailsView,
    RegistrationView, ProfileDatasetListCreateView, ProfileDatasetDetailsView)

from .keydatasets_views import (
    KeyDataset0on5ListView, KeyDataset1on5ListView, KeyDataset2on5ListView,
    KeyDataset3on5ListView, KeyDataset4on5ListView, KeyDataset5on5ListView,
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


    url(r'^user/$', UserCreateView.as_view(), name="user_create"),
    url(r'^user/(?P<pk>[0-9]+)$',
        UserDetailsView.as_view(), name="user_details"),

    url(r'^registration$', RegistrationView.as_view(), name="registration"),

    url(r'^region/$', RegionListView.as_view(), name="region_list"),

    url(r'^country/$', CountryListView.as_view(), name="country_list"),
    url(r'^country/(?P<pk>[A-Z]+)$', CountryDetailsView.as_view(), name="country_details"),

    url(r'^keydataset/(?P<category>.+)/(?P<dataset>.+)/(?P<description>.+)/(?P<resolution>.*)/(?P<scale>.+)$',
        KeyDataset5on5ListView.as_view(), name="key_dataset5on5"),
    url(r'^keydataset/(?P<category>.+)/(?P<dataset>.+)/(?P<description>.+)/(?P<resolution>.*)/$',
        KeyDataset4on5ListView.as_view(), name="key_dataset4on5"),
    url(r'^keydataset/(?P<category>.+)/(?P<dataset>.+)/(?P<description>.+)/$',
        KeyDataset3on5ListView.as_view(), name="key_dataset3on5"),
    url(r'^keydataset/(?P<category>.+)/(?P<dataset>.+)/$',
        KeyDataset2on5ListView.as_view(), name="key_dataset2on5"),
    url(r'^keydataset/(?P<category>.+)/$',
        KeyDataset1on5ListView.as_view(), name="key_dataset1on5"),
    url(r'^keydataset/$', KeyDataset0on5ListView.as_view(), name="key_dataset0on5"),


    url(r'^get-token/', obtain_auth_token),
]

urlpatterns = format_suffix_patterns(urlpatterns)
