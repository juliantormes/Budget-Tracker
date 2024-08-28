from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Expense, ExpenseCategory, IncomeCategory, Income, CreditCard, IncomeRecurringChangeLog, ExpenseRecurringChangeLog
from decimal import Decimal
from datetime import date
from datetime import datetime

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')

class SignUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        return data

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}
class IncomeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeCategory
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

class CreditCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCard
        exclude = ['user']

class IncomeRecurringChangeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeRecurringChangeLog
        fields = ['id', 'income', 'new_amount', 'effective_date']
        extra_kwargs = {
            'income': {'read_only': True},
        }

    def validate_effective_date(self, value):
        income = getattr(self.instance, 'income', None) or self.context.get('income')
        if not income:
            income = self.context['request'].data.get('income')
        
        # Ensure the effective date is not before the original income date
        if value < income.date:
            raise serializers.ValidationError("Effective date cannot be earlier than the start date of the income.")
        
        # Check if there's already a change log for the same month
        existing_log = income.change_logs.filter(
            effective_date__year=value.year,
            effective_date__month=value.month
        ).exclude(id=self.instance.id if self.instance else None).first()

        if existing_log:
            raise serializers.ValidationError(
                "A record for this month already exists. Please edit the existing record."
            )

        return value
class ExpenseRecurringChangeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseRecurringChangeLog
        fields = ['id', 'expense', 'new_amount', 'effective_date']
        extra_kwargs = {
            'expense': {'read_only': True},
        }

    def validate_effective_date(self, value):
        expense = getattr(self.instance, 'expense', None) or self.context.get('expense')
        
        if not expense:
            raise serializers.ValidationError("Expense data is missing.")
        
        # Ensure the effective date is not before the original expense date
        if value < expense.date:
            raise serializers.ValidationError("Effective date cannot be earlier than the start date of the expense.")
        
        # Check if there's already a change log for the same month
        existing_log = expense.change_logs.filter(
            effective_date__year=value.year,
            effective_date__month=value.month
        ).exclude(id=self.instance.id if self.instance else None).first()

        if existing_log:
            raise serializers.ValidationError(
                "A record for this month already exists. Please edit the existing record."
            )

        return value

    
class IncomeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    change_logs = IncomeRecurringChangeLogSerializer(many=True, read_only=True)
    effective_amount = serializers.SerializerMethodField()

    class Meta:
        model = Income
        fields = ['id', 'amount', 'date', 'user', 'category', 'category_name', 'is_recurring', 'description', 'change_logs', 'effective_amount']
        extra_kwargs = {'user': {'read_only': True}}

    def get_effective_amount(self, obj):
        request = self.context.get('request')
        check_date_str = request.query_params.get('date')
        
        if check_date_str:
            try:
                check_date = datetime.strptime(check_date_str, '%Y-%m-%d').date()
            except ValueError:
                raise serializers.ValidationError("Invalid date format. Use 'YYYY-MM-DD'.")
        else:
            check_date = date.today()
        
        return obj.get_effective_amount(check_date)


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    credit_card = CreditCardSerializer(read_only=True)
    credit_card_id = serializers.PrimaryKeyRelatedField(
        queryset=CreditCard.objects.all(),
        source='credit_card',
        write_only=True,
        required=False,
        allow_null=True
    )
    change_logs = ExpenseRecurringChangeLogSerializer(many=True, read_only=True)
    effective_amount = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

    def validate(self, data):
        if data.get('pay_with_credit_card', False) and not data.get('credit_card'):
            raise serializers.ValidationError("Credit card must be provided if paying with credit card.")

        if data.get('pay_with_credit_card', False):
            credit_card = data.get('credit_card')
            current_balance = credit_card.current_balance()
            total_new_expense = data['amount'] + (data['amount'] * data['surcharge'] / 100)
            if current_balance + total_new_expense > credit_card.credit_limit:
                raise serializers.ValidationError(
                    f"Credit limit exceeded. Current balance: {current_balance}, "
                    f"New expense total: {total_new_expense}, Credit limit: {credit_card.credit_limit}"
                )

        if not data.get('pay_with_credit_card', False):
            data['credit_card'] = None
            data['installments'] = 1
            data['surcharge'] = Decimal('0.00')

        return data

    def create(self, validated_data):
        credit_card = validated_data.pop('credit_card', None)
        expense = Expense.objects.create(**validated_data)
        if credit_card:
            expense.credit_card = credit_card
            expense.save()
        return expense

    def update(self, instance, validated_data):
        credit_card = validated_data.pop('credit_card', None)
        instance = super().update(instance, validated_data)
        if credit_card:
            instance.credit_card = credit_card
            instance.save()
        return instance

    def get_effective_amount(self, obj):
        request = self.context.get('request')
        check_date_str = request.query_params.get('date')
        
        if check_date_str:
            try:
                check_date = datetime.strptime(check_date_str, '%Y-%m-%d').date()
            except ValueError:
                raise serializers.ValidationError("Invalid date format. Use 'YYYY-MM-DD'.")
        else:
            check_date = date.today()
        
        return obj.get_effective_amount(check_date)
