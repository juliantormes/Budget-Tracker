from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('add/', views.add_expense, name='add_expense'),
    path('expense_list', views.expense_list, name='expense_list'),
    path('add-expense-category/', views.add_expenses_category, name='add_expenses_category'),
    path('add-income-category/', views.add_income_category, name='add_income_category'),
    path('incomes/', views.income_list, name='income_list'),
    path('add-income/', views.add_income, name='add_income'),
]
