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
router.register(r'credit-card-expenses', views.CreditCardExpenseViewSet, basename='credit-card-expense')


urlpatterns = [
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('login/', views.login, name='login'),  # Pointing to a custom login view
    path('signup/', views.signup, name='signup'),  # Pointing to a custom signup view
    path('logout/', views.logout, name='logout'),  # Pointing to a custom logout view
    path('', include(router.urls)),
]   
