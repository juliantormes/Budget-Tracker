from django.db import models
from django.conf import settings
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

    def __str__(self):
        return f"{self.brand} ending in {self.last_four_digits}"
class Expense(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    expense_category = models.ForeignKey(ExpenseCategory, related_name='expense', on_delete=models.CASCADE, null=True)
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    is_recurring = models.BooleanField(default=False)
    credit_card = models.ForeignKey(CreditCard, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    installments = models.IntegerField(default=1)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Percentage

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

    def __str__(self):
        return f"{self.income_category.name}: {self.amount} on {self.date}"

class RecurringExpenseChange(models.Model):
    expense = models.ForeignKey(Expense, related_name='amount_changes', on_delete=models.CASCADE, null=True, blank=True)
    change_date = models.DateField()
    new_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.expense} changed to {self.new_amount} on {self.change_date}"

class RecurringIncomeChange(models.Model):
    income = models.ForeignKey('Income', on_delete=models.CASCADE, related_name='changes')
    change_date = models.DateField()
    new_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.income} changed to {self.new_amount} on {self.change_date}"

