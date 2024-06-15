from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Expense, ExpenseCategory, IncomeCategory, Income, CreditCard, ExpenseChangeLog, IncomeChangeLog
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

class CreditCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCard
        fields = '__all__'

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

    class Meta:
        model = Expense
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

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

class IncomeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeCategory
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

class IncomeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Income
        fields = ['id', 'amount', 'date', 'user', 'category', 'category_name', 'is_recurring']
        extra_kwargs = {'user': {'read_only': True}}

class ExpenseChangeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseChangeLog
        fields = '__all__'

class IncomeChangeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeChangeLog
        fields = '__all__'
