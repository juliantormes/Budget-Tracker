from django import forms
from .models import Expense, Income , ExpenseCategory, IncomeCategory

class ExpenseForm(forms.ModelForm):
    class Meta:
        model = Expense
        fields = ['expense_category', 'description', 'amount', 'date']  # Update the field name here
class ExpenseCategoryForm(forms.ModelForm):
    class Meta:
        model = ExpenseCategory
        fields = ['name']

class IncomeCategoryForm(forms.ModelForm):
    class Meta:
        model = IncomeCategory
        fields = ['name']

class IncomeForm(forms.ModelForm):
    class Meta:
        model = Income
        fields = ['income_category','description', 'amount', 'date']

