import django
django.setup()
from django.test import TestCase
from django.utils import timezone
from decimal import Decimal
from tracker.forms import IncomeCategoryForm, ExpenseCategoryForm, ExpenseForm, IncomeForm
from tracker.models import IncomeCategory, ExpenseCategory, CreditCard
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model

User = get_user_model()

class IncomeCategoryFormTest(TestCase):
    
    def setUp(self):
        """Ensure no pre-existing IncomeCategory objects"""
        IncomeCategory.objects.all().delete()

    def test_income_category_form_valid(self):
        """Test IncomeCategoryForm with valid data."""
        form_data = {'name': 'Salary'}
        form = IncomeCategoryForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_income_category_form_invalid(self):
        """Test IncomeCategoryForm with missing 'name' field."""
        form_data = {'name': ''}
        form = IncomeCategoryForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors)
    def test_income_category_form_save(self):
        """Test IncomeCategoryForm saves a valid object."""
        form_data = {'name': 'Freelancing'}
        form = IncomeCategoryForm(data=form_data)
        if form.is_valid():
            income_category = form.save()
            self.assertEqual(income_category.name, 'Freelancing')
            self.assertEqual(IncomeCategory.objects.count(), 1)

    def test_income_category_form_max_length(self):
        """Test IncomeCategoryForm with name exceeding max length."""
        form_data = {'name': 'A' * 256}  # Assuming max_length is 255 in the model
        form = IncomeCategoryForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors)
class ExpenseCategoryFormTest(TestCase):
    
    def setUp(self):
        """Ensure no pre-existing ExpenseCategory objects"""
        ExpenseCategory.objects.all().delete()

    def test_expense_category_form_valid(self):
        """Test ExpenseCategoryForm with valid data."""
        form_data = {'name': 'Rent'}
        form = ExpenseCategoryForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_expense_category_form_invalid(self):
        """Test ExpenseCategoryForm with missing 'name' field."""
        form_data = {'name': ''}
        form = ExpenseCategoryForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors)
    
    def test_expense_category_form_save(self):
        """Test ExpenseCategoryForm saves a valid object."""
        form_data = {'name': 'Utilities'}
        form = ExpenseCategoryForm(data=form_data)
        if form.is_valid():
            expense_category = form.save()
            self.assertEqual(expense_category.name, 'Utilities')
            self.assertEqual(ExpenseCategory.objects.count(), 1)
    def test_expense_category_form_max_length(self):
        """Test ExpenseCategoryForm with name exceeding max length."""
        form_data = {'name': 'B' * 256}  # Assuming max_length is 255 in the model
        form = ExpenseCategoryForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors)
