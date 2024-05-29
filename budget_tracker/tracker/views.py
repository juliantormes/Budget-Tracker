from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Sum, F ,  Subquery, OuterRef, DecimalField, Q
from django.contrib import messages
from .models import Expense, ExpenseCategory, IncomeCategory, Income, CreditCard, ExpenseChangeLog, IncomeChangeLog
from .forms import ExpenseForm, IncomeForm, ExpenseCategoryForm, IncomeCategoryForm, CreditCardForm
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from datetime import datetime
from dateutil.relativedelta import relativedelta
from collections import defaultdict
from decimal import Decimal, InvalidOperation,ROUND_HALF_UP
from .utils import get_effective_month, calculate_total_payment_with_surcharge
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import viewsets, status
from .serializers import ExpenseSerializer, ExpenseCategorySerializer, IncomeCategorySerializer, IncomeSerializer, CreditCardSerializer, ExpenseChangeLogSerializer, IncomeChangeLogSerializer, UserSerializer, SignUpSerializer, LoginSerializer, IncomeSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.exceptions import ValidationError
from django.utils.timezone import make_aware
from django.views.decorators.csrf import csrf_exempt


@api_view(['POST'])
@csrf_exempt
def login(request):
    if request.user.is_authenticated:
        return Response({'message': 'You are already logged in'}, status=400)
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        if user and user.is_active:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=200)
        else:
            return Response({'error': 'Invalid Credentials'}, status=401)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@csrf_exempt
