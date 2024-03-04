from django.shortcuts import render, redirect
from django.db.models import Sum
from .models import Expense, Category
from .forms import ExpenseForm, CategoryForm

def expense_list(request):
    expenses = Expense.objects.all()
    return render(request, 'tracker/expense_list.html', {'expenses': expenses})

def add_expense(request):
    if request.method == 'POST':
        form = ExpenseForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('expense_list')  # Redirect to the expense list view after saving
    else:
        form = ExpenseForm()  # An empty form instance for GET request

    return render(request, 'tracker/add_expense.html', {'form': form})

def add_category(request):
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('expense_list')  # Adjust as needed
    else:
        form = CategoryForm()
    return render(request, 'tracker/add_category.html', {'form': form})

def home(request):
    total_expenses = Expense.objects.all().aggregate(Sum('amount'))['amount__sum'] or 0
    categories = Category.objects.annotate(total_expense=Sum('expenses__amount'))
    
    total_income = 0  # Assuming you don't have an Income model; adjust as needed

    context = {
        'total_expenses': total_expenses,
        'total_income': total_income,
        'categories': categories,
        'net': total_income - total_expenses,
    }
    return render(request, 'tracker/home.html', context)


