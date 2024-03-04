from django.contrib import admin
from .models import ExpensesCategory, IncomeCategory, Expense, Income

admin.site.register(ExpensesCategory)
admin.site.register(IncomeCategory)
admin.site.register(Expense)
admin.site.register(Income)
