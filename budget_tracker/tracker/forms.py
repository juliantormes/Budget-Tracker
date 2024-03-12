from django import forms
from django.utils import timezone
from .models import Expense, Income , ExpenseCategory, IncomeCategory, CreditCard
from django.core.validators import MinValueValidator
class ExpenseCategoryForm(forms.ModelForm):
    class Meta:
        model = ExpenseCategory
        fields = ['name']
class ExpenseForm(forms.ModelForm):
    using_credit_card = forms.BooleanField(required=False, label='Paying with a credit card?')
    amount = forms.DecimalField(validators=[MinValueValidator(0.01)], help_text='Enter a positive amount.')
    is_recurring= forms.BooleanField(required=False,label= 'Is recurring monthly? (e.g., subscription fees, salary).')
    class Meta:
        model = Expense
        fields = ['expense_category', 'description', 'amount', 'date', 'credit_card', 'installments', 'interest_rate', 'is_recurring']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
        }
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super(ExpenseForm, self).__init__(*args, **kwargs)
        self.fields['expense_category'].queryset = ExpenseCategory.objects.filter(user=user)
        self.fields['credit_card'].queryset = CreditCard.objects.filter(user=user)
        
        # Set today's date as the default for the date field
        self.fields['date'].initial = timezone.now().date()
        
        # Set credit card related fields as not required and initially hidden
        self.fields['credit_card'].required = False
        self.fields['installments'].required = False
        self.fields['interest_rate'].required = False
class IncomeCategoryForm(forms.ModelForm):
    class Meta:
        model = IncomeCategory
        fields = ['name']
class IncomeForm(forms.ModelForm):
    is_recurring= forms.BooleanField(required=False,label= 'Is recurring monthly? (e.g., subscription fees, salary).')
    class Meta:
        model = Income
        fields = ['income_category', 'description', 'amount', 'date', 'is_recurring']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
        }
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user')  # Get the user passed from the view
        super(IncomeForm, self).__init__(*args, **kwargs)
        self.fields['income_category'].queryset = IncomeCategory.objects.filter(user=user)  # Filter the queryset
        self.fields['date'].initial = timezone.now().date()  # Set today's date as the default for the date field
class CreditCardForm(forms.ModelForm):
    expire_date = forms.DateField(
        input_formats=['%m/%y'], 
        widget=forms.DateInput(format='%m/%y', attrs={'placeholder': 'MM/YY'})
    )
    payment_day = forms.IntegerField(min_value=1, max_value=31, help_text= 'The day of the month the bill is due')
    
    class Meta:
        model = CreditCard
        fields = ['last_four_digits', 'brand', 'expire_date', 'credit_limit', 'payment_day']