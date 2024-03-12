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
    def update_amount(self, new_amount):
        if self.is_recurring:
            ExpenseChangeLog.objects.create(
                expense=self,
                previous_amount=self.amount,
                new_amount=new_amount
            )
            self.amount = new_amount
            self.save()

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
