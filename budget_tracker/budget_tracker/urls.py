from django.urls import path, include  # Import include
from django.contrib import admin  # Import admin

urlpatterns = [
    path('admin/', admin.site.urls),  # Admin URL
    path('', include('tracker.urls')),  # Include URLs from the tracker app
]
