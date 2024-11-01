from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from django.conf import settings
from . import views

# API Router setup
router = DefaultRouter()
router.register(r'incomes', views.IncomeViewSet)
router.register(r'expenses', views.ExpenseViewSet)
router.register(r'expense_categories', views.ExpenseCategoryViewSet)
router.register(r'income_categories', views.IncomeCategoryViewSet)
router.register(r'credit_cards', views.CreditCardViewSet)
router.register(r'credit-card-expenses', views.CreditCardExpenseViewSet, basename='credit-card-expense')

# URL patterns
urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),  # All API routes go under /api/
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/login/', views.login, name='login'),  # API login
    path('api/signup/', views.signup, name='signup'),  # API signup
    path('api/logout/', views.logout, name='logout'),  # API logout

    # Custom routes for updating recurring incomes and expenses
    path('api/expenses/<int:expense_id>/update_recurring/', views.update_recurring_expense, name='update_recurring_expense'),
    path('api/incomes/<int:income_id>/update_recurring/', views.update_recurring_income, name='update_recurring_income'),

    # Catch-all pattern for frontend routes
    # This ensures that any route not starting with /api/ will serve the React app's index.html
    re_path(r'^.*$', TemplateView.as_view(template_name="index.html"), name='frontend'),
]


# Main URL patterns
api_urlpatterns = [
    path('api/', include(urlpatterns)),  # All API endpoints under /api/
]

# Serve frontend for the root URL and hide browsable API in production
if settings.DEBUG:
    # In development, include the browsable API authentication routes
    urlpatterns += [
        path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
        path('', TemplateView.as_view(template_name='index.html')),  # Serves frontend for the root URL
    ]
else:
    # In production, only serve the frontend at the root URL
    urlpatterns += [
        path('', TemplateView.as_view(template_name='index.html')),  # Serves frontend for the root URL
    ]
