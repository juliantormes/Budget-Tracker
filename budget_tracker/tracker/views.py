from django.shortcuts import render, redirect
from django.db.models import Sum
from django.contrib import messages
from .models import Expense, ExpensesCategory, IncomeCategory, Income
from .forms import ExpenseForm, IncomeForm, ExpensesCategoryForm, IncomeCategoryForm

def expense_list(request):
    expenses = Expense.objects.all()
    return render(request, 'tracker/expense_list.html', {'expenses': expenses})

def income_list(request):
    print('Messages to display:', list(messages.get_messages(request)))
    income = Income.objects.all()
    return render(request, 'tracker/income_list.html', {'income': income})

def add_expenses_category(request):
    if request.method == 'POST':
        form = ExpensesCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Expense category added successfully!')
            return redirect('home')  # Assuming you want to return to the home page
    else:
        form = ExpensesCategoryForm()
    return render(request, 'tracker/add_category.html', {'form': form, 'type': 'Expense'})

def add_expense(request):
    if request.method == 'POST':
        form = ExpenseForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Expense added successfully!')
            return redirect('expense_list')
    else:
        form = ExpenseForm()
    return render(request, 'tracker/add_expense.html', {'form': form})

def add_income_category(request):
    if request.method == 'POST':
        form = IncomeCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Income category added successfully!')
            return redirect('home')
    else:
        form = IncomeCategoryForm()
    return render(request, 'tracker/add_category.html', {'form': form, 'type': 'Income'})

def add_income(request):
    messages.success(request, 'Income added successfully!')
    print('Message added:', messages.get_messages(request))
    if request.method == 'POST':
        form = IncomeForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Income added successfully!')
            return redirect('income_list')
    else:
        form = IncomeForm()
    return render(request, 'tracker/add_income.html', {'form': form})

def home(request):
    total_expenses = Expense.objects.all().aggregate(Sum('amount'))['amount__sum'] or 0
    expense_categories = ExpensesCategory.objects.annotate(total_expense=Sum('expenses__amount'))
    
    total_income = Income.objects.all().aggregate(Sum('amount'))['amount__sum'] or 0
    income_categories = IncomeCategory.objects.annotate(total_income=Sum('income__amount'))

    context = {
        'total_expenses': total_expenses,
        'total_income': total_income,
        'expense_categories': expense_categories,  
        'income_categories': income_categories,
        'net': total_income - total_expenses,
    }
    return render(request, 'tracker/home.html', context)