class ExpenseFormTest(TestCase):

    def setUp(self):
        """Set up a test user, category, and credit card for the form."""
        self.user = User.objects.create_user(username='testuser', password='password')
        self.category = ExpenseCategory.objects.create(name='Test Category', user=self.user)
        self.credit_card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='Visa',
            expire_date=datetime(2025, 12, 31),
            credit_limit=5000.00,
            payment_day=15,
            close_card_day=25
        )

    def test_valid_expense_without_credit_card(self):
        """Test submitting a valid expense without using a credit card."""
        form_data = {
            'category': self.category.id,
            'description': 'Test Expense',
            'amount': '100.00',
            'date': timezone.now().date(),
            'is_recurring': False,
            'using_credit_card': False
        }
        form = ExpenseForm(data=form_data, user=self.user)
        self.assertTrue(form.is_valid(), form.errors)

    def test_valid_expense_with_credit_card(self):
        """Test submitting a valid expense paid with a credit card."""
        form_data = {
            'category': self.category.id,
            'description': 'Test Expense with Card',
            'amount': '150.00',
            'date': timezone.now().date(),
            'credit_card': self.credit_card.id,
            'installments': 3,
            'surcharge': '5.00',
            'is_recurring': False,
            'using_credit_card': True
        }
        form = ExpenseForm(data=form_data, user=self.user)
        self.assertTrue(form.is_valid(), form.errors)

    def test_missing_credit_card_fields(self):
        """Test validation error when credit card fields are missing but paying with a credit card."""
        form_data = {
            'category': self.category.id,
            'description': 'Test Expense with Card',
            'amount': '150.00',
            'date': timezone.now().date(),
            'using_credit_card': True,
            # Credit card and installments are missing
        }
        form = ExpenseForm(data=form_data, user=self.user)
        self.assertFalse(form.is_valid())
        self.assertIn('credit_card', form.errors)
        self.assertIn('installments', form.errors)

    def test_invalid_recurring_expense_with_installments(self):
        """Test validation error when creating a recurring expense with installments."""
        form_data = {
            'category': self.category.id,
            'description': 'Invalid Recurring Expense',
            'amount': '100.00',
            'date': timezone.now().date(),
            'credit_card': self.credit_card.id,
            'installments': 3,
            'is_recurring': True,
            'using_credit_card': True
        }
        form = ExpenseForm(data=form_data, user=self.user)
        self.assertFalse(form.is_valid())
        self.assertIn('__all__', form.errors)
        self.assertEqual(
            form.errors['__all__'][0],
            "Recurring expenses with installments are not supported for credit card payments."
        )

    def test_saving_recurring_credit_card_expense(self):
        """Test saving a recurring expense with a credit card and a single installment."""
        form_data = {
            'category': self.category.id,
            'description': 'Recurring Expense with Card',
            'amount': '1000.00',
            'date': timezone.now().date(),
            'credit_card': self.credit_card.id,
            'installments': 1,  # Ensure installments = 1 since recurring + installments > 1 is not allowed
            'surcharge': '10.00',
            'is_recurring': True,
            'using_credit_card': True
        }
        form = ExpenseForm(data=form_data, user=self.user)
        self.assertTrue(form.is_valid(), form.errors)
        expense = form.save()

        # Since there's no surcharge with a single installment, the amount should remain the same
        expected_total = Decimal('1000.00')  # No surcharge applies for a single installment
        self.assertEqual(expense.amount, expected_total)

    def test_saving_normal_expense(self):
        """Test saving a normal expense without credit card logic."""
        form_data = {
            'category': self.category.id,
            'description': 'Normal Expense',
            'amount': '200.00',
            'date': timezone.now().date(),
            'using_credit_card': False
        }
        form = ExpenseForm(data=form_data, user=self.user)
        self.assertTrue(form.is_valid(), form.errors)
        expense = form.save()
        self.assertEqual(expense.amount, Decimal('200.00'))
    def test_saving_non_credit_card_expense(self):
        """Test saving an expense without using a credit card."""
        form_data = {
            'category': self.category.id,
            'description': 'Non-credit card expense',
            'amount': '500.00',
            'date': timezone.now().date(),
            'installments': 1,
            'surcharge': '0.00',
            'is_recurring': False,
            'using_credit_card': False  # Not using a credit card
        }
        form = ExpenseForm(data=form_data, user=self.user)
        self.assertTrue(form.is_valid(), form.errors)
        expense = form.save()

        # Verify that the expense is saved without a credit card
        self.assertIsNone(expense.credit_card)
        self.assertEqual(expense.amount, Decimal('500.00'))
        self.assertEqual(expense.installments, 1)
    def test_validation_credit_card_required_when_using_credit_card(self):
        """Test validation when paying with a credit card but no credit card is provided."""
        form_data = {
            'category': self.category.id,
            'description': 'Credit card expense without credit card',
            'amount': '100.00',
            'date': timezone.now().date(),
            'installments': 3,
            'surcharge': '5.00',
            'is_recurring': False,
            'using_credit_card': True,  # Credit card selected, but not provided
            'credit_card': None
        }
        form = ExpenseForm(data=form_data, user=self.user)
        self.assertFalse(form.is_valid())
        self.assertIn('credit_card', form.errors)
    def test_validation_installments_required_when_using_credit_card(self):
        """Test validation when paying with a credit card but installments are missing."""
        form_data = {
            'category': self.category.id,
            'description': 'Credit card expense without installments',
            'amount': '100.00',
            'date': timezone.now().date(),
            'surcharge': '5.00',
            'is_recurring': False,
            'using_credit_card': True,  # Credit card selected, but no installments
            'credit_card': self.credit_card.id,
            'installments': None
        }
        form = ExpenseForm(data=form_data, user=self.user)
        self.assertFalse(form.is_valid())
        self.assertIn('installments', form.errors)
    def test_validation_recurring_expense_with_multiple_installments(self):
        """Test validation when a recurring expense has multiple installments."""
        form_data = {
            'category': self.category.id,
            'description': 'Recurring expense with multiple installments',
            'amount': '1000.00',
            'date': timezone.now().date(),
            'credit_card': self.credit_card.id,
            'installments': 3,  # Multiple installments
            'surcharge': '10.00',
            'is_recurring': True,  # Recurring expense
            'using_credit_card': True
        }
        form = ExpenseForm(data=form_data, user=self.user)
        self.assertFalse(form.is_valid())
        self.assertIn('__all__', form.errors)  # Non-field error about installments with recurring
        self.assertEqual(
            form.errors['__all__'][0],
            'Recurring expenses with installments are not supported for credit card payments.'
    )
    def test_form_initial_values(self):
        """Test that form initializes with the correct default values."""
        form = ExpenseForm(user=self.user)
        self.assertEqual(form.fields['date'].initial, timezone.now().date())
        self.assertFalse(form.fields['credit_card'].required)
        self.assertFalse(form.fields['installments'].required)
        self.assertFalse(form.fields['surcharge'].required)

    def test_saving_credit_card_expense_with_surcharge(self):
        """Test saving a credit card expense with multiple installments and surcharge."""
        form_data = {
            'category': self.category.id,
            'description': 'Credit card expense with surcharge',
            'amount': '1000.00',
            'date': timezone.now().date(),
            'credit_card': self.credit_card.id,
            'installments': 3,  # Multiple installments
            'surcharge': '10.00',
            'is_recurring': False,
            'using_credit_card': True
        }
        form = ExpenseForm(data=form_data, user=self.user)
        self.assertTrue(form.is_valid(), form.errors)
        expense = form.save()

        # Calculate expected total with surcharge
        P = Decimal('1000.00')
        R = Decimal('10.00') / Decimal('100')
        T = Decimal('3') / Decimal('12')
        SI = P * R * T
        expected_total = P + SI

        # Check if the total amount with surcharge is calculated correctly
        self.assertEqual(expense.amount, expected_total)
