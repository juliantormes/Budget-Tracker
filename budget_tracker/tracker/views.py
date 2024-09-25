from django.db.models import Q
from .models import Expense, ExpenseCategory, IncomeCategory, Income, CreditCard, IncomeRecurringChangeLog, ExpenseRecurringChangeLog
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import viewsets, status
from .serializers import ExpenseSerializer, ExpenseCategorySerializer, IncomeCategorySerializer, IncomeSerializer, CreditCardSerializer, SignUpSerializer, LoginSerializer, IncomeSerializer, IncomeCategorySerializer, CreditCardSerializer, ExpenseRecurringChangeLogSerializer, IncomeRecurringChangeLogSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework.exceptions import ValidationError
from django.utils.timezone import make_aware
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.http import Http404

@api_view(['POST'])
def login(request):
    if request.user.is_authenticated:
        return Response({'message': 'You are already logged in'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        if user and user.is_active:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def signup(request):
    if request.user.is_authenticated:
        return Response({'message': 'You are already authenticated'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = SignUpSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_201_CREATED)  # 201 for creation
    
    if 'username' in serializer.errors:
        return Response({'username': 'This username is already in use.'}, status=status.HTTP_409_CONFLICT)  # 409 for duplicate
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow access to the view without authentication
def logout(request):
    # Manually check if the user is authenticated
    if not request.auth:
        return Response({'error': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # If the user is authenticated, proceed with token deletion
    request.auth.delete()  # Deletes the token, logging the user out
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def update_recurring_expense(request, expense_id):
    try:
        # First check if the expense exists
        expense = get_object_or_404(Expense, id=expense_id, user=request.user)
        
        # Then proceed with other validation
        effective_date_str = request.data.get('effective_date')
        if not effective_date_str:
            return Response({"error": "Effective date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            effective_date = datetime.strptime(effective_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # Try to find an existing change log for the same month
        existing_log = expense.change_logs.filter(
            effective_date__year=effective_date.year,
            effective_date__month=effective_date.month
        ).first()

        if existing_log:
            serializer = ExpenseRecurringChangeLogSerializer(existing_log, data=request.data)
        else:
            serializer = ExpenseRecurringChangeLogSerializer(data=request.data, context={'expense': expense})  # Ensure this always passes the expense object

        if serializer.is_valid():
            serializer.save(expense=expense)
            return Response(serializer.data, status=status.HTTP_200_OK if existing_log else status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Http404:
        return Response({'error': 'Expense not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def update_recurring_income(request, income_id):
    try:
        # First check if the income exists
        income = get_object_or_404(Income, id=income_id, user=request.user)
        
        # Then proceed with other validation
        effective_date_str = request.data.get('effective_date')
        if not effective_date_str:
            return Response({"error": "Effective date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            effective_date = datetime.strptime(effective_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # Try to find an existing change log for the same month
        existing_log = income.change_logs.filter(
            effective_date__year=effective_date.year,
            effective_date__month=effective_date.month
        ).first()

        if existing_log:
            serializer = IncomeRecurringChangeLogSerializer(existing_log, data=request.data)
        else:
            serializer = IncomeRecurringChangeLogSerializer(data=request.data, context={'income': income})  # Ensure this always passes the income object

        if serializer.is_valid():
            serializer.save(income=income)
            return Response(serializer.data, status=status.HTTP_200_OK if existing_log else status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Http404:
        return Response({'error': 'Income not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
                start_date = start_date.date()
                end_date = end_date.date()

                monthly_transactions = queryset.filter(date__gte=start_date, date__lte=end_date)
                recurring_transactions = queryset.filter(is_recurring=True, date__lte=end_date)
                recurring_expenses = []

                for expense in recurring_transactions:
                    change_log = expense.change_logs.filter(
                        effective_date__year=year,
                        effective_date__month=month
                    ).first()

                    effective_amount = change_log.new_amount if change_log else expense.amount

                    recurring_expense = Expense(
                        id=expense.id,
                        user=expense.user,
                        category=expense.category,
                        amount=effective_amount,
                        description=expense.description,
                        date=start_date,
                        is_recurring=True,
                    )
                    recurring_expenses.append(recurring_expense)

                queryset = list(monthly_transactions) + recurring_expenses

            except ValueError:
                raise ValidationError('Invalid year or month format.')

        return queryset

    def perform_create(self, serializer):
        is_recurring = serializer.validated_data.get('is_recurring', False)
        installments = serializer.validated_data.get('installments', 1)

        if is_recurring and installments > 1:
            raise ValidationError({'installments': 'Recurring expenses cannot have more than 1 installment.'})

        serializer.save(user=self.request.user)

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

                start_date = start_date.date()
                end_date = end_date.date()

                monthly_transactions = queryset.filter(date__gte=start_date, date__lte=end_date)

                recurring_transactions = queryset.filter(is_recurring=True, date__lte=end_date)
                recurring_incomes = []

                for income in recurring_transactions:
                    change_log = income.change_logs.filter(
                        effective_date__year=year, 
                        effective_date__month=month
                    ).first()

                    effective_amount = change_log.new_amount if change_log else income.amount

                    recurring_income = Income(
                        id=income.id,
                        user=income.user,
                        category=income.category,
                        amount=effective_amount,
                        description=income.description,
                        date=start_date,
                        is_recurring=True,
                    )
                    recurring_incomes.append(recurring_income)

                queryset = list(monthly_transactions) + recurring_incomes

            except ValueError:
                raise ValidationError('Invalid year or month format.')

        return queryset

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except ValidationError as e:
            raise ValidationError({"detail": str(e)})

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
        ).filter(
            Q(date__lte=end_of_month) & (
                # Include expenses with a single installment if they are within this month
                Q(installments=1) |  
                # Recurring expenses: ensure they appear every month after their initial date
                Q(is_recurring=True, date__lte=end_of_month) | 
                # Expenses with multiple installments extending over months
                Q(end_date__gte=start_of_month) |  
                Q(installments__gt=1)
            )
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
class IncomeRecurringChangeLogViewSet(viewsets.ModelViewSet):
    queryset = IncomeRecurringChangeLog.objects.all()
    serializer_class = IncomeRecurringChangeLogSerializer

    def create(self, request, *args, **kwargs):
        income = Income.objects.get(pk=kwargs['income_id'])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(income=income)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ExpenseRecurringChangeLogViewSet(viewsets.ModelViewSet):
    queryset = ExpenseRecurringChangeLog.objects.all()
    serializer_class = ExpenseRecurringChangeLogSerializer

    def create(self, request, *args, **kwargs):
        expense = Expense.objects.get(pk=kwargs['expense_id'])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(expense=expense)
        return Response(serializer.data, status=status.HTTP_201_CREATED)