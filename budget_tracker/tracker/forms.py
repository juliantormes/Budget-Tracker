from django import forms
from django.utils import timezone
from .models import Expense, Income , ExpenseCategory, IncomeCategory, CreditCard
from django.core.validators import MinValueValidator
from dateutil.relativedelta import relativedelta
from datetime import timedelta
from decimal import Decimal
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
        fields = ['expense_category', 'description', 'amount', 'date', 'credit_card', 'installments', 'surcharge', 'is_recurring']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
        }
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        display_credit_card_fields = kwargs.pop('display_credit_card_fields', False)
        super(ExpenseForm, self).__init__(*args, **kwargs)
        self.fields['expense_category'].queryset = ExpenseCategory.objects.filter(user=user)
        self.fields['credit_card'].queryset = CreditCard.objects.filter(user=user)
        
        # Set today's date as the default for the date field
        self.fields['date'].initial = timezone.now().date()

        # Initialize the using_credit_card checkbox
        if self.instance.pk:  # Check if the form is bound to an existing instance
            self.fields['using_credit_card'].initial = self.instance.credit_card is not None
        
        # Set credit card related fields as not required and initially hidden
        self.fields['credit_card'].required = False
        self.fields['installments'].required = False
        self.fields['surcharge'].required = False
    def clean(self):
        cleaned_data = super().clean()
        is_recurring = cleaned_data.get("is_recurring")
        credit_card = cleaned_data.get("credit_card")
        installments = cleaned_data.get("installments")

        if is_recurring and credit_card and installments and installments > 1:
            raise forms.ValidationError("Recurring expenses with installments are not supported for credit card payments.")
        if not credit_card:
            self.add_error('credit_card', 'This field is required.')
        if not installments:
            self.add_error('installments', 'This field is required.')
        # Check if the expense is a recurring credit card payment with installments
        
        return cleaned_data
    def save(self, commit=True):
        expense = super().save(commit=False)
        if expense.is_recurring and expense.credit_card and expense.installments:
                # Assuming amount is a Decimal
                P = expense.amount
                # Convert R to Decimal
                R = Decimal(expense.surcharge) / Decimal(100)
                # Convert T to Decimal, assuming installments is an integer
                T = Decimal(expense.installments) / Decimal(12)
                # Calculate simple interest
                SI = P * R * T
                # Calculate total amount to be paid
                total_amount = P + SI
                expense.amount = total_amount  # Ensure amount can handle Decimal
                
                if commit:
                    expense.save()

        # Check if the expense is a recurring credit card payment with installments
        if expense.is_recurring and expense.credit_card and expense.installments:
            # Calculate end_date based on the number of installments
            expense.end_date = expense.date + relativedelta(months=expense.installments-1)
    
        if commit:
            expense.save()
        return expense
    
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
    close_card_day = forms.IntegerField(min_value=1, max_value=31, help_text= 'The day of the month the card is closed')
    
    class Meta:
        model = CreditCard
        fields = ['last_four_digits', 'brand', 'expire_date', 'credit_limit', 'payment_day']