from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Sum, F
from django.contrib import messages
from .models import Expense, ExpenseCategory, IncomeCategory, Income, CreditCard, RecurringExpenseChange, RecurringIncomeChange
from .forms import ExpenseForm, IncomeForm, ExpenseCategoryForm, IncomeCategoryForm, CreditCardForm
from django.contrib.auth import authenticate, logout as auth_logout, login as auth_login
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from datetime import datetime
from dateutil.relativedelta import relativedelta

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

    # Parse month and year from request parameters, defaulting to the current month and year
    now = timezone.now()
    this_month = int(now.month)
    this_year = int(now.year)
    month_query = request.GET.get('month', now.month)
    year_query = request.GET.get('year', now.year)
    try:
        month = int(month_query)
        year = int(year_query)
        # Ensure valid month values
        if month < 1 or month > 12:
            raise ValueError
    except ValueError:
        # Redirect to the current month and year if invalid values are provided
        return redirect(f"?year={now.year}&month={now.month}")

    selected_date = datetime(year, month, 1)
    start_date = selected_date
    end_date = (start_date + relativedelta(months=1)) - relativedelta(days=1)
    previous_month = start_date - relativedelta(months=1)
    next_month = start_date + relativedelta(months=1)
    # Filter non-recurring and recurring incomes
    non_recurring_incomes = Income.objects.filter(user=request.user, is_recurring=False, date__month=month, date__year=year)
    recurring_incomes = Income.objects.filter(user=request.user, is_recurring=True)
    
    # Filter non-recurring and recurring expenses
    non_recurring_expenses = Expense.objects.filter(user=request.user, is_recurring=False, date__month=month, date__year=year)
    recurring_expenses = Expense.objects.filter(user=request.user, is_recurring=True)

    
    # Calculate totals
    total_non_recurring_incomes = non_recurring_incomes.aggregate(Sum('amount'))['amount__sum'] or 0
    total_recurring_incomes = recurring_incomes.aggregate(Sum('amount'))['amount__sum'] or 0
    total_non_recurring_expenses = non_recurring_expenses.aggregate(Sum('amount'))['amount__sum'] or 0
    total_recurring_expenses = recurring_expenses.aggregate(Sum('amount'))['amount__sum'] or 0

    # Data
    non_recurring_incomes_list = list(non_recurring_incomes.values_list('income_category__name', 'amount'))
    recurring_incomes_list = [('Recurring Incomes', total_recurring_incomes)]
    non_recurring_expenses_list = list(non_recurring_expenses.values_list('expense_category__name', 'amount'))
    recurring_expenses_list = [('Recurring Expenses', total_recurring_expenses)]
    combined_incomes = non_recurring_incomes_list + recurring_incomes_list
    combined_expenses = non_recurring_expenses_list + recurring_expenses_list
    credit_card_expense_data = Expense.objects.filter(user=request.user,credit_card__isnull=False,date__range=(start_date, end_date)).values('credit_card__last_four_digits', 'credit_card__brand').annotate(total=Sum('amount')).order_by('-total')

    # Credit card expenses
    total_credit_card_expense = Expense.objects.filter(user=request.user, credit_card__isnull=False, date__range=(start_date, end_date)).aggregate(Sum('amount'))['amount__sum'] or 0
    
    
    # Calculations for summary table
    total_expense = total_recurring_expenses + total_non_recurring_expenses
    total_income = total_recurring_incomes + total_non_recurring_incomes
    net = total_income - total_expense - total_credit_card_expense
    net = total_income - total_expense

    # Prepare data and labels for charts
    income_labels, income_data= zip(*combined_incomes) # This separates the labels and values
    expense_labels, expense_data = zip(*combined_expenses) # This separates the labels and values
    credit_card_labels = [f"{data['credit_card__brand']} ending in {data['credit_card__last_four_digits']}" for data in credit_card_expense_data]
    credit_card_values = [data['total'] for data in credit_card_expense_data]

    context = {
        # Data for the date navigation
        'previous_month_year': previous_month.year,
        'previous_month_month': previous_month.month,
        'next_month_year': next_month.year,
        'next_month_month': next_month.month,
        'month_name': selected_date.strftime("%B"),
        'year': year,
        'viewing_month': this_month,
        'viewing_year': this_year,
        # Data for the summary table
        'total_expenses': total_expense,
        'total_incomes': total_income,
        'net': net,
        'total_credit_card_expenses': total_credit_card_expense,
        # Labels and values for pie charts
        'income_labels': income_labels,
        'income_data': income_data,
        'expense_labels': expense_labels,
        'expense_data': expense_data,
        'credit_card_labels': credit_card_labels,
        'credit_card_values': credit_card_values,
        # Percentage data for bar graphs
        'cash_flow_percentage': (((total_expense - total_credit_card_expense) / total_income) * 100) if total_income > 0 else 0,
        'net_percentage': ((net / total_income) * 100) if total_income > 0 else 0,
        'credit_card_percentage': ((total_credit_card_expense / total_income) * 100) if total_income > 0 else 0,
    }
    return render(request, 'tracker/home.html', context)

