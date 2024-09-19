import django
django.setup()

from tracker.models import ExpenseCategory , CreditCard, Expense
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta

User = get_user_model()

class ExpenseCategoryModelTest(TestCase):

    def setUp(self):
        # Create two test users
        self.user1 = User.objects.create_user(username='testuser1', password='12345')
        self.user2 = User.objects.create_user(username='testuser2', password='12345')

    def test_expense_category_creation_success(self):
        """Test creating an expense category"""
        category = ExpenseCategory.objects.create(user=self.user1, name="Groceries")
        self.assertEqual(category.name, "Groceries")
        self.assertEqual(category.user, self.user1)

    def test_expense_category_str_representation_success(self):
        """Test the string representation of the expense category"""
        category = ExpenseCategory.objects.create(user=self.user1, name="Utilities")
        self.assertEqual(str(category), "Utilities")

    def test_expense_category_name_max_length_validation(self):
        """Test the max length of the name field"""
        long_name = 'A' * 100  # exactly 100 characters
        category = ExpenseCategory.objects.create(user=self.user1, name=long_name)
        self.assertEqual(category.name, long_name)

        # Now validate a name with more than 100 characters
        long_name = 'A' * 101  # 101 characters
        category = ExpenseCategory(user=self.user1, name=long_name)

        with self.assertRaises(ValidationError):
            category.full_clean()  # This should raise a ValidationError

    def test_expense_category_multiple_creation_success(self):
        """Test that a user can create multiple categories"""
        category1 = ExpenseCategory.objects.create(user=self.user1, name="Rent")
        category2 = ExpenseCategory.objects.create(user=self.user1, name="Entertainment")
        self.assertEqual(ExpenseCategory.objects.filter(user=self.user1).count(), 2)

    def test_expense_category_same_name_for_different_users_success(self):
        """Test that different users can have categories with the same name"""
        category1 = ExpenseCategory.objects.create(user=self.user1, name="Health")
        category2 = ExpenseCategory.objects.create(user=self.user2, name="Health")
        self.assertNotEqual(category1.user, category2.user)
        self.assertEqual(category1.name, category2.name)

    def test_expense_category_empty_name_validation(self):
        """Test that creating a category without a name raises a ValidationError"""
        category = ExpenseCategory(user=self.user1, name="")
        with self.assertRaises(ValidationError):
            category.full_clean()

    def test_expense_category_unique_name_per_user_validation(self):
        """Test that a user cannot create two categories with the same name"""
        ExpenseCategory.objects.create(user=self.user1, name="Groceries")
        with self.assertRaises(ValidationError):
            duplicate_category = ExpenseCategory(user=self.user1, name="Groceries")
            duplicate_category.full_clean()
    
    def test_expense_category_deletion_on_user_delete_success(self):
        """Test that categories are deleted when the associated user is deleted"""
        category = ExpenseCategory.objects.create(user=self.user1, name="Groceries")
        self.user1.delete()
        self.assertFalse(ExpenseCategory.objects.filter(id=category.id).exists())

