from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Expense, ExpenseCategory, IncomeCategory, Income, CreditCard, ExpenseChangeLog, IncomeChangeLog
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate

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
        # Don't authenticate here, just return the validated data
        return data
class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}
class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='expense_category.name', read_only=True)

    class Meta:
        model = Expense
        fields = ('id', 'amount', 'date', 'user', 'expense_category', 'category_name')  # Similarly, list all fields explicitly
        extra_kwargs = {'user': {'read_only': True}}

class IncomeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeCategory
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}
class IncomeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='income_category.name', read_only=True)

    class Meta:
        model = Income
        fields = ('id', 'amount', 'date', 'user', 'income_category', 'category_name')  # Explicitly listing all fields including the custom one
        extra_kwargs = {'user': {'read_only': True}}

class CreditCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCard
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

class ExpenseChangeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseChangeLog
        fields = '__all__'
class IncomeChangeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeChangeLog
        fields = '__all__'



