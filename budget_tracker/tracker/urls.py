from django.urls import path
from . import views
from .views import DeleteExpenseCategory, DeleteIncomeCategory

urlpatterns = [
    path('', views.login, name='login'),  # Pointing to a custom login view
    path('signup/', views.signup, name='signup'),  # Pointing to a custom signup view
    path('logout/', views.logout, name='logout'),  # Pointing to a custom logout view
    path('home/', views.home, name='home'),  # Function-based view for the home page
    path('add_expense/', views.add_expense, name='add_expense'),  # Add an expense
    path('add_income/', views.add_income, name='add_income'),  # Add income
    path('add_expense_category/', views.add_expense_category, name='add_expense_category'),  # Add an expense category
    path('add_income_category/', views.add_income_category, name='add_income_category'),  # Add an income category
    path('expense_list/', views.expense_list, name='expense_list'),  # List all expenses
    path('income_list/', views.income_list, name='income_list'),  # List all incomes
    path('expense/edit/<int:expense_id>/', views.edit_expense, name='edit_expense'),  # Edit an expense
    path('expense/delete/<int:expense_id>/', views.delete_expense, name='delete_expense'),  # Delete an expense
    path('income/edit/<int:income_id>/', views.edit_income, name='edit_income'),  # Edit an income
    path('income/delete/<int:income_id>/', views.delete_income, name='delete_income'),  # Delete an income
    path('expense_category/edit/<int:category_id>/', views.edit_expense_category, name='edit_expense_category'),  # Edit an expense category
    path('income_category/edit/<int:category_id>/', views.edit_income_category, name='edit_income_category'),  # Edit an income category
    path('expense_category/delete/<int:pk>/', DeleteExpenseCategory.as_view(), name='delete_expense_category'),  # Delete an expense category
    path('income_category/delete/<int:pk>/', DeleteIncomeCategory.as_view(), name='delete_income_category'),  # Delete an income category
    path('expense_category/', views.expense_category_list, name='expense_category_list'),  # List all expense categories
    path('income_category/', views.income_category_list, name='income_category_list'),  # List all income categories
]
