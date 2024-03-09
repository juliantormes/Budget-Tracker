document.addEventListener('DOMContentLoaded', function() {
    var ctxIncome = document.getElementById('incomeChart').getContext('2d');
    var ctxExpense = document.getElementById('expenseChart').getContext('2d');

    new Chart(ctxIncome, {
        type: 'pie',
        data: incomeData,
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            var label = context.label || '';
                            var value = context.parsed;
                            return label + ': $' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    new Chart(ctxExpense, {
        type: 'pie',
        data: expenseData,
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            var label = context.label || '';
                            var value = context.parsed;
                            var total = context.dataset.data.reduce((a, b) => a + b, 0);
                            var percentage = (value / total * 100).toFixed(2);
                            return label + ': $' + value.toLocaleString() + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
});
