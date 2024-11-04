from django.conf import settings
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.response import Response
from . import views

router = DefaultRouter()
router.register(r'incomes', views.IncomeViewSet)
router.register(r'expenses', views.ExpenseViewSet)
router.register(r'expense_categories', views.ExpenseCategoryViewSet)
router.register(r'income_categories', views.IncomeCategoryViewSet)
router.register(r'credit_cards', views.CreditCardViewSet)
router.register(r'credit-card-expenses', views.CreditCardExpenseViewSet, basename='credit-card-expense')

class HiddenApiRoot(APIView):
    def get(self, request, *args, **kwargs):
        # Only show the API root in development
        if settings.DEBUG:
            return Response(router.get_urls())
        # Hide API root in production
        return Response(status=404)

urlpatterns = [
    path('api/', include(router.urls)),  # Main API routes
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('login/', views.login, name='login'),  # Custom login view
    path('signup/', views.signup, name='signup'),  # Custom signup view
    path('logout/', views.logout, name='logout'),  # Custom logout view
    path('', include(router.urls)),
    path('api-root/', HiddenApiRoot.as_view(), name='api-root'),  # Custom API root view
    # Custom routes for updating recurring incomes and expenses
    path('api/expenses/<int:expense_id>/update_recurring/', views.update_recurring_expense, name='update_recurring_expense'),
    path('api/incomes/<int:income_id>/update_recurring/', views.update_recurring_income, name='update_recurring_income'),
]
