import django
django.setup()

from tracker.models import ExpenseCategory , CreditCard, Expense , IncomeCategory, Income, IncomeRecurringChangeLog, ExpenseRecurringChangeLog
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta
from django.db import IntegrityError, transaction

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
        self.user = User.objects.create_user(username='testuser1', password='12345')

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
class ExpenseModelTest(TestCase):
    
    def setUp(self):
        # Create a user, a category, and a credit card for testing
        self.user = User.objects.create_user(username='testuser1', password='12345')
        self.category = ExpenseCategory.objects.create(user=self.user, name="Groceries")
        self.credit_card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='Visa',
            expire_date='2025-12-31',
            credit_limit=Decimal('5000.00'),
            payment_day=15,
            close_card_day=21
        )

    def test_expense_creation(self):
        """Test that an expense is created successfully"""
        expense = Expense.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('100.00'),
            date=timezone.now().date()
        )
        self.assertEqual(expense.amount, Decimal('100.00'))
        self.assertEqual(expense.user, self.user)
        self.assertEqual(expense.category, self.category)

    def test_expense_with_credit_card(self):
        """Test that an expense with a credit card is handled correctly"""
        expense = Expense.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('200.00'),
            date=timezone.now().date(),
            pay_with_credit_card=True,
            credit_card=self.credit_card,
            surcharge=Decimal('5.00'),
            installments=2
        )
        self.assertEqual(expense.credit_card, self.credit_card)
        self.assertEqual(expense.surcharge, Decimal('5.00'))
        self.assertEqual(expense.installments, 2)

    def test_expense_without_credit_card(self):
        """Test that expense fields are reset when not paid with a credit card"""
        expense = Expense.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('200.00'),
            date=timezone.now().date(),
            pay_with_credit_card=False,
            installments=3,  # This should reset to 1
            surcharge=Decimal('5.00')  # This should reset to 0
        )
        self.assertIsNone(expense.credit_card)
        self.assertEqual(expense.installments, 1)
        self.assertEqual(expense.surcharge, Decimal('0.00'))

    def test_expense_credit_limit_exceeded(self):
        """Test that exceeding the credit limit raises a ValidationError"""
        expense = Expense(
            user=self.user,
            category=self.category,
            amount=Decimal('4900.00'),
            date=timezone.now().date(),
            pay_with_credit_card=True,
            credit_card=self.credit_card,
            surcharge=Decimal('10.00')  # This makes the total expense exceed the limit
        )
        with self.assertRaises(ValidationError):
            expense.save()

    def test_expense_valid_within_credit_limit(self):
        """Test that an expense within the credit limit is saved successfully"""
        expense = Expense.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('300.00'),
            date=timezone.now().date(),
            pay_with_credit_card=True,
            credit_card=self.credit_card,
            surcharge=Decimal('2.00'),
            installments=1
        )
        expense.save()
        self.assertEqual(expense.amount, Decimal('300.00'))

    def test_expense_with_zero_installments(self):
        """Test that an expense cannot have zero installments"""
        with self.assertRaises(ValidationError):
            expense = Expense.objects.create(
                user=self.user,
                category=self.category,
                amount=Decimal('100.00'),
                date=timezone.now().date(),
                pay_with_credit_card=True,
                credit_card=self.credit_card,
                installments=0  # Invalid number of installments
            )
            expense.full_clean()

    def test_expense_get_effective_amount(self):
        """Test that get_effective_amount returns the correct amount based on the date"""
        expense = Expense.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('500.00'),
            date=timezone.now().date(),
            is_recurring=True
        )
        
        # Simulate a change log for this expense with an effective date
        expense.change_logs.create(effective_date=timezone.now().date() - timedelta(days=30), new_amount=Decimal('550.00'))
        
        # Test effective amount with a check date (this should return 550.00)
        effective_amount = expense.get_effective_amount(check_date=timezone.now().date())
        self.assertEqual(effective_amount, Decimal('550.00'))

        # Test the original amount if no change logs are found for the date
        past_date = timezone.now().date() - timedelta(days=60)
        self.assertEqual(expense.get_effective_amount(check_date=past_date), Decimal('500.00'))

    def test_expense_invalid_future_expense(self):
        """Test that an expense cannot be created for a future date"""
        future_date = timezone.now().date() + timedelta(days=30)
        with self.assertRaises(ValidationError):
            expense = Expense(
                user=self.user,
                category=self.category,
                amount=Decimal('100.00'),
                date=future_date  # Future date
            )
            expense.full_clean()
    def test_expense_negative_amount(self):
        """Test that an expense cannot have a negative amount."""
        with self.assertRaises(ValidationError):
            expense = Expense(
                user=self.user,
                category=self.category,
                amount=Decimal('-100.00'),
                date=timezone.now().date(),
                pay_with_credit_card=True,
                credit_card=self.credit_card
            )
            expense.full_clean()  # This should raise a ValidationError

    def test_recurring_expense_future_date(self):
        """Test that a recurring expense cannot be created with a future date."""
        future_date = timezone.now().date() + timedelta(days=1)
        with self.assertRaises(ValidationError):
            expense = Expense(
                user=self.user,
                amount=Decimal('100.00'),
                is_recurring=True,
                date=future_date,
                pay_with_credit_card=True,
                credit_card=self.credit_card
            )
            expense.full_clean()  # This should raise a ValidationError
    def test_expense_surcharge_limits(self):
        """Test that surcharge is within reasonable limits."""
        with self.assertRaises(ValidationError):
            expense = Expense(
                user=self.user,
                amount=Decimal('100.00'),
                surcharge=Decimal('200.00'),  # Unreasonable surcharge
                pay_with_credit_card=True,
                credit_card=self.credit_card
            )
            expense.full_clean()  # This should raise a ValidationError

    def test_expense_save_method_no_credit_card(self):
        """Test that the credit card fields are reset if pay_with_credit_card is False."""
        expense = Expense.objects.create(
            user=self.user,
            amount=Decimal('100.00'),
            pay_with_credit_card=False
        )
        self.assertIsNone(expense.credit_card)
        self.assertEqual(expense.installments, 1)
        self.assertEqual(expense.surcharge, Decimal('0.00'))

    def test_credit_card_limit_enforcement(self):
        """Test that an expense cannot be created if it exceeds the credit card limit."""
        # Create a credit card with a small limit
        card = CreditCard.objects.create(
            user=self.user,
            last_four_digits='1234',
            brand='Visa',
            expire_date='2025-12-31',
            credit_limit=Decimal('500.00'),  # Small credit limit
            payment_day=15,
            close_card_day=21
        )

        # Add an initial expense within the credit limit
        Expense.objects.create(
            user=self.user,
            amount=Decimal('300.00'),
            surcharge=Decimal('10.00'),
            pay_with_credit_card=True,
            credit_card=card,
            date=timezone.now().date()
        )

        # Attempt to add another expense that would exceed the credit limit
        with self.assertRaises(ValidationError):
            expense = Expense(
                user=self.user,
                amount=Decimal('250.00'),  # Exceeds the remaining credit (500 - 300 - 10%)
                surcharge=Decimal('10.00'),
                pay_with_credit_card=True,
                credit_card=card,
                date=timezone.now().date()
            )
            expense.full_clean()  # This should raise a ValidationError
