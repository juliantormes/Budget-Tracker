from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.urls import reverse

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