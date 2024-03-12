document.addEventListener('DOMContentLoaded', function() {
    // Assume you're setting these attributes correctly in your HTML based on the current view context
    const viewingMonth = parseInt(document.body.getAttribute('data-viewing-month'), 10);
    const viewingYear = parseInt(document.body.getAttribute('data-viewing-year'), 10);

    // Recurring data - we're showing this every month
    const recurringIncomeTotal = JSON.parse(document.getElementById('recurring-income-amounts').textContent);
    const recurringExpenseTotal = JSON.parse(document.getElementById('recurring-expense-amounts').textContent);

    // Non-recurring data - filter this based on the viewing month and year
    let nonRecurringIncomeData = JSON.parse(document.getElementById('non-recurring-income-values').textContent);
    let nonRecurringExpenseData = JSON.parse(document.getElementById('non-recurring-expense-values').textContent);

    // Filter non-recurring data for the viewing month and year
    nonRecurringIncomeData = nonRecurringIncomeData.filter(item => item.month === viewingMonth && item.year === viewingYear).map(item => item.amount);
    nonRecurringExpenseData = nonRecurringExpenseData.filter(item => item.month === viewingMonth && item.year === viewingYear).map(item => item.amount);

    // Combine recurring and non-recurring data for the current viewing context
    const combinedIncomeData = nonRecurringIncomeData.concat(recurringIncomeTotal);
    const combinedExpenseData = nonRecurringExpenseData.concat(recurringExpenseTotal);

    // Assuming your labels are correctly set up for each chart
    const incomeLabels = nonRecurringIncomeData.map(item => item.category_name);
    const expenseLabels = nonRecurringExpenseData.map(item => item.category_name);

    const ctxIncomeChart = document.getElementById('incomeChart').getContext('2d');
    new Chart(ctxIncomeChart,{
        type: 'pie',
        data: {
            labels: incomeLabels,
            datasets: [{
                data: combinedIncomeData,
                backgroundColor: ['#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9']
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            return `${label}: $${value.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });

    const ctxExpenseChart = document.getElementById('expenseChart').getContext('2d');
    new Chart(ctxExpenseChart, {
        type: 'pie',
        data: {
            labels: expenseLabels,
            datasets: [{
                data: combinedExpenseData,
                backgroundColor: ['#FFEB3B', '#FFEE58', '#FFF176', '#FFF59D', '#FFF9C4']
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            return `${label}: $${value.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });

    const creditCardData = {
        labels: JSON.parse(document.getElementById('credit-card-data').textContent),
        datasets: [{
            data: JSON.parse(document.getElementById('credit-card-values').textContent),
            backgroundColor: ['#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F']
        }]
    };

    const ctxCreditCard = document.getElementById('creditCardChart').getContext('2d');
    new Chart(ctxCreditCard, {
        type: 'pie',
        data: creditCardData,
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            return `${label}: $${value.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
});