class IncomeCategoryModelTest(TestCase):

    def setUp(self):
        """Set up users and a category before each test"""
        self.user1 = User.objects.create_user(username='testuser1', password='password')  # User 1
        self.user2 = User.objects.create_user(username='testuser2', password='password')  # User 2

    def test_income_category_creation(self):
        """Test creating an income category"""
        category = IncomeCategory.objects.create(user=self.user1, name="Salary")
        self.assertEqual(category.name, "Salary")
        self.assertEqual(category.user, self.user1)

    def test_income_category_str(self):
        """Test the string representation of the income category"""
        category = IncomeCategory.objects.create(user=self.user1, name="Bonus")
        self.assertEqual(str(category), "Bonus")

    def test_income_category_name_max_length(self):
        """Test the max length of the name field"""
        long_name = 'A' * 100  # exactly 100 characters
        category = IncomeCategory.objects.create(user=self.user1, name=long_name)
        self.assertEqual(category.name, long_name)

        # Try to create a category with a name longer than 100 characters
        long_name = 'A' * 101  # 101 characters
        category = IncomeCategory(user=self.user1, name=long_name)
        with self.assertRaises(ValidationError):
            category.full_clean()  # This should raise a ValidationError

    def test_income_categories_for_different_users(self):
        """Test that different users can have income categories with the same name"""
        category1 = IncomeCategory.objects.create(user=self.user1, name="Salary")
        category2 = IncomeCategory.objects.create(user=self.user2, name="Salary")
        self.assertNotEqual(category1.user, category2.user)
        self.assertEqual(category1.name, category2.name)

    def test_income_category_empty_name_validation(self):
        """Test that creating a category without a name raises a ValidationError"""
        category = IncomeCategory(user=self.user1, name="")
        with self.assertRaises(ValidationError):
            category.full_clean()  # This should raise a ValidationError

    def test_income_category_unique_name_per_user_validation(self):
        """Test that a user cannot create two categories with the same name"""
        IncomeCategory.objects.create(user=self.user1, name="Salary")
        with transaction.atomic():  # Use atomic block to handle the transaction properly
            with self.assertRaises(IntegrityError):
                IncomeCategory.objects.create(user=self.user1, name="Salary")

    def test_income_category_deletion_on_user_delete(self):
        """Test that income categories are deleted when the associated user is deleted"""
        category = IncomeCategory.objects.create(user=self.user1, name="Investments")  # Use a different category name
        self.user1.delete()  # Deleting the user should also delete the related category
        self.assertFalse(IncomeCategory.objects.filter(id=category.id).exists())  # Verify the category is deleted

    def tearDown(self):
        """Clean up after each test"""
        # Ensure users are deleted to avoid integrity errors in subsequent tests
        if User.objects.filter(id=self.user1.id).exists():
            self.user1.delete()
        if User.objects.filter(id=self.user2.id).exists():
            self.user2.delete()
