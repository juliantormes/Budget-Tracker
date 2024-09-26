import django
django.setup()
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from tracker.serializers import UserSerializer, SignUpSerializer, LoginSerializer, ExpenseCategorySerializer, IncomeCategorySerializer,CreditCardSerializer, IncomeRecurringChangeLogSerializer, ExpenseRecurringChangeLogSerializer
from tracker.models import IncomeRecurringChangeLog, ExpenseRecurringChangeLog, Income, Expense, ExpenseCategory, IncomeCategory, CreditCard
from django.utils import timezone
from decimal import Decimal
from datetime import datetime


class UserSerializerTest(APITestCase):

    def setUp(self):
        """Set up a user to test serialization."""
        self.user = User.objects.create_user(username='testuser', password='password')

    def test_user_serializer(self):
        """Test if the UserSerializer correctly serializes data."""
        serializer = UserSerializer(self.user)
        expected_data = {
            'id': self.user.id,
            'username': self.user.username
        }
        self.assertEqual(serializer.data, expected_data)

    def test_user_serializer_partial_data(self):
        """Test that UserSerializer handles partial data correctly."""
        # Simulate partial data by omitting 'id'
        user = User(username='partialuser')
        serializer = UserSerializer(user)
        expected_data = {
            'id': None,  # Since the user is not saved, id will be None
            'username': 'partialuser'
        }
        self.assertEqual(serializer.data, expected_data)
class SignUpSerializerTest(APITestCase):

    def test_create_user(self):
        """Test if the SignUpSerializer correctly creates a user."""
        data = {
            'username': 'newuser',
            'password': 'newpassword123'
        }
        serializer = SignUpSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()

        # Check if the user was created correctly
        self.assertIsInstance(user, User)
        self.assertEqual(user.username, 'newuser')

        # Ensure the password was hashed
        self.assertTrue(user.check_password('newpassword123'))

    def test_signup_serializer_password_hidden(self):
        """Test if the password field is write-only."""
        data = {
            'username': 'newuser',
            'password': 'newpassword123'
        }
        serializer = SignUpSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        serializer.save()

        # Password should not be returned in the serialized data
        self.assertNotIn('password', serializer.data)
    def test_signup_serializer_missing_username(self):
        """Test that SignUpSerializer fails when 'username' is missing."""
        data = {
            'password': 'validpassword123'
        }
        serializer = SignUpSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)

class LoginSerializerTest(APITestCase):

    def test_login_serializer(self):
        """Test if the LoginSerializer validates and returns the correct data."""
        data = {
            'username': 'testuser',
            'password': 'password123'
        }
        serializer = LoginSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data, data)
    def test_login_serializer_missing_username(self):
        """Test that LoginSerializer fails when 'username' is missing."""
        data = {
            'password': 'password123'
        }
        serializer = LoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)

    def test_login_serializer_missing_password(self):
        """Test that LoginSerializer fails when 'password' is missing."""
        data = {
            'username': 'testuser'
        }
        serializer = LoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
class ExpenseCategorySerializerTest(APITestCase):
    
    def setUp(self):
        """Set up a test user and expense category"""
        self.user = User.objects.create_user(username='testuser', password='password')
        self.expense_category_data = {'name': 'Food', 'user': self.user}

    def test_expense_category_serializer_valid_data(self):
        """Test that the serializer is valid with correct data"""
        serializer = ExpenseCategorySerializer(data=self.expense_category_data)
        self.assertTrue(serializer.is_valid())

    def test_expense_category_serializer_user_read_only(self):
        """Test that the user field is read-only"""
        expense_category = ExpenseCategory.objects.create(name='Transport', user=self.user)
        serializer = ExpenseCategorySerializer(expense_category)
        
        # User should be included in the serialized data but should not be writable
        self.assertEqual(serializer.data['user'], self.user.id)
        
        # Try updating the user field (this should not change the user)
        new_user = User.objects.create_user(username='newuser', password='password')
        update_data = {'name': 'Food', 'user': new_user.id}
        serializer = ExpenseCategorySerializer(expense_category, data=update_data, partial=True)
        
        # The serializer should be valid, but the 'user' should remain unchanged
        self.assertTrue(serializer.is_valid())  # The serializer should still be valid
        updated_instance = serializer.save()
        
        # Ensure that the user field was not updated
        self.assertEqual(updated_instance.user, self.user)  # User should still be the original user

    def test_expense_category_serializer_invalid_data(self):
        """Test that the serializer returns errors with invalid data"""
        invalid_data = {'name': '', 'user': self.user}  # Name cannot be blank
        serializer = ExpenseCategorySerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)


