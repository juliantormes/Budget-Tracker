from django.conf import settings
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'incomes', views.IncomeViewSet)
router.register(r'expenses', views.ExpenseViewSet)
router.register(r'expense_categories', views.ExpenseCategoryViewSet)
router.register(r'income_categories', views.IncomeCategoryViewSet)
router.register(r'credit_cards', views.CreditCardViewSet)
router.register(r'credit-card-expenses', views.CreditCardExpenseViewSet, basename='credit-card-expense')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('login/', views.login, name='login'),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.logout, name='logout'),
    # Custom routes for updating recurring incomes and expenses
    path('api/expenses/<int:expense_id>/update_recurring/', views.update_recurring_expense, name='update_recurring_expense'),
    path('api/incomes/<int:income_id>/update_recurring/', views.update_recurring_income, name='update_recurring_income'),
]

# Add a separate API root path for production
if not settings.DEBUG:
    urlpatterns += [
        path('api-root/', include(router.urls)),  # Access API root at /api-root in production
    ]
else:
    urlpatterns += [
        path('', include(router.urls)),  # Access API root at blank path in development
    ]
