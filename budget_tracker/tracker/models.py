from django.db import models
from django.conf import settings
from dateutil.relativedelta import relativedelta
from decimal import Decimal
from django.utils import timezone

class ExpenseCategory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
class CreditCard(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    last_four_digits = models.CharField(max_length=4)
    brand = models.CharField(max_length=50)
    expire_date = models.DateField()
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2)
    payment_day = models.IntegerField()
    close_card_day = models.IntegerField(default=21)
    def calculate_total_payment_with_surcharge(self, amount, surcharge_percentage):
        """Calculate total amount including surcharge."""
        P = Decimal(amount)
        S = Decimal(surcharge_percentage) / Decimal(100)
        total_payment = P + (P * S)
        return total_payment

    def current_balance(self):
        """Calculate the current balance, including surcharges and installments."""
        now_date = timezone.now().date()
        total_balance = Decimal('0')

        # Non-recurring expenses
        non_recurring_expenses = self.expenses.filter(is_recurring=False)
        for expense in non_recurring_expenses:
            total_balance += self.calculate_total_payment_with_surcharge(expense.amount, expense.surcharge)

        # Recurring expenses
        recurring_expenses = self.expenses.filter(is_recurring=True)
        for expense in recurring_expenses:
            # Assuming you want to count only expenses for the current month or past, not future
            if expense.date <= now_date:
                total_payment = self.calculate_total_payment_with_surcharge(expense.amount, expense.surcharge)
                # Here you might want to divide by installments if you are spreading the surcharge over each installment
                total_balance += total_payment / expense.installments if expense.installments else total_payment

        return total_balance

    def available_credit(self):
        """Calculate available credit, factoring in surcharges and installments."""
        # This might need adjustment based on how you account for future installments
        return self.credit_limit - self.current_balance()

    def __str__(self):
        return f"{self.brand} ending in {self.last_four_digits}"
class Expense(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    expense_category = models.ForeignKey(ExpenseCategory, related_name='expense', on_delete=models.CASCADE, null=True)
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_recurring = models.BooleanField(default=False)
    credit_card = models.ForeignKey(CreditCard, related_name='expenses', on_delete=models.CASCADE, null=True)
    installments = models.IntegerField(default=1)
    surcharge = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Percentage
    def update_amount(self, new_amount):
        if self.is_recurring:
            ExpenseChangeLog.objects.create(
                expense=self,
                previous_amount=self.amount,
                new_amount=new_amount
            )
            self.amount = new_amount
            self.save()
    def save(self, *args, **kwargs):
        if self.is_recurring and self.credit_card and self.installments:
            self.end_date = self.date + relativedelta(months=self.installments-1)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.expense_category.name}: {self.amount} on {self.date}"


class IncomeCategory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name    
class Income(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    income_category = models.ForeignKey(IncomeCategory, related_name='income', on_delete=models.CASCADE, null=True)
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    is_recurring = models.BooleanField(default=False)
    def update_amount(self, new_amount):
        if self.is_recurring:
            IncomeChangeLog.objects.create(
                income=self,
                previous_amount=self.amount,
                new_amount=new_amount
            )
            self.amount = new_amount
            self.save()

    def __str__(self):
        return f"{self.income_category.name}: {self.amount} on {self.date}"
class ExpenseChangeLog(models.Model):
    expense = models.ForeignKey('Expense', on_delete=models.CASCADE, related_name='change_logs')
    previous_amount = models.DecimalField(max_digits=10, decimal_places=2)
    new_amount = models.DecimalField(max_digits=10, decimal_places=2)
    change_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Change for {self.expense.expense_category.name} on {self.change_date}: {self.previous_amount} to {self.new_amount}"

class IncomeChangeLog(models.Model):
    income = models.ForeignKey('Income', on_delete=models.CASCADE, related_name='change_logs')
    previous_amount = models.DecimalField(max_digits=10, decimal_places=2)
    new_amount = models.DecimalField(max_digits=10, decimal_places=2)
    change_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Change for {self.income.income_category.name} on {self.change_date}: {self.previous_amount} to {self.new_amount}"
