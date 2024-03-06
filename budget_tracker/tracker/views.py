from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Sum
from django.contrib import messages
from django.urls import reverse_lazy
from django.views.generic.edit import DeleteView
from .models import Expense, ExpenseCategory, IncomeCategory, Income
from .forms import ExpenseForm, IncomeForm, ExpenseCategoryForm, IncomeCategoryForm

def expense_list(request):
    expenses = Expense.objects.all()
    return render(request, 'tracker/expense_list.html', {'expenses': expenses})

def expense_category_list(request):
    categories = ExpenseCategory.objects.all()
    return render(request, 'tracker/expense_category_list.html', {'categories': categories})


def income_list(request):
    incomes = Income.objects.all()
    return render(request, 'tracker/income_list.html', {'incomes': incomes})

def income_category_list(request):
    categories = IncomeCategory.objects.all()
    return render(request, 'tracker/income_category_list.html', {'categories': categories})

def add_expense_category(request):
    if request.method == 'POST':
        form = ExpenseCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('expense_category_list')
    else:
        form = ExpenseCategoryForm()
    return render(request, 'tracker/add_expense_category.html', {'form': form})

def edit_expense_category(request, category_id):
    category = get_object_or_404(ExpenseCategory, pk=category_id)
    if request.method == "POST":
        form = ExpenseCategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, "Expense category updated successfully!")
            return redirect('expense_category_list')
    else:
        form = ExpenseCategoryForm(instance=category)
    return render(request, "tracker/edit_expense_category.html", {"form": form})
class DeleteExpenseCategory(DeleteView):
    model = ExpenseCategory
    success_url = reverse_lazy('expense_category_list')
    template_name = 'tracker/confirm_delete_expense_category.html'



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

def edit_expense(request, expense_id):
    expense = get_object_or_404(Expense, pk=expense_id)
    if request.method == "POST":
        form = ExpenseForm(request.POST, instance=expense)
        if form.is_valid():
            form.save()
            messages.success(request, "Expense updated successfully!")
            return redirect("expense_list")
    else:
        form = ExpenseForm(instance=expense)
    return render(request, "tracker/edit_expense.html", {"form": form})

def delete_expense(request, expense_id):
    expense = get_object_or_404(Expense, pk=expense_id)
    if request.method == "POST":
        expense.delete()
        messages.success(request, "Expense deleted successfully!")
        return redirect("expense_list")
    return render(request, "tracker/confirm_delete_expense.html", {"expense": expense})

def add_income_category(request):
    if request.method == 'POST':
        form = IncomeCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('income_category_list')
    else:
        form = IncomeCategoryForm()
    return render(request, 'tracker/add_income_category.html', {'form': form})

def edit_income_category(request, category_id):
    category = get_object_or_404(IncomeCategory, pk=category_id)
    if request.method == "POST":
        form = IncomeCategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, "Income category updated successfully!")
            return redirect('income_category_list')
    else:
        form = IncomeCategoryForm(instance=category)
    return render(request, "tracker/edit_income_category.html", {"form": form})

class DeleteIncomeCategory(DeleteView):
    model = IncomeCategory
    success_url = reverse_lazy('income_category_list')  # Adjust as needed
    template_name = 'tracker/confirm_delete_income_category.html'  # Confirmation template

def add_income(request):
    if request.method == 'POST':
        form = IncomeForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Income added successfully!')
            return redirect('income_list')
    else:
        form = IncomeForm()
    return render(request, 'tracker/add_income.html', {'form': form})


def edit_income(request, income_id):
    income = get_object_or_404(Income, pk=income_id)
    if request.method == "POST":
        form = IncomeForm(request.POST, instance=income)
        if form.is_valid():
            form.save()
            messages.success(request, "Income updated successfully!")
            return redirect("income_list")
    else:
        form = IncomeForm(instance=income)
    return render(request, "tracker/edit_income.html", {"form": form})

def delete_income(request, income_id):
    income = get_object_or_404(Income, pk=income_id)
    if request.method == "POST":
        income.delete()
        messages.success(request, "Income deleted successfully!")
        return redirect("income_list")
    return render(request, "tracker/confirm_delete_income.html", {"income": income})


def home(request):
    total_expense = Expense.objects.all().aggregate(Sum('amount'))['amount__sum'] or 0
    expense_category = ExpenseCategory.objects.annotate(total_expense=Sum('expense__amount'))
    
    total_income = Income.objects.all().aggregate(Sum('amount'))['amount__sum'] or 0
    income_category = IncomeCategory.objects.annotate(total_income=Sum('income__amount'))

    context = {
        'total_expenses': total_expense,
        'total_incomes': total_income,
        'expense_category': expense_category,  
        'income_category': income_category,
        'net': total_income - total_expense,
    }
    return render(request, 'tracker/home.html', context)
