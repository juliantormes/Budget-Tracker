from django.contrib import admin
from .models import ExpensesCategory, IncomesCategory, Expense, Income

admin.site.register(ExpensesCategory)
admin.site.register(IncomesCategory)
admin.site.register(Expense)
admin.site.register(Income)
