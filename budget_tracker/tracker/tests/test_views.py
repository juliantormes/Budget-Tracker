from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.urls import reverse
from tracker.models import Expense, ExpenseRecurringChangeLog ,Income, IncomeRecurringChangeLog

class AuthViewsTest(APITestCase):

    def setUp(self):
        """Set up a test user and token for authentication"""
        self.user = User.objects.create_user(username='testuser', password='password')
        self.token = Token.objects.create(user=self.user)
    
    def authenticate(self):
        """Helper to authenticate requests with the token"""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def unauthenticate(self):
        """Helper to remove authentication from requests"""
        self.client.credentials()  # Remove token for unauthenticated requests

    def test_login_success(self):
        """Test logging in with valid credentials"""
        data = {'username': 'testuser', 'password': 'password'}
        self.unauthenticate()  # Ensure we are unauthenticated for login
        response = self.client.post(reverse('login'), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_invalid_credentials(self):
        """Test logging in with invalid credentials"""
        data = {'username': 'wronguser', 'password': 'wrongpassword'}
        self.unauthenticate()  # Ensure no token is sent
        response = self.client.post(reverse('login'), data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Invalid Credentials')

    def test_login_already_authenticated(self):
        """Test logging in when already authenticated"""
        data = {'username': 'testuser', 'password': 'password'}
        self.authenticate()  # Token provided, already authenticated
        response = self.client.post(reverse('login'), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'You are already logged in')

    def test_login_missing_fields(self):
        """Test logging in with missing fields"""
        data = {'username': 'testuser'}  # Missing password
        self.unauthenticate()  # Ensure no token is sent
        response = self.client.post(reverse('login'), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_signup_success(self):
        """Test signing up with valid data"""
        data = {'username': 'newuser', 'password': 'newpassword'}
        self.unauthenticate()  # Ensure we are unauthenticated for signup
        response = self.client.post(reverse('signup'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)

    def test_signup_duplicate_username(self):
        """Test signing up with an existing username"""
        data = {'username': 'testuser', 'password': 'password'}
        self.unauthenticate()  # Ensure no token is sent
        response = self.client.post(reverse('signup'), data)
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data['username'], 'This username is already in use.')

    def test_signup_already_authenticated(self):
        """Test signing up when already authenticated"""
        data = {'username': 'anotheruser', 'password': 'anotherpassword'}
        self.authenticate()  # Token provided, already authenticated
        response = self.client.post(reverse('signup'), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'You are already authenticated')

    def test_signup_missing_fields(self):
        """Test signing up with missing fields"""
        data = {'username': 'newuser'}  # Missing password
        self.unauthenticate()  # Ensure no token is sent
        response = self.client.post(reverse('signup'), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_logout_success(self):
        """Test logging out with valid token"""
        self.authenticate()  # Token provided for authenticated logout
        response = self.client.post(reverse('logout'))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_logout_without_authentication(self):
        """Test logging out without being authenticated"""
        self.unauthenticate()  # Ensure no token is provided
        response = self.client.post(reverse('logout'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Authentication credentials were not provided.')

    def test_login_inactive_user(self):
        """Test logging in with an inactive user"""
        self.user.is_active = False
        self.user.save()
        data = {'username': 'testuser', 'password': 'password'}
        self.client.credentials()  # Remove token for login test
        response = self.client.post(reverse('login'), data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['error'], 'Invalid Credentials')
class UpdateRecurringExpenseTest(APITestCase):

    def setUp(self):
        # Create test user and authenticate
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')

        # Create an initial expense for the user
        self.expense = Expense.objects.create(user=self.user, amount=100, description='Test Expense')

        # URL for the update view
        self.url = reverse('update_recurring_expense', kwargs={'expense_id': self.expense.id})

    def test_successful_update_existing_log(self):
        """Test updating an existing recurring expense log with all fields"""
        log = ExpenseRecurringChangeLog.objects.create(expense=self.expense, new_amount=150, effective_date='2024-09-20')

        data = {
            'new_amount': 200,
            'effective_date': '2024-09-20'  # All fields provided
        }

        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['new_amount'], '200.00')  # Check the updated value

    def test_create_new_log(self):
        """Test creating a new recurring expense log"""
        data = {
            'new_amount': 200,
            'effective_date': '2024-10-01'
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['new_amount'], '200.00')
        self.assertEqual(ExpenseRecurringChangeLog.objects.filter(expense=self.expense).count(), 1)

    def test_missing_effective_date(self):
        """Test that the effective_date field is required"""
        data = {
            'new_amount': 200
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Effective date is required.')

    def test_invalid_effective_date_format(self):
        """Test validation of effective_date format"""
        data = {
            'new_amount': 200,
            'effective_date': '01/10/2024'  # Invalid format
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Invalid date format. Use YYYY-MM-DD.')

    def test_invalid_expense_id(self):
        """Test using an invalid or non-existent expense ID (404)"""
        url = reverse('update_recurring_expense', kwargs={'expense_id': 9999})  # Non-existent ID
        data = {
            'new_amount': 200,
            'effective_date': '2024-10-01'
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_without_authentication(self):
        """Test that updating without being authenticated returns a 403 error"""
        self.client.logout()  # Logout to remove authentication

        data = {
            'new_amount': 200,
            'effective_date': '2024-10-01'
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partial_update(self):
        """Test that partial updates (i.e., missing fields) are not allowed"""
        log = ExpenseRecurringChangeLog.objects.create(expense=self.expense, new_amount=150, effective_date='2024-09-20')

        data = {
            'new_amount': 250  # Only updating the amount, missing `effective_date`
        }

        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)  # Expecting 400 because effective_date is missing
        self.assertIn('error', response.data)  # Check for the error key
        self.assertEqual(response.data['error'], 'Effective date is required.')  # Confirm the error message matches

    def test_create_log_existing_effective_date(self):
        """Test creating a log with an effective_date that already exists"""
        ExpenseRecurringChangeLog.objects.create(expense=self.expense, new_amount=150, effective_date='2024-09-20')

        data = {
            'new_amount': 200,
            'effective_date': '2024-09-20'  # Same effective_date as an existing log
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['new_amount'], '200.00')  # Should update the existing log

    def test_create_log_future_effective_date(self):
        """Test creating a log with a future effective date"""
        data = {
            'new_amount': 300,
            'effective_date': '2025-01-01'  # Future date
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['new_amount'], '300.00')
class UpdateRecurringIncomeTest(APITestCase):

    def setUp(self):
        # Create test user and authenticate
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')

        # Create an initial income for the user
        self.income = Income.objects.create(user=self.user, amount=1000, description='Test Income')

        # URL for the update view
        self.url = reverse('update_recurring_income', kwargs={'income_id': self.income.id})

    def test_successful_update_existing_log(self):
        """Test updating an existing recurring income log successfully"""
        # Create an initial change log
        log = IncomeRecurringChangeLog.objects.create(income=self.income, new_amount=1200, effective_date='2024-09-20')

        data = {
            'new_amount': 1500,
            'effective_date': '2024-09-20'  # Same month as the existing log
        }

        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['new_amount'], '1500.00')  # Check the updated value

    def test_create_new_log(self):
        """Test creating a new recurring income log"""
        data = {
            'new_amount': 2000,
            'effective_date': '2024-10-01'
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['new_amount'], '2000.00')
        self.assertEqual(IncomeRecurringChangeLog.objects.filter(income=self.income).count(), 1)

    def test_missing_effective_date(self):
        """Test that the effective_date field is required"""
        data = {
            'new_amount': 1500
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Effective date is required.')

    def test_invalid_effective_date_format(self):
        """Test validation of effective_date format"""
        data = {
            'new_amount': 1500,
            'effective_date': '01/10/2024'  # Invalid format
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Invalid date format. Use YYYY-MM-DD.')

    def test_invalid_income_id(self):
        """Test using an invalid or non-existent income ID (404)"""
        url = reverse('update_recurring_income', kwargs={'income_id': 9999})  # Non-existent ID
        data = {
            'new_amount': 2000,
            'effective_date': '2024-10-01'
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_without_authentication(self):
        """Test that updating without being authenticated returns a 403 error"""
        self.client.logout()  # Logout to remove authentication

        data = {
            'new_amount': 1500,
            'effective_date': '2024-10-01'
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partial_update(self):
        """Test that partial updates (i.e., missing fields) are not allowed"""
        log = IncomeRecurringChangeLog.objects.create(income=self.income, new_amount=1200, effective_date='2024-09-20')

        data = {
            'new_amount': 1800  # Only updating the amount, missing `effective_date`
        }

        response = self.client.put(self.url, data, format='json')
        
        # Expecting 400 because the effective_date is missing
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Check for the error key
        self.assertIn('error', response.data)
        
        # Confirm the error message matches the missing effective_date
        self.assertEqual(response.data['error'], 'Effective date is required.')


    def test_create_log_existing_effective_date(self):
        """Test creating a log with an effective_date that already exists"""
        IncomeRecurringChangeLog.objects.create(income=self.income, new_amount=1200, effective_date='2024-09-20')

        data = {
            'new_amount': 1500,
            'effective_date': '2024-09-20'  # Same effective_date as an existing log
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['new_amount'], '1500.00')  # Should update the existing log

    def test_create_log_future_effective_date(self):
        """Test creating a log with a future effective date"""
        data = {
            'new_amount': 2500,
            'effective_date': '2025-01-01'  # Future date
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['new_amount'], '2500.00')