def signup(request):
    if request.user.is_authenticated:
        return Response({'message': 'You are already authenticated'}, status=400)
    serializer = SignUpSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
    else:
        if 'username' in serializer.errors:
            return Response({'username': 'This username is already in use.'}, status=status.HTTP_409_CONFLICT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Ensure only authenticated users can access this view
def logout(request):
    request.auth.delete()  # Deletes the token, logging the user out
    return Response({'message': 'Logged out successfully'})

@login_required
def home(request):

    # Parse month and year from request parameters, defaulting to the current month and year
    now = timezone.now()
    start_of_month = now.replace(day=1)
    end_of_month = now.replace(day=1) + timezone.timedelta(days=31)
    end_of_month = end_of_month.replace(day=1) - timezone.timedelta(days=1)
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
    next_month = start_date + relativedelta(days=31)
    last_day_of_month = next_month.replace(day=1) - timezone.timedelta(days=1)
    end_date = last_day_of_month
    # Filter non-recurring and recurring incomes
    non_recurring_incomes = Income.objects.filter(user=request.user, is_recurring=False, date__month=month, date__year=year)
    recurring_incomes = Income.objects.filter(user=request.user, is_recurring=True)
    
    # Filter non-recurring expenses not paid with a credit card
    non_recurring_expenses = Expense.objects.filter(
        user=request.user, 
        is_recurring=False,
        date__month=month, 
        date__year=year
    ).exclude(credit_card__isnull=False)  # Excludes expenses with a credit card

    # Filter recurring expenses not paid with a credit card
    recurring_expenses = Expense.objects.filter(
        user=request.user, 
        is_recurring=True
    ).exclude(credit_card__isnull=False)  # Excludes expenses with a credit card

    
    # Calculate totals
    total_non_recurring_incomes = non_recurring_incomes.aggregate(Sum('amount'))['amount__sum'] or 0
    total_recurring_incomes = recurring_incomes.aggregate(Sum('amount'))['amount__sum'] or 0
    total_non_recurring_expenses = non_recurring_expenses.aggregate(Sum('amount'))['amount__sum'] or 0
    total_recurring_expenses = recurring_expenses.aggregate(Sum('amount'))['amount__sum'] or 0

    # Data

    non_recurring_incomes_list = list(non_recurring_incomes.values('income_category__name').annotate(total=Sum('amount')).order_by().values_list('income_category__name', 'total'))
    recurring_incomes_by_category = list(Income.objects.filter(user=request.user, is_recurring=True, date__year=year).values('income_category__name').annotate(total=Sum('amount')).order_by().values_list('income_category__name', 'total'))
    combined_incomes = non_recurring_incomes_list + recurring_incomes_by_category
    non_recurring_expenses_list = list(non_recurring_expenses.values('expense_category__name').annotate(total=Sum('amount')).order_by().values_list('expense_category__name', 'total'))
    recurring_expenses_by_category = list(recurring_expenses.values('expense_category__name').annotate(total=Sum('amount')).order_by().values_list('expense_category__name', 'total'))
    combined_expenses = non_recurring_expenses_list + recurring_expenses_by_category

    credit_card_expense_data = Expense.objects.filter(user=request.user,credit_card__isnull=False,date__range=(start_date, end_date)).values('credit_card__last_four_digits', 'credit_card__brand').annotate(total=Sum('amount')).order_by('-total')

    # Credit card expenses
    non_recurring_credit_card_expenses = Expense.objects.filter(
        user=request.user,
        credit_card__isnull=False,
        is_recurring=False,
        date__range=(start_of_month, end_of_month)
    ).annotate(
        close_card_day=F('credit_card__close_card_day')  # Adding close_card_day to each expense
    )

    # Prepare data and labels for charts
    monthly_credit_card_expenses = defaultdict(lambda: defaultdict(Decimal))
    if combined_incomes:
        income_labels, income_data = zip(*combined_incomes)
    else:
        income_labels, income_data = [], []
    if combined_expenses:
        expense_labels, expense_data = zip(*combined_expenses)  # Unpack if there are expenses
    else:
        expense_labels, expense_data = [], []  # Provide empty lists if no expenses

    credit_card_labels = [f"{data['credit_card__brand']} ending in {data['credit_card__last_four_digits']}" for data in credit_card_expense_data]
    credit_card_values = [data['total'] for data in credit_card_expense_data]

    recurring_credit_card_expenses = Expense.objects.filter(
        user=request.user,
        credit_card__isnull=False,
        is_recurring=True,
    ).values(
        'credit_card__last_four_digits',
        'credit_card__brand',
        'date'  # Assuming 'date' is a field in Expense
    ).annotate(
        total=Sum('amount'),
        close_card_day=F('credit_card__close_card_day')  # Fetch the close_card_day from related CreditCard
    ).order_by()

    for expense in non_recurring_credit_card_expenses:
        effective_month = get_effective_month(expense.date, expense.credit_card.close_card_day)
        effective_month_str = effective_month.strftime('%B %Y')
        card_label = f"{expense.credit_card.brand} ending in {expense.credit_card.last_four_digits}"

        if expense.credit_card and expense.installments and expense.installments > 1:
            # Calculate the amount for each installment including the surcharge
            amount_per_installment = calculate_total_payment_with_surcharge(expense.amount, expense.surcharge) / expense.installments
            
            # Distribute this amount across the corresponding months
            for installment in range(1, expense.installments + 1):
                projection_date = effective_month + relativedelta(months=installment-1)
                projection_month_str = projection_date.strftime('%B %Y')
                
                monthly_credit_card_expenses[projection_month_str][card_label] += amount_per_installment.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        else:
            # Calculate total amount including surcharge for single installment or no installment specified
            total_amount_with_surcharge = calculate_total_payment_with_surcharge(expense.amount, expense.surcharge)

            monthly_credit_card_expenses[effective_month_str][card_label] += total_amount_with_surcharge.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    # Process recurring credit card expenses similarly
    for expense in recurring_credit_card_expenses:
        now_date = now.date()  # Convert 'now' to a datetime.date object
        projection_end_date = now_date + relativedelta(years=5)  # Now correctly a datetime.date
        projection_date = expense['date']  # Start projection from the original expense date

        while projection_date <= projection_end_date:
            # Calculate the effective month for each projected date, using projection_date
            effective_month = get_effective_month(projection_date, expense['close_card_day'])
            effective_month_str = effective_month.strftime('%B %Y')
            card_label = f"{expense['credit_card__brand']} ending in {expense['credit_card__last_four_digits']}"

            # Use .get() to safely access 'surcharge', defaulting to 0 if it's not present
            surcharge = expense.get('surcharge', 0)
            surcharge_rate = Decimal(surcharge) / Decimal(100)  # Convert surcharge to a Decimal

            # Ensure all parts of the operation are Decimal
            total_amount_with_surcharge = expense['total'] * (Decimal('1') + surcharge_rate)
            
            # Aggregate adjusted expense amount by card within each effective month
            monthly_credit_card_expenses[effective_month_str][card_label] += total_amount_with_surcharge

            # Move to the next month for the next iteration
            projection_date += relativedelta(months=1)
    
    selected_month_str = datetime(year, month, 1).strftime('%B %Y')
    if selected_month_str in monthly_credit_card_expenses:
        credit_card_labels = list(monthly_credit_card_expenses[selected_month_str].keys())
        credit_card_values = list(monthly_credit_card_expenses[selected_month_str].values())
    else:
        credit_card_labels = []
        credit_card_values = []

    # Initialize totals
    total_non_recurring_credit_card_expense = Decimal('0')
    total_recurring_credit_card_expense_total = Decimal('0')

    # Loop through expenses to calculate totals based on effective month
    if selected_month_str in monthly_credit_card_expenses:
        for card_label, amount in monthly_credit_card_expenses[selected_month_str].items():
            # Assuming you want to aggregate all credit card expenses here, without distinguishing between recurring and non-recurring
            # If you need to distinguish between recurring and non-recurring, you would need to have kept track of that distinction when populating monthly_credit_card_expenses
            total_recurring_credit_card_expense_total += amount  # Adjust this logic based on your distinction between recurring and non-recurring
    # Calculations for summary table
    total_expense = total_recurring_expenses + total_non_recurring_expenses
    total_income = total_recurring_incomes + total_non_recurring_incomes
    net = total_income - total_expense - total_non_recurring_credit_card_expense - total_recurring_credit_card_expense_total

    
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
        'total_credit_card_expenses': round (total_non_recurring_credit_card_expense + total_recurring_credit_card_expense_total,2),
        # Labels and values for pie charts
        'income_labels': income_labels,
        'income_data': income_data,
        'expense_labels': expense_labels,
        'expense_data': expense_data,
        'credit_card_labels': credit_card_labels,
        'credit_card_values': credit_card_values,
        # Percentage data for bar graphs
        'cash_flow_percentage': "{:.2f}".format(max(0, (((total_expense - total_recurring_credit_card_expense_total - total_non_recurring_credit_card_expense) / total_income) * 100)) if total_income > 0 else 0),
        'net_percentage': "{:.2f}".format(max(0, (((total_income - total_expense) / total_income) * 100)) if total_income > 0 else 0),
        'credit_card_percentage': "{:.2f}".format(max(0, (((total_recurring_credit_card_expense_total + total_non_recurring_credit_card_expense) / total_income) * 100)) if total_income > 0 else 0),
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
    # Ensure you're filtering by the current user
    expenses = Expense.objects.filter(
    Q(user=request.user, is_recurring=True) | 
    Q(user=request.user, is_recurring=False, date__year=current_year, date__month=current_month)
    )

    # Annotate the filtered expenses with the most recent amount
    latest_changes = ExpenseChangeLog.objects.filter(
        expense=OuterRef('pk'),
        change_date__lte=timezone.now()
    ).order_by('-change_date')

    expenses_with_recent_amount = expenses.annotate(
        recent_amount=Subquery(latest_changes.values('new_amount')[:1], output_field=DecimalField())
    )

    # Use the annotated queryset 'expenses_with_recent_amount' for the loop
    for expense in expenses_with_recent_amount:
        base_amount = expense.recent_amount if expense.recent_amount else expense.amount
        if expense.surcharge:
            expense.display_amount = round(calculate_total_payment_with_surcharge(base_amount, expense.surcharge), 2)
        else:
            expense.display_amount = round(base_amount, 2)

    return render(request, 'tracker/expense_list.html', {'expenses': expenses_with_recent_amount})


@login_required
def expense_category_list(request):
    categories = ExpenseCategory.objects.filter(user=request.user)
    return render(request, 'tracker/expense_category_list.html', {'categories': categories})

@login_required
def income_list(request):
    current_month = timezone.now().month
    current_year = timezone.now().year
    # Ensure you're filtering by the current user
    incomes = Income.objects.filter(user=request.user, date__year=current_year, date__month=current_month)

    latest_changes = IncomeChangeLog.objects.filter(
        income=OuterRef('pk'),
        change_date__lte=timezone.now()
    ).order_by('-change_date')

    incomes_with_recent_amount = incomes.annotate(
        recent_amount=Subquery(latest_changes.values('new_amount')[:1], output_field=DecimalField())
    )

    # Use the annotated queryset 'incomes_with_recent_amount' for the loop
    for income in incomes_with_recent_amount:
        income.display_amount = income.recent_amount if income.recent_amount else income.amount

    return render(request, 'tracker/income_list.html', {'incomes': incomes_with_recent_amount})


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

            # Check if the expense is paid with a credit card and calculate the total charge
            if expense.credit_card:
                # Calculate the total expense amount considering the surcharge
                total_expense_amount = expense.amount * (1 + (expense.surcharge / Decimal(100)))
                # Check against the available credit
                if total_expense_amount > expense.credit_card.available_credit():
                    form.add_error(None, "Total expense amount exceeds available credit on the credit card.")
                    return render(request, 'tracker/add_expense.html', {'form': form})
            
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
            expense = form.save(commit=False)
            expense.user = request.user

            # Check if the expense is paid with a credit card and calculate the total charge
            if expense.credit_card:
                # Calculate the total expense amount considering the surcharge
                total_expense_amount = expense.amount * (1 + (expense.surcharge / Decimal(100)))
                # Check against the available credit
                if total_expense_amount > expense.credit_card.available_credit():
                    form.add_error(None, "Total expense amount exceeds available credit on the credit card.")
                    return render(request, 'tracker/edit_expense.html', {'form': form})
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
    expense = get_object_or_404(Expense, id=expense_id, user=request.user)
    if request.method == 'POST':
        new_amount = request.POST.get('new_amount')
        try:
            new_amount_decimal = Decimal(new_amount)
            if expense.is_recurring:
                ExpenseChangeLog.objects.create(
                    expense=expense,
                    previous_amount=expense.amount,
                    new_amount=new_amount_decimal,
                    change_date=timezone.now().date()
                )
                expense.amount = new_amount_decimal
                expense.save()
                messages.success(request, "Amount updated sucesfully!")
                return redirect('expense_list')
        except InvalidOperation:
            raise ValueError("Invalid amount")

    return render(request, 'tracker/record_recurring_expense_change.html', {'expense': expense})

@login_required
def record_recurring_income_change(request, income_id):
    income = get_object_or_404(Income, id=income_id, user=request.user)  # Ensures the user owns the income
    if request.method == 'POST':
        new_amount = request.POST.get('new_amount')
        try:
            new_amount_decimal = Decimal(new_amount)
            if income.is_recurring:
                IncomeChangeLog.objects.create(
                    income=income,
                    previous_amount=income.amount,
                    new_amount=new_amount_decimal,
                    change_date=timezone.now().date()
                )
                income.amount = new_amount_decimal
                messages.success(request, "Amount updated sucesfully!")
                income.save()
                return redirect('income_list')
        except ValueError:
            raise ValueError("Invalid amount")

    return render(request, 'tracker/record_recurring_income_change.html', {'income': income})
class ExpenseViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAuthenticated]
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    def get_queryset(self):
        queryset = super().get_queryset().filter(user=self.request.user)
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')

        if year and month:
            try:
                year = int(year)
                month = int(month)
                start_date = datetime(year, month, 1)
                end_date = start_date + relativedelta(months=1, days=-1)

                # Filter for transactions of the specific month or recurring transactions
                monthly_transactions = Q(date__gte=start_date, date__lte=end_date)
                recurring_transactions = Q(is_recurring=True)
                queryset = queryset.filter(monthly_transactions | recurring_transactions)
            except ValueError:
                raise ValidationError('Invalid year or month format.')

        return queryset

class IncomeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    def get_queryset(self):
        queryset = super().get_queryset().filter(user=self.request.user)
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')

        if year and month:
            try:
                year = int(year)
                month = int(month)
                start_date = datetime(year, month, 1)
                end_date = start_date + relativedelta(months=1, days=-1)
                monthly_transactions = Q(date__gte=start_date, date__lte=end_date)
                recurring_transactions = Q(is_recurring=True)
                queryset = queryset.filter(monthly_transactions | recurring_transactions)
            except ValueError:
                raise ValidationError('Invalid year or month format.')

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
class CreditCardViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = CreditCard.objects.all()
    serializer_class = CreditCardSerializer

    def get_queryset(self):
        return CreditCard.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer

    def get_queryset(self):
        return ExpenseCategory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
class IncomeCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = IncomeCategory.objects.all()
    serializer_class = IncomeCategorySerializer

    def get_queryset(self):
        return IncomeCategory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
class ExpenseChangeLogViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = ExpenseChangeLog.objects.all()
    serializer_class = ExpenseChangeLogSerializer
    
    def get_queryset(self):
        return ExpenseChangeLog.objects.filter(expense__user=self.request.user)
class IncomeChangeLogViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = IncomeChangeLog.objects.all()
    serializer_class = IncomeChangeLogSerializer
    
    def get_queryset(self):
        return IncomeChangeLog.objects.filter(income__user=self.request.user)
    
class CreditCardExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        user = self.request.user
        year = self.request.query_params.get('year', datetime.now().year)
        month = self.request.query_params.get('month', datetime.now().month)
        
        start_of_month = make_aware(datetime(int(year), int(month), 1))
        end_of_month = start_of_month + relativedelta(months=1) - relativedelta(days=1)

        return Expense.objects.filter(
            user=user,
            credit_card__isnull=False,
            date__range=[start_of_month, end_of_month]
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)