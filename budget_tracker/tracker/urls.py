from django.urls import path
from . import views
from .views import DeleteExpenseCategory, DeleteIncomeCategory

urlpatterns = [
    path('', views.home, name='home'),
    path('add/', views.add_expense, name='add_expense'),
    path('expense_list/', views.expense_list, name='expense_list'),
    path('add_expense_category/', views.add_expense_category, name='add_expense_category'),
    path('add_income_category/', views.add_income_category, name='add_income_category'),
    path('income_list/', views.income_list, name='income_list'),
    path('add_income/', views.add_income, name='add_income'),
    path('expense/edit/<int:expense_id>/', views.edit_expense, name='edit_expense'),
    path('expense/delete/<int:expense_id>/', views.delete_expense, name='delete_expense'),
    path('income/edit/<int:income_id>/', views.edit_income, name='edit_income'),
    path('income/delete/<int:income_id>/', views.delete_income, name='delete_income'),
    path('expense_category/edit/<int:category_id>/', views.edit_expense_category, name='edit_expense_category'),
    path('income_category/edit/<int:category_id>/', views.edit_income_category, name='edit_income_category'),
    path('expense_category/delete/<int:pk>/', DeleteExpenseCategory.as_view(), name='delete_expense_category'),
    path('income_category/delete/<int:pk>/', DeleteIncomeCategory.as_view(), name='delete_income_category'),
    path('expense_category/', views.expense_category_list, name='expense_category_list'),
    path('income_category/', views.income_category_list, name='income_category_list'),
]