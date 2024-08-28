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
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2)
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

        non_recurring_expenses = self.expenses.filter(is_recurring=False)
        for expense in non_recurring_expenses:
            total_balance += expense.amount + (expense.amount * expense.surcharge / 100)

        recurring_expenses = self.expenses.filter(is_recurring=True)
        for expense in recurring_expenses:
            if expense.date <= now_date:
                total_payment = expense.amount + (expense.amount * expense.surcharge / 100)
                total_balance += total_payment / expense.installments if expense.installments else total_payment

        return total_balance

    def available_credit(self):
        """Calculate available credit, factoring in surcharges and installments."""
        return round(self.credit_limit - self.current_balance(), 2)

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
    installments = models.IntegerField(default=1)
    surcharge = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        if not self.pay_with_credit_card:
            self.credit_card = None
            self.installments = 1
            self.surcharge = Decimal('0.00')
        else:
            if self.credit_card:
                current_balance = self.credit_card.current_balance()
                total_new_expense = self.amount + (self.amount * self.surcharge / 100)
                if current_balance + total_new_expense > self.credit_card.credit_limit:
                    raise ValidationError(
                        f"Credit limit exceeded. Current balance: {current_balance}, "
                        f"New expense total: {total_new_expense}, Credit limit: {self.credit_card.credit_limit}. "
                        f"Available credit: {self.credit_card.available_credit()}."
                    )
        super().save(*args, **kwargs)
    def get_effective_amount(expense, check_date=None):
        if check_date is None:
            check_date = date.today()
        
        # Fetch the latest change log before or on the check_date
        change_log = ExpenseRecurringChangeLog.objects.filter(
            expense=expense, effective_date__lte=check_date
        ).order_by('-effective_date').first()
        
        if change_log:
            return change_log.new_amount
        return expense.amount

    def __str__(self):
        return f"{self.category.name}: {self.amount} on {self.date}"

class IncomeCategory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Income(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(IncomeCategory, related_name='incomes', on_delete=models.CASCADE, null=True)
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    is_recurring = models.BooleanField(default=False)
    def get_effective_amount(self, check_date=None):
        if check_date is None:
            check_date = date.today()
        
        # Use the correct related name for the reverse relationship
        change_log = self.change_logs.filter(
            effective_date__lte=check_date
        ).order_by('-effective_date').first()
        
        if change_log:
            return change_log.new_amount
        return self.amount
    

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