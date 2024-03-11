document.addEventListener('DOMContentLoaded', function() {
    const incomeData = {
        labels: JSON.parse(document.getElementById('income-data').textContent),
        datasets: [{
            data: JSON.parse(document.getElementById('income-values').textContent),
            backgroundColor: ['#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9']
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
            backgroundColor: ['#FFEB3B', '#FFEE58', '#FFF176', '#FFF59D', '#FFF9C4']
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
