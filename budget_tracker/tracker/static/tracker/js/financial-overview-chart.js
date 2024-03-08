document.addEventListener('DOMContentLoaded', function() {
    var financialChartElement = document.getElementById('financialOverviewChart');
    var spendingPercentage = parseFloat(financialChartElement.getAttribute('data-spending-percentage'));
    var netPercentage = parseFloat(financialChartElement.getAttribute('data-net-percentage'));

    var ctxFinancialOverview = financialChartElement.getContext('2d');
    var financialOverviewChart = new Chart(ctxFinancialOverview, {
        type: 'bar', // Use 'bar' type for Chart.js 3 or later
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
            indexAxis: 'y', // Ensures the bar chart is horizontal
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) { return value + "%" }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.parsed.x + '%';
                        }
                    }
                }
            }
        }
    });
});