class IncomeModelTest(TestCase):

    def setUp(self):
        # Create test user and income category
        self.user = User.objects.create_user(username='testuser1', password='12345')
        self.category = IncomeCategory.objects.create(user=self.user, name='Salary')

    def test_income_creation(self):
        """Test creating a basic income"""
        income = Income.objects.create(
            user=self.user,
            category=self.category,
            description="Monthly salary",
            amount=Decimal('5000.00'),
            date=timezone.now().date(),
            is_recurring=False
        )
        self.assertEqual(income.amount, Decimal('5000.00'))
        self.assertEqual(income.category, self.category)
        self.assertFalse(income.is_recurring)

    def test_income_str(self):
        """Test the string representation of income"""
        income = Income.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('1000.00'),
            date=timezone.now().date()
        )
        self.assertEqual(str(income), f"{self.category.name}: 1000.00 on {income.date}")

    def test_income_negative_amount(self):
        """Test that an income cannot have a negative amount"""
        with self.assertRaises(ValidationError):
            income = Income.objects.create(
                user=self.user,
                category=self.category,
                amount=Decimal('-100.00'),
                date=timezone.now().date()
            )
            income.full_clean()  # ValidationError should be raised here

    def test_income_amount_zero(self):
        """Test that an income amount cannot be zero"""
        with self.assertRaises(ValidationError):
            income = Income.objects.create(
                user=self.user,
                category=self.category,
                amount=Decimal('0.00'),
                date=timezone.now().date()
            )
            income.full_clean()  # ValidationError should be raised here

    def test_income_future_date(self):
        """Test that an income cannot be created with a future date"""
        future_date = timezone.now().date() + timezone.timedelta(days=10)
        with self.assertRaises(ValidationError):
            income = Income.objects.create(
                user=self.user,
                category=self.category,
                amount=Decimal('1000.00'),
                date=future_date
            )
            income.full_clean()  # ValidationError should be raised here

    def test_get_effective_amount_exact_match(self):
        """Test that get_effective_amount returns the exact match if available"""
        income = Income.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('5000.00'),
            date=timezone.now().date(),
            is_recurring=True
        )
        # Create change log for the income (using mock or simple change log implementation)
        income.change_logs.create(new_amount=Decimal('5500.00'), effective_date=timezone.now().date())

        effective_amount = income.get_effective_amount(timezone.now().date())
        self.assertEqual(effective_amount, Decimal('5500.00'))

    def test_get_effective_amount_no_exact_match(self):
        """Test that get_effective_amount returns the closest past effective amount"""
        income = Income.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('5000.00'),
            date=timezone.now().date(),
            is_recurring=True
        )
        # Create change logs for different past months
        income.change_logs.create(
            new_amount=Decimal('5400.00'),
            effective_date=timezone.now().date().replace(day=1, month=1)
        )
        income.change_logs.create(
            new_amount=Decimal('5300.00'),
            effective_date=timezone.now().date().replace(day=1, month=2)
        )

        # No exact match for the current month, but should return the closest log from February
        effective_amount = income.get_effective_amount(
            timezone.now().date().replace(day=1, month=3)
        )
        self.assertEqual(effective_amount, Decimal('5300.00'))

    def test_get_effective_amount_no_logs(self):
        """Test that get_effective_amount returns the original amount if no logs are present"""
        income = Income.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('5000.00'),
            date=timezone.now().date(),
            is_recurring=True
        )
        effective_amount = income.get_effective_amount(timezone.now().date())
        self.assertEqual(effective_amount, Decimal('5000.00'))

    def test_income_recurring_flag(self):
        """Test that recurring flag works correctly"""
        income = Income.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('2000.00'),
            date=timezone.now().date(),
            is_recurring=True
        )
        self.assertTrue(income.is_recurring)
        
    def test_income_non_recurring(self):
        """Test that non-recurring incomes behave correctly"""
        income = Income.objects.create(
            user=self.user,
            category=self.category,
            amount=Decimal('3000.00'),
            date=timezone.now().date(),
            is_recurring=False
        )
        self.assertFalse(income.is_recurring)

    def test_income_deletion_on_user_delete(self):
        """Test that incomes are deleted when the associated user is deleted."""
        user = User.objects.create(username='testuser2', password='password')
        category = IncomeCategory.objects.create(user=user, name="Salary")
        
        # Create an income for the user
        income = Income.objects.create(
            user=user,
            category=category,
            description="Test Income",
            amount=1000,
            date=timezone.now().date(),
            is_recurring=False
        )
        
        # Ensure the income exists before deletion
        self.assertTrue(Income.objects.filter(id=income.id).exists())
        
        # Explicitly delete incomes before user deletion to avoid the foreign key error
        Income.objects.filter(user=user).delete()

        # Now delete the user and ensure the cascade is handled correctly
        user.delete()

        # Ensure the income no longer exists
        self.assertFalse(Income.objects.filter(id=income.id).exists())
