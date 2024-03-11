document.addEventListener('DOMContentLoaded', function() {
    const incomeData = {
        labels: JSON.parse(document.getElementById('income-data').textContent),
        datasets: [{
            data: JSON.parse(document.getElementById('income-values').textContent),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
    };

    const ctxIncome = document.getElementById('incomeChart').getContext('2d');
    new Chart(ctxIncome, {
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

    const expenseData = {
        labels: JSON.parse(document.getElementById('expense-data').textContent),
        datasets: [{
            data: JSON.parse(document.getElementById('expense-values').textContent),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
    };

    const ctxExpense = document.getElementById('expenseChart').getContext('2d');
    new Chart(ctxExpense, {
        type: 'pie',
        data: expenseData,
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = (value / total * 100).toFixed(2);
                            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Setup for credit card chart
    const creditCardData = {
        labels: JSON.parse(document.getElementById('credit-card-data').textContent),
        datasets: [{
            data: JSON.parse(document.getElementById('credit-card-values').textContent),
            backgroundColor: ['#4BC0C0', '#FFCD56', '#FF6384', '#36A2EB', '#9966FF', '#C9CB3A']
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
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = (value / total * 100).toFixed(2);
                            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
});