class IncomeFormTest(TestCase):

    def setUp(self):
        """Set up a test user and income category for the form."""
        self.user = User.objects.create_user(username='testuser', password='password')
        self.category = IncomeCategory.objects.create(name='Salary', user=self.user)

    # Test Case 1: Test form is valid with correct data
    def test_income_form_valid(self):
        """Test that the form is valid with correct data."""
        form_data = {
            'category': self.category.id,
            'description': 'Monthly Salary',
            'amount': '3000.00',
            'date': timezone.now().date(),
            'is_recurring': True,
        }
        form = IncomeForm(data=form_data, user=self.user)
        self.assertTrue(form.is_valid(), form.errors)
        income = form.save()
        self.assertEqual(income.amount, Decimal('3000.00'))
        self.assertTrue(income.is_recurring)

    # Test Case 2: Test form is invalid with missing amount
    def test_income_form_invalid_missing_amount(self):
        """Test that the form is invalid when the amount is missing."""
        form_data = {
            'category': self.category.id,
            'description': 'Freelance Project',
            'date': timezone.now().date(),
            'is_recurring': False,
        }
        form = IncomeForm(data=form_data, user=self.user)
        self.assertFalse(form.is_valid())
        self.assertIn('amount', form.errors)

    # Test Case 3: Test form is invalid with missing category
    def test_income_form_invalid_missing_category(self):
        """Test that the form is invalid when the category is missing."""
        form_data = {
            'description': 'Freelance Project',
            'amount': '1500.00',
            'date': timezone.now().date(),
            'is_recurring': False,
        }
        form = IncomeForm(data=form_data, user=self.user)
        self.assertFalse(form.is_valid())
        self.assertIn('category', form.errors)

    # Test Case 4: Test form handles recurring income
    def test_income_form_recurring_income(self):
        """Test that the form correctly handles recurring income."""
        form_data = {
            'category': self.category.id,
            'description': 'Recurring Salary',
            'amount': '2000.00',
            'date': timezone.now().date(),
            'is_recurring': True,
        }
        form = IncomeForm(data=form_data, user=self.user)
        self.assertTrue(form.is_valid(), form.errors)
        income = form.save()
        self.assertTrue(income.is_recurring)
        self.assertEqual(income.amount, Decimal('2000.00'))

    # Test Case 5: Test form saves with the current date
    def test_income_form_saves_with_default_date(self):
        """Test that the form saves income with the default date (today) if no date is provided."""
        form_data = {
            'category': self.category.id,
            'description': 'Bonus Payment',
            'amount': '500.00',
            'is_recurring': False,
            # Date field is not provided to simulate default behavior
        }
        form = IncomeForm(data=form_data, user=self.user)
        self.assertTrue(form.is_valid(), form.errors)
        income = form.save()
        self.assertEqual(income.date, timezone.now().date())
    def test_income_form_missing_required_fields(self):
        """Test that the form is invalid if required fields are missing."""
        form_data = {
            'description': '',  # Optional field
            'amount': '',  # Missing amount
        }
        form = IncomeForm(data=form_data, user=self.user)
        self.assertFalse(form.is_valid())
        self.assertIn('category', form.errors)
        self.assertIn('amount', form.errors)  # Check for required fields only
    def test_income_form_invalid_amount(self):
        """Test that the form does not accept negative or zero amounts."""
        form_data = {
            'category': self.category.id,
            'description': 'Invalid Amount',
            'amount': '-100.00',  # Invalid negative amount
            'date': '2024-01-01',
            'is_recurring': False,
        }
        form = IncomeForm(data=form_data, user=self.user)
        self.assertFalse(form.is_valid())
        self.assertIn('amount', form.errors)

        # Now test with zero amount
        form_data['amount'] = '0.00'
        form = IncomeForm(data=form_data, user=self.user)
        self.assertFalse(form.is_valid())
        self.assertIn('amount', form.errors)
    def test_income_form_recurring_income(self):
        """Test that the form saves correctly for a recurring income."""
        form_data = {
            'category': self.category.id,
            'description': 'Monthly Salary',
            'amount': '1500.00',
            'date': '2024-01-01',
            'is_recurring': True,  # Recurring income
        }
        form = IncomeForm(data=form_data, user=self.user)
        self.assertTrue(form.is_valid(), form.errors)
        income = form.save()
        self.assertTrue(income.is_recurring)
    def test_income_form_with_future_date(self):
        """Test that the form is invalid if the date is in the future."""
        future_date = timezone.now().date() + timedelta(days=1)  # Set a future date
        form_data = {
            'category': self.category.id,
            'description': 'Test income with future date',
            'amount': '1000.00',
            'date': future_date,  # Future date
            'is_recurring': False
        }
        form = IncomeForm(data=form_data, user=self.user)
        
        # The form should not be valid
        self.assertFalse(form.is_valid())
        
        # Assert that the correct error message is raised
        self.assertIn('__all__', form.errors)
        self.assertIn('Income date cannot be in the future.', form.errors['__all__'])

    def test_income_form_description_max_length(self):
        """Test that the form validates the max length for description."""
        form_data = {
            'category': self.category.id,
            'description': 'A' * 256,  # Assuming 255 characters is the max
            'amount': '100.00',
            'date': '2024-01-01',
            'is_recurring': False,
        }
        form = IncomeForm(data=form_data, user=self.user)
        self.assertFalse(form.is_valid())
        self.assertIn('description', form.errors)
