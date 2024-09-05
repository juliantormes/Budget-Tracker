# Generated by Django 5.0.3 on 2024-08-27 04:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracker', '0025_alter_expense_category_alter_expense_credit_card_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='incomechangelog',
            name='income',
        ),
        migrations.CreateModel(
            name='RecurringChangeLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('effective_date', models.DateField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expense', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='recurring_change_logs', to='tracker.expense')),
                ('income', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='recurring_change_logs', to='tracker.income')),
            ],
        ),
        migrations.DeleteModel(
            name='ExpenseChangeLog',
        ),
        migrations.DeleteModel(
            name='IncomeChangeLog',
        ),
    ]