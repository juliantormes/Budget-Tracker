from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Sum
from django.contrib import messages
from django.urls import reverse_lazy
from django.views.generic.edit import DeleteView
from .models import Expense, ExpenseCategory, IncomeCategory, Income
from .forms import ExpenseForm, IncomeForm, ExpenseCategoryForm, IncomeCategoryForm
from django.contrib.auth import authenticate, logout as auth_logout, login as auth_login
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            auth_login(request, user)
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'registration/signup.html', {'form': form})

def login(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            auth_login(request, form.get_user())
            return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'registration/login.html', {'form': form})

def logout(request):
    auth_logout(request)
    messages.add_message(request, messages.SUCCESS, 'You have successfully logged out.')
    return redirect('login')

@login_required
def home(request):
    total_expense = Expense.objects.filter(user=request.user).aggregate(Sum('amount'))['amount__sum'] or 0
    expense_categories = ExpenseCategory.objects.filter(user=request.user)
    total_income = Income.objects.filter(user=request.user).aggregate(Sum('amount'))['amount__sum'] or 0
    income_categories = IncomeCategory.objects.filter(user=request.user)

    # Preparing chart data
    income_data = Income.objects.filter(user=request.user).values('income_category__name').annotate(total=Sum('amount')).order_by('-total')
    expense_data = Expense.objects.filter(user=request.user).values('expense_category__name').annotate(total=Sum('amount')).order_by('-total')

    income_labels = [data['income_category__name'] for data in income_data]
    income_values = [data['total'] for data in income_data]
    expense_labels = [data['expense_category__name'] for data in expense_data]
    expense_values = [data['total'] for data in expense_data]

    context = {
        'total_expenses': total_expense,
        'total_incomes': total_income,
        'net': total_income - total_expense,
        'income_labels': income_labels,
        'income_values': income_values,
        'expense_labels': expense_labels,
        'expense_values': expense_values,
        'spending_percentage': ((total_expense / total_income) * 100) if total_income > 0 else 0,
        'net_percentage': (((total_income - total_expense) / total_income) * 100) if total_income > 0 else 0,
    }
    return render(request, 'tracker/home.html', context)

@login_required
def expense_list(request):
    expenses = Expense.objects.filter(user=request.user)
    return render(request, 'tracker/expense_list.html', {'expenses': expenses})

@login_required
def expense_category_list(request):
    categories = ExpenseCategory.objects.filter(user=request.user)
    return render(request, 'tracker/expense_category_list.html', {'categories': categories})

@login_required
def income_list(request):
    incomes = Income.objects.filter(user=request.user)
    return render(request, 'tracker/income_list.html', {'incomes': incomes})

@login_required
def income_category_list(request):
    categories = IncomeCategory.objects.filter(user=request.user)
    return render(request, 'tracker/income_category_list.html', {'categories': categories})

@login_required
def add_expense_category(request):
    if request.method == 'POST':
        form = ExpenseCategoryForm(request.POST)
        if form.is_valid():
            expense_category = form.save(commit=False)
            expense_category.user = request.user
            expense_category.save()
            return redirect('expense_category_list')
    else:
        form = ExpenseCategoryForm()
    return render(request, 'tracker/add_expense_category.html', {'form': form})

@login_required
def edit_expense_category(request, category_id):
    category = get_object_or_404(ExpenseCategory, pk=category_id, user=request.user)
    if request.method == "POST":
        form = ExpenseCategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, "Expense category updated successfully!")
            return redirect('expense_category_list')
    else:
        form = ExpenseCategoryForm(instance=category)
    return render(request, "tracker/edit_expense_category.html", {"form": form})

@login_required
def delete_expense_category(request, category_id):
    category = get_object_or_404(ExpenseCategory, pk=category_id, user=request.user)  # Ensure only the owner can delete
    if request.method == "POST":
        category.delete()
        messages.success(request, "Expense category deleted successfully!")
        return redirect("expense_category_list")
    return render(request, "tracker/confirm_delete_expense_category.html", {"category": category})

@login_required
def add_expense(request):
    if request.method == 'POST':
        form = ExpenseForm(request.POST)
        if form.is_valid():
            expense = form.save(commit=False)
            expense.user = request.user
            expense.save()
            messages.success(request, 'Expense added successfully!')
            return redirect('expense_list')
    else:
        form = ExpenseForm()
    return render(request, 'tracker/add_expense.html', {'form': form})

@login_required
def edit_expense(request, expense_id):
    expense = get_object_or_404(Expense, pk=expense_id, user=request.user)
    if request.method == "POST":
        form = ExpenseForm(request.POST, instance=expense)
        if form.is_valid():
            form.save()
            messages.success(request, "Expense updated successfully!")
            return redirect("expense_list")
    else:
        form = ExpenseForm(instance=expense)
    return render(request, "tracker/edit_expense.html", {"form": form})

@login_required
def delete_expense(request, expense_id):
    expense = get_object_or_404(Expense, pk=expense_id, user=request.user)  # Ensure only the owner can delete
    if request.method == "POST":
        expense.delete()
        messages.success(request, "Expense deleted successfully!")
        return redirect("expense_list")
    return render(request, "tracker/confirm_delete_expense.html", {"expense": expense})

@login_required
def add_income_category(request):
    if request.method == 'POST':
        form = IncomeCategoryForm(request.POST)
        if form.is_valid():
            income_category = form.save(commit=False)
            income_category.user = request.user
            income_category.save()
            return redirect('income_category_list')
    else:
        form = IncomeCategoryForm()
    return render(request, 'tracker/add_income_category.html', {'form': form})

@login_required
def edit_income_category(request, category_id):
    category = get_object_or_404(IncomeCategory, pk=category_id, user=request.user)
    if request.method == "POST":
        form = IncomeCategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, "Income category updated successfully!")
            return redirect('income_category_list')
    else:
        form = IncomeCategoryForm(instance=category)
    return render(request, "tracker/edit_income_category.html", {"form": form})

@login_required
def delete_income_category(request, category_id):
    category = get_object_or_404(IncomeCategory, pk=category_id, user=request.user)  # Ensure only the owner can delete
    if request.method == "POST":
        category.delete()
        messages.success(request, "Income category deleted successfully!")
        return redirect("income_category_list")
    return render(request, "tracker/confirm_delete_income_category.html", {"category": category})

@login_required
def add_income(request):
    if request.method == 'POST':
        form = IncomeForm(request.POST)
        if form.is_valid():
            income = form.save(commit=False)
            income.user = request.user
            income.save()
            messages.success(request, 'Income added successfully!')
            return redirect('income_list')
    else:
        form = IncomeForm()
    return render(request, 'tracker/add_income.html', {'form': form})

@login_required
def edit_income(request, income_id):
    income = get_object_or_404(Income, pk=income_id, user=request.user)
    if request.method == "POST":
        form = IncomeForm(request.POST, instance=income)
        if form.is_valid():
            form.save()
            messages.success(request, "Income updated successfully!")
            return redirect("income_list")
    else:
        form = IncomeForm(instance=income)
    return render(request, "tracker/edit_income.html", {"form": form})

@login_required
def delete_income(request, income_id):
    income = get_object_or_404(Income, pk=income_id, user=request.user)  # Ensure only the owner can delete
    if request.method == "POST":
        income.delete()
        messages.success(request, "Income deleted successfully!")
        return redirect("income_list")
    return render(request, "tracker/confirm_delete_income.html", {"income": income})

