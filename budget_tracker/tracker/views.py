from django.db.models import Q
from .models import Expense, ExpenseCategory, IncomeCategory, Income, CreditCard, IncomeRecurringChangeLog, ExpenseRecurringChangeLog
from datetime import datetime
from dateutil.relativedelta import relativedelta
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import viewsets, status
from .serializers import ExpenseSerializer, ExpenseCategorySerializer, IncomeCategorySerializer, IncomeSerializer, CreditCardSerializer, SignUpSerializer, LoginSerializer, IncomeSerializer, IncomeCategorySerializer, CreditCardSerializer, ExpenseRecurringChangeLogSerializer, IncomeRecurringChangeLogSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.exceptions import ValidationError
from django.utils.timezone import make_aware
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_recurring_expense(request, expense_id):
    try:
        # Retrieve the expense or return a 404 error if not found
        expense = get_object_or_404(Expense, id=expense_id, user=request.user)
        
        # Create the serializer with the incoming data and context
        serializer = ExpenseRecurringChangeLogSerializer(data=request.data, context={'expense': expense})
        
        if serializer.is_valid():
            # Save the serializer with the expense object
            serializer.save(expense=expense)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_recurring_income(request, income_id):
    try:
        # Retrieve the income or return a 404 error if not found
        income = get_object_or_404(Income, id=income_id, user=request.user)
        
        # Create the serializer with the incoming data and context
        serializer = IncomeRecurringChangeLogSerializer(data=request.data, context={'income': income})
        
        if serializer.is_valid():
            # Save the serializer with the income object
            serializer.save(income=income)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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

                # Filter for transactions of the specific month or recurring transactions
                monthly_transactions = Q(date__gte=start_date, date__lte=end_date)
                recurring_transactions = Q(is_recurring=True)
                queryset = queryset.filter(monthly_transactions | recurring_transactions)
            except ValueError:
                raise ValidationError('Invalid year or month format.')

        return queryset

    def perform_create(self, serializer):
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
                monthly_transactions = Q(date__gte=start_date, date__lte=end_date)
                recurring_transactions = Q(is_recurring=True)
                queryset = queryset.filter(monthly_transactions | recurring_transactions)
            except ValueError:
                raise ValidationError('Invalid year or month format.')

        return queryset

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
            date__range=[start_of_month, end_of_month]
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