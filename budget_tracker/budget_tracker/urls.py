from django.urls import path, include  # Import include

urlpatterns = [
    path('', include('tracker.urls')),  # Include URLs from the tracker app
]
