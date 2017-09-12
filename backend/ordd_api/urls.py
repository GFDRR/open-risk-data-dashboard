# ordd_api/urls.py

from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns

from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    RegionListView, CountryListView, KeyPerilListView,
    ProfileDetails, ProfilePasswordUpdate, ProfilePasswordReset,
    ProfileCommentSendView, UserCreateView, UserDetailsView,
    RegistrationView, ProfileDatasetListCreateView, ProfileDatasetDetailsView,
    DatasetListView, DatasetDetailsView, VersionGet,
    ScoringWorldGet, ScoringCountryDetailsGet, ScoringWorldCategoriesGet)

from .keydatasets_views import (
    KeyDataset0on4ListView, KeyDataset1on4ListView, KeyDataset2on4ListView,
    KeyDataset3on4ListView, KeyDataset4on4ListView, KeyDatasetTagGroup,
    KeyDatasetTag
    )

# To add a namespace you need to change reverse calls around the source code.
# app_name="ordd_api"

urlpatterns = [
    url(r'^scoring_category/$', ScoringWorldCategoriesGet.as_view(),
        name='scoring_category'),
    url(r'^scoring/(?P<country_id>[A-Z0-9][A-Z0-9])$',
        ScoringCountryDetailsGet.as_view(), name="scoring_country"),
    url(r'^scoring/$', ScoringWorldGet.as_view(), name="scoring_world"),
    url(r'^version$', VersionGet.as_view(), name="version"),
    url(r'^profile$', ProfileDetails.as_view(), name="profile_details"),
    url(r'^profile/password$', ProfilePasswordUpdate.as_view(),
        name="profile_password_update"),
    url(r'^profile/password/reset$', ProfilePasswordReset.as_view(),
        name="profile_password_reset"),
    url(r'^profile/dataset/$', ProfileDatasetListCreateView.as_view(),
        name="profile_dataset_listcreate"),
    url(r'^profile/dataset/(?P<pk>[0-9]+)$',
        ProfileDatasetDetailsView.as_view(), name="profile_dataset_details"),
    url(r'^profile/comment/send$',
        ProfileCommentSendView.as_view(), name="profile_comment_send"),
    url(r'^dataset/$', DatasetListView.as_view(), name="dataset_list"),
    url(r'^dataset/(?P<pk>[0-9]+)$',
        DatasetDetailsView.as_view(), name="dataset_details"),


    url(r'^user/$', UserCreateView.as_view(), name="user_create"),
    url(r'^user/(?P<pk>[0-9]+)$',
        UserDetailsView.as_view(), name="user_details"),

    url(r'^registration$', RegistrationView.as_view(), name="registration"),

    url(r'^peril/$', KeyPerilListView.as_view(), name="peril"),

    url(r'^region/$', RegionListView.as_view(), name="region_list"),

    url(r'^country/$', CountryListView.as_view(), name="country_list"),

    url(r'^keydataset/tag/$',  KeyDatasetTagGroup.as_view(),
        name="key_dataset_tag_group"),
    url(r'^keydataset/tag/(?P<group>.+)$',
        KeyDatasetTag.as_view(), name="key_dataset_tag"),
    url(r'^keydataset/(?P<level>.+)/(?P<category>.+)/(?P<dataset>.+)'
        '/(?P<code>.+)$',
        KeyDataset4on4ListView.as_view(), name="key_dataset4on4"),
    url(r'^keydataset/(?P<level>.+)/(?P<category>.+)/(?P<dataset>.+)/$',
        KeyDataset3on4ListView.as_view(), name="key_dataset3on4"),
    url(r'^keydataset/(?P<level>.+)/(?P<category>.+)/$',
        KeyDataset2on4ListView.as_view(), name="key_dataset2on4"),
    url(r'^keydataset/(?P<level>.+)/$',
        KeyDataset1on4ListView.as_view(), name="key_dataset1on4"),
    url(r'^keydataset/$', KeyDataset0on4ListView.as_view(),
        name="key_dataset0on4"),

    url(r'^get-token/', obtain_auth_token),
]

urlpatterns = format_suffix_patterns(urlpatterns)
