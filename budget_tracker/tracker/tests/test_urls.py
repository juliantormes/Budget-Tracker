import django
setup = django.setup()
from django.urls import resolve, reverse
from django.test import SimpleTestCase
from tracker import views

class TestUrls(SimpleTestCase):

    def test_income_url_resolves(self):
        url = reverse('income-list')  # this name comes from DRF DefaultRouter
        self.assertEqual(resolve(url).func.__name__, views.IncomeViewSet.__name__)

    def test_expense_url_resolves(self):
        url = reverse('expense-list')  # Generated name for the list endpoint
        self.assertEqual(resolve(url).func.__name__, views.ExpenseViewSet.__name__)

    def test_expense_categories_url_resolves(self):
        url = reverse('expensecategory-list')  # DRF-generated name
        self.assertEqual(resolve(url).func.__name__, views.ExpenseCategoryViewSet.__name__)

    def test_income_categories_url_resolves(self):
        url = reverse('incomecategory-list')
        self.assertEqual(resolve(url).func.__name__, views.IncomeCategoryViewSet.__name__)

    def test_credit_cards_url_resolves(self):
        url = reverse('creditcard-list')
        self.assertEqual(resolve(url).func.__name__, views.CreditCardViewSet.__name__)

    def test_credit_card_expenses_url_resolves(self):
        url = reverse('credit-card-expense-list')
        self.assertEqual(resolve(url).func.__name__, views.CreditCardExpenseViewSet.__name__)

    def test_custom_login_url_resolves(self):
        url = reverse('login')
        self.assertEqual(resolve(url).func, views.login)

    def test_custom_signup_url_resolves(self):
        url = reverse('signup')
        self.assertEqual(resolve(url).func, views.signup)

    def test_custom_logout_url_resolves(self):
        url = reverse('logout')
        self.assertEqual(resolve(url).func, views.logout)

    def test_update_recurring_expense_url_resolves(self):
        url = reverse('update_recurring_expense', args=[1])
        self.assertEqual(resolve(url).func, views.update_recurring_expense)

    def test_update_recurring_income_url_resolves(self):
        url = reverse('update_recurring_income', args=[1])
        self.assertEqual(resolve(url).func, views.update_recurring_income)
