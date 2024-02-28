from django.urls import include, path
from tracker.views import expense_list  # Import the view

urlpatterns = [
    path('tracker/', include('tracker.urls')),
    path('', expense_list, name='home'),  # Use expense_list for the root URL
]
