document.addEventListener('DOMContentLoaded', function() {
    const viewingMonth = parseInt(document.body.getAttribute('data-viewing-month'), 10);
    const viewingYear = parseInt(document.body.getAttribute('data-viewing-year'), 10);

    // Income Chart
    const incomeData = {
        labels: JSON.parse(document.getElementById('income-labels').textContent),
        datasets: [{
            data: JSON.parse(document.getElementById('income-data').textContent),
            backgroundColor: ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585']
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
            backgroundColor: ['#6b4c9a', '#f28e2b', '#59a14f', '#edc948', '#b07aa1']
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
            backgroundColor: ['#76b7b2', '#ff9da7', '#9c755f', '#bab0ac', '#d67236']
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