class IncomeCategorySerializerTest(APITestCase):
    
    def setUp(self):
        """Set up a test user and income category"""
        self.user = User.objects.create_user(username='testuser', password='password')
        self.income_category_data = {'name': 'Salary', 'user': self.user}

    def test_income_category_serializer_valid_data(self):
        """Test that the serializer is valid with correct data"""
        serializer = IncomeCategorySerializer(data=self.income_category_data)
        self.assertTrue(serializer.is_valid())

    def test_income_category_serializer_user_read_only(self):
        """Test that the user field is read-only"""
        income_category = IncomeCategory.objects.create(name='Bonus', user=self.user)
        serializer = IncomeCategorySerializer(income_category)
        
        # User should be included in the serialized data but should not be writable
        self.assertEqual(serializer.data['user'], self.user.id)
        
        # Try updating user field (this should not change the user)
        new_user = User.objects.create_user(username='newuser', password='password')
        update_data = {'name': 'Salary', 'user': new_user.id}
        serializer = IncomeCategorySerializer(income_category, data=update_data, partial=True)
        
        # The serializer should still be valid, but the 'user' should remain unchanged
        self.assertTrue(serializer.is_valid())  # The serializer should be valid
        updated_instance = serializer.save()
        self.assertEqual(updated_instance.user, self.user)  # Ensure user was not updated

    def test_income_category_serializer_invalid_data(self):
        """Test that the serializer returns errors with invalid data"""
        invalid_data = {'name': '', 'user': self.user}  # Name cannot be blank
        serializer = IncomeCategorySerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)
class CreditCardSerializerTest(APITestCase):

    def setUp(self):
        self.valid_data = {
            'last_four_digits': '1234',
            'brand': 'Visa',
            'expire_date': (timezone.now().date() + timezone.timedelta(days=365)).strftime('%Y-%m-%d'),
            'credit_limit': 5000.00,
            'payment_day': 15,
            'close_card_day': 10,
        }

    # Test Case 1: Valid data should pass
    def test_credit_card_serializer_valid(self):
        """Test that a credit card serializer is valid with correct data."""
        serializer = CreditCardSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    # Test Case 2: Invalid last four digits (non-numeric)
    def test_credit_card_serializer_invalid_last_four_digits(self):
        """Test that the last four digits validation fails for non-numeric input."""
        invalid_data = self.valid_data.copy()
        invalid_data['last_four_digits'] = 'abcd'
        serializer = CreditCardSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('last_four_digits', serializer.errors)

    # Test Case 3: Invalid last four digits (wrong length)
    def test_credit_card_serializer_invalid_last_four_digits_length(self):
        """Test that the last four digits validation fails for less than 4 digits."""
        invalid_data = self.valid_data.copy()
        invalid_data['last_four_digits'] = '123'
        serializer = CreditCardSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('last_four_digits', serializer.errors)

    # Test Case 4: Expire date in the past
    def test_credit_card_serializer_invalid_expire_date(self):
        """Test that the expire date cannot be in the past."""
        invalid_data = self.valid_data.copy()
        invalid_data['expire_date'] = (timezone.now().date() - timezone.timedelta(days=1)).strftime('%Y-%m-%d')
        serializer = CreditCardSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('expire_date', serializer.errors)

    # Test Case 5: Payment day before close card day
    def test_credit_card_serializer_payment_day_before_close_day(self):
        """Test that payment day validation fails when payment day is before close card day."""
        invalid_data = self.valid_data.copy()
        invalid_data['payment_day'] = 5  # Set to a value before close_card_day
        invalid_data['close_card_day'] = 10
        serializer = CreditCardSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('payment_day', serializer.errors)
