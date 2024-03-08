document.addEventListener('DOMContentLoaded', function() {
    var ctxIncome = document.getElementById('incomeChart').getContext('2d');
    var incomeChart = new Chart(ctxIncome, {
        type: 'pie',
        data: incomeData,
    });

    var ctxExpense = document.getElementById('expenseChart').getContext('2d');
    var expenseChart = new Chart(ctxExpense, {
        type: 'pie',
        data: expenseData,
    });
});
