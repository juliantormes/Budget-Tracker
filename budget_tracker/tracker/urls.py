from django.urls import path
from . import views
from .views import DeleteExpenseCategory

urlpatterns = [
    path('', views.home, name='home'),
    path('add/', views.add_expense, name='add_expense'),
    path('expense_list', views.expense_list, name='expense_list'),
    path('add-expense-category/', views.add_expenses_category, name='add_expenses_category'),
    path('add-income-category/', views.add_income_category, name='add_income_category'),
    path('incomes/', views.income_list, name='income_list'),
    path('add-income/', views.add_income, name='add_income'),
    path('expense/edit/<int:expense_id>/', views.edit_expense, name='edit_expense'),
    path('expense/delete/<int:expense_id>/', views.delete_expense, name='delete_expense'),
    path('income/edit/<int:income_id>/', views.edit_income, name='edit_income'),
    path('income/delete/<int:income_id>/', views.delete_income, name='delete_income'),
    path('expense_category/edit/<int:category_id>/', views.edit_expense_category, name='edit_expense_category'),
    path('income_category/edit/<int:category_id>/', views.edit_income_category, name='edit_income_category'),
    path('expense_category/delete/<int:pk>/', DeleteExpenseCategory.as_view(), name='delete_expense_category'),
    path('income_category/delete/<int:pk>/', DeleteExpenseCategory.as_view(), name='delete_income_category'),
    path('expenses_categories/', views.expenses_categories_list, name='expenses_categories_list'),
    path('incomes_categories/', views.incomes_categories_list, name='incomes_categories_list'),
]
