from django import forms
from django.utils import timezone
from .models import Expense, Income, ExpenseCategory, IncomeCategory, CreditCard
from django.core.validators import MinValueValidator
from dateutil.relativedelta import relativedelta
from decimal import Decimal
class ExpenseCategoryForm(forms.ModelForm):
    class Meta:
        model = ExpenseCategory
        fields = ['name']

class ExpenseForm(forms.ModelForm):
    using_credit_card = forms.BooleanField(required=False, label='Paying with a credit card?')
    amount = forms.DecimalField(validators=[MinValueValidator(0.01)], help_text='Enter a positive amount.')
    is_recurring = forms.BooleanField(required=False, label='Is recurring monthly? (e.g., subscription fees, salary).')

    class Meta:
        model = Expense
        fields = ['category', 'description', 'amount', 'date', 'credit_card', 'installments', 'surcharge', 'is_recurring']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        self.fields['category'].queryset = ExpenseCategory.objects.filter(user=user)
        self.fields['credit_card'].queryset = CreditCard.objects.filter(user=user)
        self.fields['date'].initial = timezone.now().date()
        if self.instance.pk:
            self.fields['using_credit_card'].initial = self.instance.credit_card is not None
        self.fields['credit_card'].required = False
        self.fields['installments'].required = False
        self.fields['surcharge'].required = False

    def clean(self):
        cleaned_data = super().clean()
        is_recurring = cleaned_data.get("is_recurring")
        credit_card = cleaned_data.get("credit_card")
        installments = cleaned_data.get("installments")
        using_credit_card = cleaned_data.get("using_credit_card", False)

        if using_credit_card:
            if not credit_card:
                self.add_error('credit_card', 'This field is required when paying with a credit card.')
            if not installments:
                self.add_error('installments', 'This field is required when paying with a credit card.')
            if is_recurring and installments and installments > 1:
                raise forms.ValidationError("Recurring expenses with installments are not supported for credit card payments.")
        return cleaned_data

    def save(self, commit=True):
        expense = super().save(commit=False)
        if expense.is_recurring and expense.credit_card and expense.installments:
            P = expense.amount
            R = Decimal(expense.surcharge) / Decimal(100)
            T = Decimal(expense.installments) / Decimal(12)
            SI = P * R * T
            total_amount = P + SI
            expense.amount = total_amount

        if expense.is_recurring and expense.credit_card and expense.installments:
            expense.end_date = expense.date + relativedelta(months=expense.installments-1)
        
        if commit:
            expense.save()
        return expense

class IncomeCategoryForm(forms.ModelForm):
    class Meta:
        model = IncomeCategory
        fields = ['name']

class IncomeForm(forms.ModelForm):
    is_recurring = forms.BooleanField(required=False, label='Is recurring monthly? (e.g., subscription fees, salary).')

    class Meta:
        model = Income
        fields = ['category', 'description', 'amount', 'date', 'is_recurring']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user')
        super().__init__(*args, **kwargs)
        self.fields['category'].queryset = IncomeCategory.objects.filter(user=user)
        self.fields['date'].initial = timezone.now().date()

class CreditCardForm(forms.ModelForm):
    expire_date = forms.DateField(
        input_formats=['%m/%y'], 
        widget=forms.DateInput(format='%m/%y', attrs={'placeholder': 'MM/YY'})
    )
    payment_day = forms.IntegerField(min_value=1, max_value=31, help_text='The day of the month the bill is due')
    close_card_day = forms.IntegerField(min_value=1, max_value=31, help_text='The day of the month the card is closed')

    class Meta:
        model = CreditCard
        fields = ['last_four_digits', 'brand', 'expire_date', 'credit_limit', 'payment_day', 'close_card_day']