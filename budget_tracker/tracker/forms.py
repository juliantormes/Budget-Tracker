from django import forms
from django.utils.timezone import localtime, now
from .models import Expense, Income , ExpenseCategory, IncomeCategory

class ExpenseForm(forms.ModelForm):
    date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}), initial=localtime(now()).date())
    class Meta:
        model = Expense
        fields = ['expense_category', 'description', 'amount', 'date']
class ExpenseCategoryForm(forms.ModelForm):
    class Meta:
        model = ExpenseCategory
        fields = ['name']

class IncomeCategoryForm(forms.ModelForm):
    class Meta:
        model = IncomeCategory
        fields = ['name']

class IncomeForm(forms.ModelForm):
    date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}), initial=localtime(now()).date())
    class Meta:
        model = Income
        fields = ['income_category','description', 'amount', 'date']

