from decimal import Decimal

def calculate_total_payment_with_surcharge(amount, surcharge_percentage):
    P = Decimal(amount)
    S = Decimal(surcharge_percentage) / Decimal(100)
    total_payment = P + (P * S)
    return total_payment
