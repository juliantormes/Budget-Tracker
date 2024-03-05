from django.db import models

class ExpensesCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Expense(models.Model):
    expense_category = models.ForeignKey(ExpensesCategory, related_name='expenses', on_delete=models.SET_NULL, null=True)
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    def __str__(self):
        return f"{self.expense_category.name}: {self.amount} on {self.date}"


class IncomesCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name    
class Income(models.Model):
    income_category = models.ForeignKey(IncomesCategory, related_name='incomes', on_delete=models.SET_NULL, null=True)
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    def __str__(self):
        return f"{self.income_category.name}: {self.amount} on {self.date}"