class CreditCardModelTest(TestCase):

    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(username='testuser', password='12345')

    def test_credit_card_creation_success(self):
        """Test creating a credit card with valid data"""
        card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='Visa',
            expire_date='2025-12-31',
            credit_limit=5000.00,
            payment_day=15,
            close_card_day=21
        )
        self.assertEqual(card.last_four_digits, '1234')
        self.assertEqual(card.brand, 'Visa')

    def test_credit_card_str_representation_success(self):
        """Test the string representation of the credit card"""
        card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='MasterCard',
            expire_date='2025-12-31',
            credit_limit=3000.00,
            payment_day=10,
            close_card_day=21
        )
        self.assertEqual(str(card), "MasterCard ending in 1234")

    def test_credit_card_last_four_digits_validation(self):
        """Test that last four digits must be exactly 4 digits"""
        with self.assertRaises(ValidationError):
            invalid_card = CreditCard(
                user=self.user,
                last_four_digits='12',
                brand='Visa',
                expire_date='2025-12-31',
                credit_limit=5000.00,
                payment_day=15,
                close_card_day=21
            )
            invalid_card.full_clean()  # This should raise ValidationError

        with self.assertRaises(ValidationError):
            invalid_card = CreditCard(
                user=self.user,
                last_four_digits='12345',  # Too many digits
                brand='Visa',
                expire_date='2025-12-31',
                credit_limit=5000.00,
                payment_day=15,
                close_card_day=21
            )
            invalid_card.full_clean()

    def test_credit_card_payment_day_validation(self):
        """Test that payment day is between 1 and 31"""
        with self.assertRaises(ValidationError):
            invalid_card = CreditCard(
                user=self.user,
                last_four_digits='1234',
                brand='Visa',
                expire_date='2025-12-31',
                credit_limit=5000.00,
                payment_day=32,  # Invalid day
                close_card_day=21
            )
            invalid_card.full_clean()

    def test_credit_card_close_card_day_validation(self):
        """Test that close card day is between 1 and 31"""
        with self.assertRaises(ValidationError):
            invalid_card = CreditCard(
                user=self.user,
                last_four_digits='1234',
                brand='Visa',
                expire_date='2025-12-31',
                credit_limit=5000.00,
                payment_day=15,
                close_card_day=0  # Invalid day
            )
            invalid_card.full_clean()

    def test_credit_card_current_balance_calculation(self):
        """Test that the current balance is calculated correctly"""
        card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='Visa',
            expire_date='2025-12-31',
            credit_limit=5000.00,
            payment_day=15,
            close_card_day=21
        )

        # Add non-recurring expense
        Expense.objects.create(
            credit_card=card,
            user=self.user,
            amount=Decimal('100.00'),
            surcharge=Decimal('5.00'),
            is_recurring=False,
            pay_with_credit_card=True,
            date=timezone.now().date()
        )

        # Add recurring expense
        Expense.objects.create(
            credit_card=card,
            user=self.user,
            amount=Decimal('200.00'),
            surcharge=Decimal('2.50'),
            is_recurring=True,
            installments=2,
            pay_with_credit_card=True,
            date=timezone.now().date()
        )

        # Test balance calculation
        self.assertEqual(card.current_balance(), Decimal('207.50'))  # (100 + 5%) + ((200 + 2.5%) / 2)

    def test_credit_card_available_credit_calculation(self):
        """Test that available credit is calculated correctly"""
        card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='Visa',
            expire_date='2025-12-31',
            credit_limit=5000.00,
            payment_day=15,
            close_card_day=21
        )

        # Add a non-recurring expense
        Expense.objects.create(
            credit_card=card,
            user=self.user,
            amount=Decimal('100.00'),
            surcharge=Decimal('5.00'),
            is_recurring=False,
            pay_with_credit_card=True,
            date=timezone.now().date()
        )

        # Test available credit calculation
        self.assertEqual(card.available_credit(), Decimal('4895.00'))  # 5000 - (100 + 5%)

    def test_credit_card_expire_date(self):
        """Test that the expire date is set correctly"""
        card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='Visa',
            expire_date=date(2025, 12, 31),  # Use `datetime.date` here
            credit_limit=5000.00,
            payment_day=15,
            close_card_day=21
        )
        self.assertEqual(card.expire_date, date(2025, 12, 31))  # Compare with `datetime.date`
    def test_credit_card_negative_credit_limit(self):
        """Test that a credit card cannot have a negative credit limit"""
        with self.assertRaises(ValidationError):
            card = CreditCard(
                user=self.user,
                last_four_digits='1234',
                brand='Visa',
                expire_date='2025-12-31',
                credit_limit=-1000.00,  # Invalid negative limit
                payment_day=15,
                close_card_day=21
            )
            card.full_clean()  # This should raise ValidationError
    def test_credit_card_expired(self):
        """Test that expired credit cards are handled correctly"""
        card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='Visa',
            expire_date=date(2020, 12, 31),  # Already expired
            credit_limit=5000.00,
            payment_day=15,
            close_card_day=21
        )
        self.assertTrue(card.expire_date < timezone.now().date())  # Ensure it's expired
    def test_credit_card_zero_installments(self):
        """Test that zero installments raise an error"""
        card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='Visa',
            expire_date=date(2025, 12, 31),
            credit_limit=5000.00,
            payment_day=15,
            close_card_day=21
        )
        
        # Create an expense with 0 installments
        expense = Expense(
            credit_card=card,
            user=self.user,
            amount=Decimal('100.00'),
            surcharge=Decimal('5.00'),
            is_recurring=True,
            installments=0,  # Invalid number of installments
            pay_with_credit_card=True,
            date=timezone.now().date()
        )
        
        # Trigger validation explicitly
        with self.assertRaises(ValidationError):
            expense.full_clean()  # This will raise ValidationError if installments < 1
    def test_credit_card_payment_day_boundaries(self):
        """Test the boundaries for payment_day (1 and 31)"""
        # Test with the minimum valid value
        card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='Visa',
            expire_date='2025-12-31',
            credit_limit=5000.00,
            payment_day=1,  # Minimum valid value
            close_card_day=21
        )
        self.assertEqual(card.payment_day, 1)

        # Test with the maximum valid value
        card.payment_day = 31  # Maximum valid value
        card.full_clean()  # This should pass without errors
        self.assertEqual(card.payment_day, 31)

        # Test with an invalid value (less than 1)
        card.payment_day = 0
        with self.assertRaises(ValidationError):
            card.full_clean()

        # Test with an invalid value (greater than 31)
        card.payment_day = 32
        with self.assertRaises(ValidationError):
            card.full_clean()

    def test_credit_card_close_card_day_boundaries(self):
        """Test the boundaries for close_card_day (1 and 31)"""
        # Test with the minimum valid value
        card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='Visa',
            expire_date='2025-12-31',
            credit_limit=5000.00,
            payment_day=15,
            close_card_day=1  # Minimum valid value
        )
        self.assertEqual(card.close_card_day, 1)

        # Test with the maximum valid value
        card.close_card_day = 31  # Maximum valid value
        card.full_clean()  # This should pass without errors
        self.assertEqual(card.close_card_day, 31)

        # Test with an invalid value (less than 1)
        card.close_card_day = 0
        with self.assertRaises(ValidationError):
            card.full_clean()

        # Test with an invalid value (greater than 31)
        card.close_card_day = 32
        with self.assertRaises(ValidationError):
            card.full_clean()

    def test_credit_card_expired_cannot_add_expense(self):
        """Test that an expense cannot be added to an expired credit card"""
        expired_card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='Visa',
            expire_date=timezone.now().date() - timedelta(days=1),  # Expired card
            credit_limit=5000.00,
            payment_day=15,
            close_card_day=21
        )

        # Try to add an expense to the expired card
        with self.assertRaises(ValidationError):
            expense = Expense.objects.create(
                credit_card=expired_card,
                user=self.user,
                amount=Decimal('100.00'),
                surcharge=Decimal('5.00'),
                is_recurring=False,
                pay_with_credit_card=True,
                date=timezone.now().date()
            )
            expense.full_clean()  # This should raise a ValidationError
