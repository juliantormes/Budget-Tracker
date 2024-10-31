from django.urls import path, include, re_path  # Import include
from django.contrib import admin  # Import admin
from django.views.generic import TemplateView  # Import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),  # Admin URL
    path('', include('tracker.urls')),  # Include URLs from the tracker app
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),  # Render React app for all other routes
]
