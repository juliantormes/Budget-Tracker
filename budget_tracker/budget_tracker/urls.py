from django.contrib import admin
from django.urls import include, path
from tracker import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tracker/', include('tracker.urls')),
    path('', views.expense_list, name='home'),
    path('hello/<str:username>', views.expense_list, name='hello'),
]