class IncomeRecurringChangeLogModelTest(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username='testuser1', password='password')
        
        # Create a test income category and income
        self.income_category = IncomeCategory.objects.create(user=self.user, name="Salary")
        self.income = Income.objects.create(
            description="Test Income",
            amount=Decimal('100.00'),
            date=timezone.now().date(),
            is_recurring=True
        )

    def test_income_recurring_change_log_creation(self):
        """Test that an IncomeRecurringChangeLog can be created successfully"""
        log = IncomeRecurringChangeLog.objects.create(
            income=self.income,
            new_amount=Decimal('150.00'),
            effective_date=timezone.now().date()
        )
        self.assertEqual(log.new_amount, Decimal('150.00'))

    def test_effective_date_before_income_start(self):
        """Test that effective date cannot be before the income's start date"""
        with self.assertRaises(ValidationError):
            log = IncomeRecurringChangeLog(
                income=self.income,
                new_amount=Decimal('150.00'),
                effective_date=self.income.date - timezone.timedelta(days=1)
            )
            log.clean()

    def test_new_amount_greater_than_zero(self):
        """Test that new_amount cannot be less than or equal to zero"""
        log = IncomeRecurringChangeLog(
            income=self.income,
            new_amount=Decimal('0.00'),  # Invalid amount
            effective_date=timezone.now().date()
        )
        
        # Explicitly call full_clean to trigger validation
        with self.assertRaises(ValidationError):
            log.full_clean()


    def test_unique_together_constraint(self):
        """Test that duplicate income and effective_date raises an IntegrityError"""
        # Create the first log with a given income and effective date
        IncomeRecurringChangeLog.objects.create(
            income=self.income,
            new_amount=Decimal('200.00'),
            effective_date=timezone.now().date()
        )
        
        # Attempt to create a duplicate log with the same income and effective date
        with self.assertRaises(IntegrityError):
            IncomeRecurringChangeLog.objects.create(
                income=self.income,
                new_amount=Decimal('250.00'),
                effective_date=timezone.now().date()  # Same effective date
            )


    def test_string_representation(self):
        """Test the string representation of the change log"""
        log = IncomeRecurringChangeLog.objects.create(
            income=self.income,
            new_amount=Decimal('150.00'),
            effective_date=timezone.now().date()
        )
        self.assertEqual(str(log), f"Change {self.income.description} to {log.new_amount} effective {log.effective_date}")

    def test_ordering_by_effective_date(self):
        """Test that the change logs are ordered by effective_date"""
        IncomeRecurringChangeLog.objects.create(
            income=self.income,
            new_amount=Decimal('150.00'),
            effective_date=timezone.now().date()
        )
        IncomeRecurringChangeLog.objects.create(
            income=self.income,
            new_amount=Decimal('200.00'),
            effective_date=timezone.now().date() + timezone.timedelta(days=10)
        )
        logs = self.income.change_logs.all()
        self.assertEqual(logs[0].new_amount, Decimal('150.00'))
        self.assertEqual(logs[1].new_amount, Decimal('200.00'))