class IncomeRecurringChangeLogSerializerTest(APITestCase):

    def setUp(self):
        self.income = Income.objects.create(
            amount=1000.00,
            description='Test Income',
            date=datetime(2024, 1, 1),
            is_recurring=True
        )
        self.data = {
            'new_amount': Decimal('1200.00'),
            'effective_date': '2024-02-01'
        }

    # Test Case 1: Test valid data for IncomeRecurringChangeLogSerializer
    def test_valid_income_recurring_change_log_serializer(self):
        """Test valid IncomeRecurringChangeLogSerializer"""
        serializer = IncomeRecurringChangeLogSerializer(data=self.data, context={'income': self.income})
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['new_amount'], Decimal('1200.00'))

    # Test Case 2: Test effective date validation
    def test_income_recurring_change_log_invalid_effective_date(self):
        """Test invalid effective date for IncomeRecurringChangeLogSerializer"""
        self.data['effective_date'] = '2023-12-01'  # Before the income start date
        serializer = IncomeRecurringChangeLogSerializer(data=self.data, context={'income': self.income})
        self.assertFalse(serializer.is_valid())
        self.assertIn('effective_date', serializer.errors)
        self.assertEqual(serializer.errors['effective_date'][0], "Effective date cannot be earlier than the start date of the income.")

    # Test Case 3: Test missing income in context
    def test_income_recurring_change_log_missing_income(self):
        """Test missing income data in context for IncomeRecurringChangeLogSerializer"""
        serializer = IncomeRecurringChangeLogSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('effective_date', serializer.errors)
        self.assertEqual(serializer.errors['effective_date'][0], "Income data is missing.")

    # Test Case 4: Test read-only income field
    def test_income_recurring_change_log_read_only_income(self):
        """Test that the income field is read-only"""
        income_change_log = IncomeRecurringChangeLog.objects.create(
            income=self.income,
            new_amount=Decimal('1200.00'),
            effective_date='2024-02-01'
        )
        serializer = IncomeRecurringChangeLogSerializer(income_change_log)
        self.assertEqual(serializer.data['income'], self.income.id)


class ExpenseRecurringChangeLogSerializerTest(APITestCase):

    def setUp(self):
        self.expense = Expense.objects.create(
            amount=500.00,
            description='Test Expense',
            date=datetime(2024, 1, 1),
            is_recurring=True
        )
        self.data = {
            'new_amount': Decimal('600.00'),
            'effective_date': '2024-03-01'
        }

    # Test Case 1: Test valid data for ExpenseRecurringChangeLogSerializer
    def test_valid_expense_recurring_change_log_serializer(self):
        """Test valid ExpenseRecurringChangeLogSerializer"""
        serializer = ExpenseRecurringChangeLogSerializer(data=self.data, context={'expense': self.expense})
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['new_amount'], Decimal('600.00'))

    # Test Case 2: Test effective date validation
    def test_expense_recurring_change_log_invalid_effective_date(self):
        """Test invalid effective date for ExpenseRecurringChangeLogSerializer"""
        # Set an invalid effective date (before the expense date)
        self.data['effective_date'] = '2023-12-01'
        # Pass the expense in the context
        serializer = ExpenseRecurringChangeLogSerializer(data=self.data, context={'expense': self.expense})
        
        # Assert that the serializer is invalid
        self.assertFalse(serializer.is_valid())
        self.assertIn('effective_date', serializer.errors)
        self.assertEqual(serializer.errors['effective_date'][0], "Effective date cannot be earlier than the start date of the expense.")

    # Test Case 3: Test missing expense in context
    def test_expense_recurring_change_log_missing_expense(self):
        """Test missing expense data in context for ExpenseRecurringChangeLogSerializer"""
        serializer = ExpenseRecurringChangeLogSerializer(data=self.data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('effective_date', serializer.errors)
        self.assertEqual(serializer.errors['effective_date'][0], "Expense data is missing.")

    # Test Case 4: Test read-only expense field
    def test_expense_recurring_change_log_read_only_expense(self):
        """Test that the expense field is read-only"""
        expense_change_log = ExpenseRecurringChangeLog.objects.create(
            expense=self.expense,
            new_amount=Decimal('600.00'),
            effective_date='2024-03-01'
        )
        serializer = ExpenseRecurringChangeLogSerializer(expense_change_log)
        self.assertEqual(serializer.data['expense'], self.expense.id)