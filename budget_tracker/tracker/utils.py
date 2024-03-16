from collections import defaultdict
from datetime import timedelta
from decimal import Decimal
from dateutil.relativedelta import relativedelta

def aggregate_data(queryset, label_field, value_field):
    aggregated_data = defaultdict(float)  # Use default float to auto-initialize amounts to 0
    for entry in queryset:
        label = entry[label_field]
        value = entry[value_field]
        aggregated_data[label] += value  # Sum amounts with the same label
    return list(aggregated_data.items())
def get_effective_month(date, close_card_day):
    if date.day > close_card_day:
        # Expense goes to the month after next month
        effective_date = (date.replace(day=1) + timedelta(days=32)).replace(day=1)
    else:
        # Expense goes to the next month
        effective_date = (date.replace(day=1) + timedelta(days=31)).replace(day=1)
    return effective_date
def calculate_total_payment_with_surcharge(amount, surcharge_percentage):
    P = Decimal(amount)
    S = Decimal(surcharge_percentage) / Decimal(100)
    total_payment = P + (P * S)
    return total_payment

def distribute_installments(expense, close_card_day):
    distributed_payments = defaultdict(list)
    total_payment = calculate_total_payment_with_surcharge(expense.amount, expense.surcharge)
    monthly_payment = total_payment / Decimal(expense.installments)

    for i in range(expense.installments):
        effective_date = expense.date + relativedelta(months=i)
        if effective_date.day > close_card_day:
            effective_date += relativedelta(months=1)
        effective_month = effective_date.replace(day=1)
        distributed_payments[effective_month].append(monthly_payment)
    return distributed_payments