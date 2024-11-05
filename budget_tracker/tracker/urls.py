from django.conf import settings
from django.urls import path, include
from rest_framework.routers import DefaultRouter, SimpleRouter
from . import views

# Conditionally set the router based on the DEBUG setting
if settings.DEBUG:
    router = DefaultRouter()
else:
    router = SimpleRouter()

# Register your viewsets with the chosen router
router.register(r'incomes', views.IncomeViewSet)
router.register(r'expenses', views.ExpenseViewSet)
router.register(r'expense_categories', views.ExpenseCategoryViewSet)
router.register(r'income_categories', views.IncomeCategoryViewSet)
router.register(r'credit_cards', views.CreditCardViewSet)
router.register(r'credit-card-expenses', views.CreditCardExpenseViewSet, basename='credit-card-expense')

# Define urlpatterns with the selected router
urlpatterns = [
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/login/', views.login, name='login'),  # Update to use /api/login
    path('api/signup/', views.signup, name='signup'),
    path('api/logout/', views.logout, name='logout'),

    # Custom routes for updating recurring incomes and expenses
    path('api/expenses/<int:expense_id>/update_recurring/', views.update_recurring_expense, name='update_recurring_expense'),
    path('api/incomes/<int:income_id>/update_recurring/', views.update_recurring_income, name='update_recurring_income'),
]
