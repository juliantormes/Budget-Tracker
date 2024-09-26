import django
django.setup()
from django.test import TestCase
from tracker.forms import IncomeCategoryForm, ExpenseCategoryForm
from tracker.models import IncomeCategory, ExpenseCategory

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