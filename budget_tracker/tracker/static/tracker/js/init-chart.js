document.addEventListener('DOMContentLoaded', function() {
    var incomeData = {
        labels: JSON.parse(document.getElementById('income-data').textContent),
        datasets: [{
            data: JSON.parse(document.getElementById('income-values').textContent),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
    };

    var ctxIncome = document.getElementById('incomeChart').getContext('2d');
    new Chart(ctxIncome, {
        type: 'pie',
        data: incomeData,
    });

    var expenseData = {
        labels: JSON.parse(document.getElementById('expense-data').textContent),
        datasets: [{
            data: JSON.parse(document.getElementById('expense-values').textContent),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
    };
    var ctxExpense = document.getElementById('expenseChart').getContext('2d');
    new Chart(ctxExpense, {
        type: 'pie',
        data: expenseData,
    });
});
