document.addEventListener('DOMContentLoaded', function() {
    const viewingMonth = parseInt(document.body.getAttribute('data-viewing-month'), 10);
    const viewingYear = parseInt(document.body.getAttribute('data-viewing-year'), 10);

    // Income Chart
    const incomeData = {
        labels: JSON.parse(document.getElementById('income-labels').textContent),
        datasets: [{
            data: JSON.parse(document.getElementById('income-data').textContent),
            backgroundColor: ['#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9']
        }]
    };
    const incomeChartCtx = document.getElementById('incomeChart').getContext('2d');
    new Chart(incomeChartCtx, {
        type: 'pie',
        data: incomeData,
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

    // Expense Chart
    const expenseData = {
        labels: JSON.parse(document.getElementById('expense-labels').textContent),
        datasets: [{
            data: JSON.parse(document.getElementById('expense-data').textContent),
            backgroundColor: ['#FFEB3B', '#FFEE58', '#FFF176', '#FFF59D', '#FFF9C4']
        }]
    };
    const expenseChartCtx = document.getElementById('expenseChart').getContext('2d');
    new Chart(expenseChartCtx, {
        type: 'pie',
        data: expenseData,
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

    // Credit Card Chart
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
