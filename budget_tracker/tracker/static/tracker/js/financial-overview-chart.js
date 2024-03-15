document.addEventListener('DOMContentLoaded', function() {
    const financialChartElement = document.getElementById('financialOverviewChart');
    const cash_flow_percentage = parseFloat(financialChartElement.getAttribute('data-cash-flow-percentage'));
    const creditCardPercentage = parseFloat(financialChartElement.getAttribute('data-credit-card-percentage'));
    const netPercentage = parseFloat(financialChartElement.getAttribute('data-net-percentage'));

    const ctxFinancialOverview = financialChartElement.getContext('2d');
    const financialOverviewChart = new Chart(ctxFinancialOverview, {
        type: 'bar',
        data: {
            labels: ['Cash Flow', 'Credit Card', 'Net'],
            datasets: [{
                label: '% of Income',
                data: [cash_flow_percentage, creditCardPercentage, netPercentage],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)', // For Cash Flow
                    'rgba(255, 206, 86, 0.2)', // For Credit Card
                    'rgba(54, 162, 235, 0.2)' // For Net
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)', // For Cash Flow
                    'rgba(255, 206, 86, 1)',// For Credit Card
                    'rgba(54, 162, 235, 1)'// For Net
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
                            label += parseFloat(context.parsed.x).toFixed(2) + '%';
                            return label;
                        }
                    }
                }
            }
        }
    });
});
