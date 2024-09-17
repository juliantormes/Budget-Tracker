import django
django.setup()

from tracker.models import ExpenseCategory
from django.db.utils import DataError
from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class ExpenseCategoryModelTest(TestCase):
    
    def setUp(self):
        # Create two test users
        self.user1 = User.objects.create_user(username='testuser1', password='12345')
        self.user2 = User.objects.create_user(username='testuser2', password='12345')

    def test_expense_category_creation(self):
        """Test creating an expense category"""
        category = ExpenseCategory.objects.create(user=self.user1, name="Groceries")
        self.assertEqual(category.name, "Groceries")
        self.assertEqual(category.user, self.user1)

    def test_expense_category_str(self):
        """Test the string representation of the expense category"""
        category = ExpenseCategory.objects.create(user=self.user1, name="Utilities")
        self.assertEqual(str(category), "Utilities")

    def test_expense_category_name_max_length(self):
        """Test the max length of the name field"""
        long_name = 'A' * 100  # exactly 100 characters
        category = ExpenseCategory.objects.create(user=self.user1, name=long_name)
        self.assertEqual(category.name, long_name)

        with self.assertRaises(DataError):
            # Try to create a category with a name longer than 100 characters
            long_name = 'A' * 101  # 101 characters
            ExpenseCategory.objects.create(user=self.user1, name=long_name)

    def test_multiple_categories_same_user(self):
        """Test that a user can create multiple categories"""
        category1 = ExpenseCategory.objects.create(user=self.user1, name="Rent")
        category2 = ExpenseCategory.objects.create(user=self.user1, name="Entertainment")
        self.assertEqual(ExpenseCategory.objects.filter(user=self.user1).count(), 2)

    def test_categories_for_different_users(self):
        """Test that different users can have categories with the same name"""
        category1 = ExpenseCategory.objects.create(user=self.user1, name="Health")
        category2 = ExpenseCategory.objects.create(user=self.user2, name="Health")
        self.assertNotEqual(category1.user, category2.user)
        self.assertEqual(category1.name, category2.name)
