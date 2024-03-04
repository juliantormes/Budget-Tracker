from django import forms
from .models import Expense, Category

class ExpenseForm(forms.ModelForm):
    class Meta:
        model = Expense
        fields = ['category', 'description', 'amount', 'date']
class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name']
