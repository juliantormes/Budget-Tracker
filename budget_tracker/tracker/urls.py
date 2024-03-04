from django.urls import path
from . import views

urlpatterns = [
    path('add-category/', views.add_category, name='add_category'),
    path('add/', views.add_expense, name='add_expense'),
    path('', views.expense_list, name='expense_list'),
    ]
