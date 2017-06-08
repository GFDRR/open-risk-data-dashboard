# api_exp01/urls.py

from django.conf.urls import url, include
from rest_framework.urlpatterns import format_suffix_patterns

from rest_framework.authtoken.views import obtain_auth_token # add this import



from .views import CreateView, DetailsView

urlpatterns = {
    url(r'^auth/', include('rest_framework.urls', # ADD THIS URL
                               namespace='api_exp01__rest_framework')), 
    url(r'^bucketlists/$', CreateView.as_view(), name="create"),
    url(r'^bucketlists/(?P<pk>[0-9]+)/$',
        DetailsView.as_view(), name="details"),
    url(r'^get-token/', obtain_auth_token),
}

urlpatterns = format_suffix_patterns(urlpatterns)
