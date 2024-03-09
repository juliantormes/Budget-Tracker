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
                            return `${label}: $${value.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
});