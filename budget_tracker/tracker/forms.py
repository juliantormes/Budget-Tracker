from django import forms
from django.utils.timezone import localtime, now
from .models import Expense, Income , ExpenseCategory, IncomeCategory
class ExpenseCategoryForm(forms.ModelForm):
    class Meta:
        model = ExpenseCategory
        fields = ['name']
class ExpenseForm(forms.ModelForm):
    class Meta:
        model = Expense
        fields = ['expense_category', 'description', 'amount', 'date']
    
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user')  # Get the user passed from the view
        super(ExpenseForm, self).__init__(*args, **kwargs)
        self.fields['expense_category'].queryset = ExpenseCategory.objects.filter(user=user)  # Filter the queryset
class IncomeCategoryForm(forms.ModelForm):
    class Meta:
        model = IncomeCategory
        fields = ['name']
class IncomeForm(forms.ModelForm):
    class Meta:
        model = Income
        fields = ['income_category', 'description', 'amount', 'date']
    
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user')  # Get the user passed from the view
        super(IncomeForm, self).__init__(*args, **kwargs)
        self.fields['income_category'].queryset = IncomeCategory.objects.filter(user=user)  # Filter the queryset