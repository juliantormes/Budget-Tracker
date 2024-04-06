from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Expense, ExpenseCategory, IncomeCategory, Income, CreditCard, ExpenseChangeLog, IncomeChangeLog
from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'passsword']
class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}
class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}
class IncomeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeCategory
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}
class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'
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



