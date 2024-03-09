document.addEventListener('DOMContentLoaded', function() {
    const financialChartElement = document.getElementById('financialOverviewChart');
    const spendingPercentage = parseFloat(financialChartElement.getAttribute('data-spending-percentage'));
    const netPercentage = parseFloat(financialChartElement.getAttribute('data-net-percentage'));

    const ctxFinancialOverview = financialChartElement.getContext('2d');
    const financialOverviewChart = new Chart(ctxFinancialOverview, {
        type: 'bar',
        data: {
            labels: ['Spending', 'Net'],
            datasets: [{
                label: '% of Income',
                data: [spendingPercentage, netPercentage],
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
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
                            // Round the value to the nearest whole number
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
                            // Here we're also rounding the value in the tooltip
                            label += Math.round(context.parsed.x) + '%';
                            return label;
                        }
                    }
                }
            }
        }
    });
});
