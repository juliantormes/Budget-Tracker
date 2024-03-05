from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Sum
from django.contrib import messages
from django.urls import reverse_lazy
from django.views.generic.edit import DeleteView
from .models import Expense, ExpensesCategory, IncomesCategory, Income
from .forms import ExpenseForm, IncomeForm, ExpensesCategoryForm, IncomeCategoryForm

def expense_list(request):
    expenses = Expense.objects.all()
    return render(request, 'tracker/expense_list.html', {'expenses': expenses})

def expenses_categories_list(request):
    categories = ExpensesCategory.objects.all()
    return render(request, 'tracker/expenses_categories_list.html', {'categories': categories})


def income_list(request):
    incomes = Income.objects.all()
    return render(request, 'tracker/income_list.html', {'incomes': incomes})

def incomes_categories_list(request):
    categories = IncomesCategory.objects.all()
    return render(request, 'tracker/incomes_categories_list.html', {'categories': categories})

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

def edit_expense_category(request, category_id):
    category = get_object_or_404(ExpensesCategory, pk=category_id)
    if request.method == "POST":
        form = ExpensesCategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, "Expense category updated successfully!")
            return redirect('view_where_categories_are_listed')
    else:
        form = ExpensesCategoryForm(instance=category)
    return render(request, "tracker/edit_expense_category.html", {"form": form})
class DeleteExpenseCategory(DeleteView):
    model = ExpensesCategory
    success_url = reverse_lazy('expenses_categories_list')  # Redirect to the list of categories
    template_name = 'tracker/confirm_delete_expense_category.html'  # Confirmation template



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
            return redirect('home')
    else:
        form = IncomeCategoryForm()
    return render(request, 'tracker/add_category.html', {'form': form, 'type': 'Income'})

def edit_income_category(request, category_id):
    category = get_object_or_404(IncomesCategory, pk=category_id)
    if request.method == "POST":
        form = IncomeCategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, "Income category updated successfully!")
            return redirect('view_where_categories_are_listed')
    else:
        form = IncomeCategoryForm(instance=category)
    return render(request, "tracker/edit_income_category.html", {"form": form})

from .models import IncomesCategory

class DeleteIncomeCategory(DeleteView):
    model = IncomesCategory
    success_url = reverse_lazy('incomes_categories_list')  # Adjust as needed
    template_name = 'tracker/confirm_delete_income_category.html'  # Confirmation template

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


def edit_income(request, income_id):
    incomes = get_object_or_404(Income, pk=income_id)
    if request.method == "POST":
        form = IncomeForm(request.POST, instance=incomes)
        if form.is_valid():
            form.save()
            messages.success(request, "Income updated successfully!")
            return redirect("income_list")
    else:
        form = IncomeForm(instance=incomes)
    return render(request, "tracker/edit_income.html", {"form": form})

def delete_income(request, income_id):
    incomes = get_object_or_404(Income, pk=income_id)
    if request.method == "POST":
        incomes.delete()
        messages.success(request, "Income deleted successfully!")
        return redirect("income_list")
    return render(request, "tracker/confirm_delete_income.html", {"income": incomes})


def home(request):
    total_expenses = Expense.objects.all().aggregate(Sum('amount'))['amount__sum'] or 0
    expense_categories = ExpensesCategory.objects.annotate(total_expense=Sum('expenses__amount'))
    
    total_incomes = Income.objects.all().aggregate(Sum('amount'))['amount__sum'] or 0
    income_categories = IncomesCategory.objects.annotate(total_incomes=Sum('incomes__amount'))

    context = {
        'total_expenses': total_expenses,
        'total_incomes': total_incomes,
        'expense_categories': expense_categories,  
        'income_categories': income_categories,
        'net': total_incomes - total_expenses,
    }
    return render(request, 'tracker/home.html', context)