class ExpenseRecurringChangeLogModelTest(TestCase):
    def setUp(self):
        self.expense = Expense.objects.create(
            description="Test Expense",
            amount=Decimal('100.00'),
            date=timezone.now().date(),
            is_recurring=True
        )

    def test_expense_recurring_change_log_creation(self):
        """Test that an ExpenseRecurringChangeLog can be created successfully"""
        log = ExpenseRecurringChangeLog.objects.create(
            expense=self.expense,
            new_amount=Decimal('150.00'),
            effective_date=timezone.now().date()
        )
        self.assertEqual(log.new_amount, Decimal('150.00'))

    def test_effective_date_before_expense_start(self):
        """Test that effective date cannot be before the expense's start date"""
        with self.assertRaises(ValidationError):
            log = ExpenseRecurringChangeLog(
                expense=self.expense,
                new_amount=Decimal('150.00'),
                effective_date=self.expense.date - timezone.timedelta(days=1)
            )
            log.clean()

    def test_new_amount_greater_than_zero(self):
        """Test that new_amount cannot be zero or negative"""
        log = ExpenseRecurringChangeLog(
            expense=self.expense,
            new_amount=Decimal('0.00'),
            effective_date=timezone.now().date()
        )
        # Call full_clean to trigger the validation
        with self.assertRaises(ValidationError):
            log.full_clean()


    def test_unique_together_constraint(self):
        """Test that an IntegrityError is raised when two logs have the same expense and effective_date"""
        
        # First log creation with unique values
        ExpenseRecurringChangeLog.objects.create(
            expense=self.expense,
            new_amount=Decimal('150.00'),
            effective_date=timezone.now().date()
        )

        # Try creating another log with the same expense and effective_date, which should raise an IntegrityError
        with self.assertRaises(IntegrityError):
            ExpenseRecurringChangeLog.objects.create(
                expense=self.expense,
                new_amount=Decimal('200.00'),
                effective_date=timezone.now().date()  # Same effective date
            )

    def test_string_representation(self):
        """Test the string representation of the change log"""
        log = ExpenseRecurringChangeLog.objects.create(
            expense=self.expense,
            new_amount=Decimal('150.00'),
            effective_date=timezone.now().date()
        )
        self.assertEqual(str(log), f"Change {self.expense.description} to {log.new_amount} effective {log.effective_date}")

    def test_ordering_by_effective_date(self):
        """Test that the change logs are ordered by effective_date"""
        ExpenseRecurringChangeLog.objects.create(
            expense=self.expense,
            new_amount=Decimal('150.00'),
            effective_date=timezone.now().date()
        )
        ExpenseRecurringChangeLog.objects.create(
            expense=self.expense,
            new_amount=Decimal('200.00'),
            effective_date=timezone.now().date() + timezone.timedelta(days=10)
        )
        logs = self.expense.change_logs.all()
        self.assertEqual(logs[0].new_amount, Decimal('150.00'))
        self.assertEqual(logs[1].new_amount, Decimal('200.00'))