document.addEventListener('DOMContentLoaded', function() {
    const financialChartElement = document.getElementById('financialOverviewChart');
    const spendingPercentage = parseFloat(financialChartElement.getAttribute('data-spending-percentage'));
    const netPercentage = parseFloat(financialChartElement.getAttribute('data-net-percentage'));
    const creditCardPercentage = parseFloat(financialChartElement.getAttribute('data-credit-card-percentage')); // Assuming you're passing this data attribute

    const ctxFinancialOverview = financialChartElement.getContext('2d');
    const financialOverviewChart = new Chart(ctxFinancialOverview, {
        type: 'bar',
        data: {
            labels: ['Expenses', 'Net', 'Credit Card'],
            datasets: [{
                label: '% of Income',
                data: [spendingPercentage, netPercentage, creditCardPercentage],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)', // For Expenses
                    'rgba(54, 162, 235, 0.2)', // For Net
                    'rgba(255, 206, 86, 0.2)' // For Credit Card
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)', // For Expenses
                    'rgba(54, 162, 235, 1)', // For Net
                    'rgba(255, 206, 86, 1)' // For Credit Card
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // This will make the bar chart horizontal
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return Math.round(value) + '%';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += Math.round(context.parsed.x) + '%';
                            return label;
                        }
                    }
                }
            }
        }
    });
});