@login_required
def add_credit_card(request):
    if request.method == 'POST':
        form = CreditCardForm(request.POST)
        if form.is_valid():
            credit_card = form.save(commit=False)
            credit_card.user = request.user
            credit_card.save()
            messages.success(request, 'Credit card added successfully!')
            return redirect('credit_card_list')
    else:
        form = CreditCardForm()
    return render(request, 'tracker/add_credit_card.html', {'form': form})

@login_required
def edit_credit_card(request, card_id):
    credit_card = get_object_or_404(CreditCard, pk=card_id, user=request.user)
    if request.method == 'POST':
        form = CreditCardForm(request.POST, instance=credit_card)
        if form.is_valid():
            form.save()
            messages.success(request, 'Credit card updated successfully!')
            return redirect('credit_card_list')
    else:
        form = CreditCardForm(instance=credit_card)
    return render(request, 'tracker/edit_credit_card.html', {'form': form})

@login_required
def delete_credit_card(request, card_id):
    credit_card = get_object_or_404(CreditCard, pk=card_id, user=request.user)
    if request.method == "POST":
        credit_card.delete()
        messages.success(request, "Credit card deleted successfully!")
        return redirect("credit_card_list")
    return render(request, "tracker/confirm_delete_credit_card.html", {"credit_card": credit_card})

@login_required
def credit_card_list(request):
    credit_cards = CreditCard.objects.filter(user=request.user)
    return render(request, 'tracker/credit_card_list.html', {'credit_cards': credit_cards})


@login_required
def expense_list(request):
    current_month = timezone.now().month
    current_year = timezone.now().year
    expenses = Expense.objects.filter(user=request.user, date__year=current_year, date__month=current_month)
    for expense in expenses:
        if expense.is_recurring:
            latest_change = RecurringExpenseChange.objects.filter(expense=expense, change_date__lte=timezone.now()).order_by('-change_date').first()
            if latest_change:
                expense.amount = latest_change.new_amount
    return render(request, 'tracker/expense_list.html', {'expenses': expenses})

@login_required
def expense_category_list(request):
    categories = ExpenseCategory.objects.filter(user=request.user)
    return render(request, 'tracker/expense_category_list.html', {'categories': categories})

@login_required
def income_list(request):
    current_month = timezone.now().month
    current_year = timezone.now().year
    incomes = Income.objects.filter(user=request.user, date__year=current_year, date__month=current_month)
    for income in incomes:
        if income.is_recurring:
            latest_change = RecurringIncomeChange.objects.filter(income=income, change_date__lte=timezone.now()).order_by('-change_date').first()
            if latest_change:
                income.amount = latest_change.new_amount
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
        form = ExpenseForm(request.POST, user=request.user)
        if form.is_valid():
            expense = form.save(commit=False)
            expense.user = request.user
            expense.save()
            messages.success(request, 'Expense added successfully!')
            return redirect('expense_list')
    else:
        form = ExpenseForm(user=request.user)
    return render(request, 'tracker/add_expense.html', {'form': form})

@login_required
def edit_expense(request, expense_id):
    expense = get_object_or_404(Expense, pk=expense_id, user=request.user)
    if request.method == "POST":
        form = ExpenseForm(request.POST, instance=expense , user=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, "Expense updated successfully!")
            return redirect("expense_list")
    else:
        form = ExpenseForm(instance=expense, user=request.user)
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
        form = IncomeForm(request.POST, user=request.user)
        if form.is_valid():
            income = form.save(commit=False)
            income.user = request.user
            income.save()
            messages.success(request, 'Income added successfully!')
            return redirect('income_list')
    else:
        form = IncomeForm(user=request.user)
    return render(request, 'tracker/add_income.html', {'form': form})

@login_required
def edit_income(request, income_id):
    income = get_object_or_404(Income, pk=income_id, user=request.user)
    if request.method == "POST":
        form = IncomeForm(request.POST, instance=income, user=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, "Income updated successfully!")
            return redirect("income_list")
    else:
        form = IncomeForm(instance=income, user=request.user)
    return render(request, "tracker/edit_income.html", {"form": form})

@login_required
def delete_income(request, income_id):
    income = get_object_or_404(Income, pk=income_id, user=request.user)  # Ensure only the owner can delete
    if request.method == "POST":
        income.delete()
        messages.success(request, "Income deleted successfully!")
        return redirect("income_list")
    return render(request, "tracker/confirm_delete_income.html", {"income": income})

@login_required
def record_recurring_expense_change(request, expense_id):
    expense = Expense.objects.get(id=expense_id)
    if request.method == 'POST':
        new_amount = request.POST.get('new_amount')
        change_date = timezone.now().date()
        RecurringExpenseChange.objects.create(expense=expense, change_date=change_date, new_amount=new_amount)
        return redirect('expense_list')
    return render(request, 'tracker/record_recurring_expense_change.html', {'expense': expense})

@login_required
def record_recurring_income_change(request, income_id):
    income = Income.objects.get(id=income_id)
    if request.method == 'POST':
        new_amount = request.POST.get('new_amount')
        change_date = timezone.now().date()
        RecurringIncomeChange.objects.create(income=income, change_date=change_date, new_amount=new_amount)
        return redirect('expense_list')
    return render(request, 'tracker/record_recurring_income_change.html', {'expense': income})
