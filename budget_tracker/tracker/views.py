from django.shortcuts import render
from .models import Expense
from django.http import HttpResponse

def expense_list(request):
    expenses = Expense.objects.all()
    return render(request, 'tracker/expense_list.html', {'expenses': expenses})
