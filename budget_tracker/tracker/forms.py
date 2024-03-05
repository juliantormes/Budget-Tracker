from django import forms
from .models import Expense, Income , ExpensesCategory, IncomesCategory

class ExpenseForm(forms.ModelForm):
    class Meta:
        model = Expense
        fields = ['expense_category', 'description', 'amount', 'date']  # Update the field name here
class ExpensesCategoryForm(forms.ModelForm):
    class Meta:
        model = ExpensesCategory
        fields = ['name']

class IncomeCategoryForm(forms.ModelForm):
    class Meta:
        model = IncomesCategory
        fields = ['name']

class IncomeForm(forms.ModelForm):
    class Meta:
        model = Income
        fields = ['income_category','description', 'amount', 'date']

