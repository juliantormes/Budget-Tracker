from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'incomes', views.IncomeViewSet)
router.register(r'expenses', views.ExpenseViewSet)
router.register(r'expense_categories', views.ExpenseCategoryViewSet)
router.register(r'income_categories', views.IncomeCategoryViewSet)
router.register(r'credit_cards', views.CreditCardViewSet)
router.register(r'expense_change_logs', views.ExpenseChangeLogViewSet)
router.register(r'income_change_logs', views.IncomeChangeLogViewSet)

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
    path('expense_category/delete/<int:category_id>/', views.delete_expense_category, name='delete_expense_category'),  # Delete an expense category
    path('income_category/delete/<int:category_id>/', views.delete_income_category, name='delete_income_category'),  # Delete an income category
    path('expense_category/', views.expense_category_list, name='expense_category_list'),  # List all expense categories
    path('income_category/', views.income_category_list, name='income_category_list'),  # List all income categories
    path('credit_card/', views.credit_card_list, name='credit_card_list'),  # List all credit cards
    path('add_credit_card/', views.add_credit_card, name='add_credit_card'),  # Add a credit card
    path('credit_card/edit/<int:card_id>/', views.edit_credit_card, name='edit_credit_card'),  # Edit a credit card
    path('credit_card/delete/<int:card_id>/', views.delete_credit_card, name='delete_credit_card'),  # Delete a credit card
    path('record_recurring_expense_change/<int:expense_id>/', views.record_recurring_expense_change, name='record_recurring_expense_change'), # Record a recurring change
    path('record_recurring_income_change/<int:income_id>/', views.record_recurring_income_change, name='record_recurring_income_change'), # Record a recurring change
    path('', include(router.urls)),
]   
