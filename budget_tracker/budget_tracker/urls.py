from django.urls import include, path

urlpatterns = [
    path('tracker/', include('tracker.urls')),
]
