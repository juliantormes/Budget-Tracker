from django.contrib import admin
from .models import ExpenseCategory, IncomeCategory, Expense, Income

admin.site.register(ExpenseCategory)
admin.site.register(IncomeCategory)
admin.site.register(Expense)
admin.site.register(Income)
