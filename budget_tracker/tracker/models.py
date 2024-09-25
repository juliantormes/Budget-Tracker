from django.db import models
from django.conf import settings
from decimal import Decimal
from django.utils import timezone
from .utils import calculate_total_payment_with_surcharge
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.core.exceptions import ValidationError
from datetime import date
class ExpenseCategory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_category_per_user')
        ]

    def __str__(self):
        return self.name

class CreditCard(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    last_four_digits = models.CharField(
        max_length=4,
        validators=[
            RegexValidator(
                regex=r'^\d{4}$',
                message='Last four digits must be exactly 4 digits'
            )
        ]
    )
    brand = models.CharField(max_length=50)
    expire_date = models.DateField()
    credit_limit = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.00'))]  # Add this to enforce non-negative values
    )
    payment_day = models.IntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(31)
        ]
    )
    close_card_day = models.IntegerField(
        default=21,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(31)
        ]
    )

    def current_balance(self):
        """Calculate the current balance, including surcharges and installments."""
        now_date = timezone.now().date()
        total_balance = Decimal('0')

        # Non-recurring expenses
        non_recurring_expenses = self.expenses.filter(is_recurring=False)
        for expense in non_recurring_expenses:
            if expense.pay_with_credit_card:  # Ensure it's a credit card expense
                total_balance += expense.amount + (expense.amount * expense.surcharge / 100)

        # Recurring expenses (only include if they started before or on today)
        recurring_expenses = self.expenses.filter(is_recurring=True)
        for expense in recurring_expenses:
            if expense.date <= now_date and expense.pay_with_credit_card:
                total_payment = expense.amount + (expense.amount * expense.surcharge / 100)
                # Divide the total payment by the number of installments, only add the installment for the current period
                installment_payment = total_payment / expense.installments
                total_balance += installment_payment

        return total_balance


    def available_credit(self):
        """Calculate available credit, factoring in surcharges and installments."""
        return round(Decimal(self.credit_limit) - self.current_balance(), 2)

    def __str__(self):
        return f"{self.brand} ending in {self.last_four_digits}"

class Expense(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(ExpenseCategory, related_name='expenses', on_delete=models.CASCADE, null=True)
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_recurring = models.BooleanField(default=False)
    pay_with_credit_card = models.BooleanField(default=False)
    credit_card = models.ForeignKey(CreditCard, related_name='expenses', on_delete=models.CASCADE, null=True, blank=True)
    installments = models.IntegerField(default=1, validators=[MinValueValidator(1)])  # Ensure at least 1 installment
    surcharge = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    def clean(self):
        if self.date and self.date > timezone.now().date():  # Ensure date is not None
            raise ValidationError("Expenses cannot be created for a future date.")
        if self.amount < 0:
            raise ValidationError("Expense amount cannot be negative.")
        
    def save(self, *args, **kwargs):
        
        if isinstance(self.amount, float):
            self.amount = Decimal(self.amount)

        if isinstance(self.surcharge, float):
            self.surcharge = Decimal(self.surcharge)
        if not self.pay_with_credit_card:
            self.credit_card = None
            self.installments = 1
            self.surcharge = Decimal('0.00')
        else:
            if self.credit_card:
                current_balance = self.credit_card.current_balance()
                total_new_expense = self.amount + (self.amount * Decimal(self.surcharge) / Decimal('100'))  # Ensure Decimal division
                if current_balance + total_new_expense > self.credit_card.credit_limit:
                    raise ValidationError(
                        f"Credit limit exceeded. Current balance: {current_balance}, "
                        f"New expense total: {total_new_expense}, Credit limit: {self.credit_card.credit_limit}. "
                        f"Available credit: {self.credit_card.available_credit()}."
                    )
        super().save(*args, **kwargs)

    def get_effective_amount(self, check_date=None):
        if check_date is None:
            check_date = date.today()
        # Convert check_date to first day of the month for comparison
        start_of_check_month = check_date.replace(day=1)
        
        # Check for an exact match in the same month
        exact_match_log = self.change_logs.filter(
            effective_date__year=check_date.year,
            effective_date__month=check_date.month
        ).first()
        
        if exact_match_log:
            return exact_match_log.new_amount

        # If no exact match, find the closest log with an effective date before the check month
        closest_log = self.change_logs.filter(
            effective_date__lt=start_of_check_month
        ).order_by('-effective_date').first()
        
        # Return the closest log's amount or the original amount
        return closest_log.new_amount if closest_log else self.amount

    def __str__(self):
        return f"{self.category.name}: {self.amount} on {self.date}"

class IncomeCategory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_income_category_per_user')
        ]

    def __str__(self):
        return self.name
class Income(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # This already cascades
    category = models.ForeignKey(IncomeCategory, related_name='incomes', on_delete=models.CASCADE, null=True)  # Add CASCADE here as well
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    date = models.DateField()
    is_recurring = models.BooleanField(default=False)

    def clean(self):
        """Ensure that the date is not in the future."""
        if self.date > timezone.now().date():
            raise ValidationError('Income date cannot be in the future.')

    def get_effective_amount(self, check_date=None):
        if check_date is None:
            check_date = date.today()
        start_of_check_month = check_date.replace(day=1)

        exact_match_log = self.change_logs.filter(
            effective_date__year=check_date.year,
            effective_date__month=check_date.month
        ).first()

        if exact_match_log:
            return exact_match_log.new_amount

        closest_log = self.change_logs.filter(
            effective_date__lt=start_of_check_month
        ).order_by('-effective_date').first()

        return closest_log.new_amount if closest_log else self.amount
    
    def __str__(self):
        return f"{self.category.name}: {self.amount} on {self.date}"

class IncomeRecurringChangeLog(models.Model):
    income = models.ForeignKey(
        Income,
        on_delete=models.CASCADE,
        related_name='change_logs'
    )
    new_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    effective_date = models.DateField()

    class Meta:
        unique_together = ('income', 'effective_date')
        ordering = ['effective_date']

    def __str__(self):
        return f"Change {self.income.description} to {self.new_amount} effective {self.effective_date}"

    def clean(self):
        if self.effective_date < self.income.date:
            raise ValidationError("Effective date cannot be earlier than the start date of the income.")


class ExpenseRecurringChangeLog(models.Model):
    expense = models.ForeignKey(
        Expense,
        on_delete=models.CASCADE,
        related_name='change_logs'
    )
    new_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    effective_date = models.DateField()

    class Meta:
        unique_together = ('expense', 'effective_date')
        ordering = ['effective_date']

    def __str__(self):
        return f"Change {self.expense.description} to {self.new_amount} effective {self.effective_date}"

    def clean(self):
        if self.effective_date < self.expense.date:
            raise ValidationError("Effective date cannot be earlier than the start date of the expense.")