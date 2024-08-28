export const generateVibrantShades = (baseColor, numOfShades) => {
    const shades = [];
    const colorStep = 0.6 / numOfShades; // Increase the step for more vibrant shades
    for (let i = 0; i < numOfShades; i++) {
        const alpha = (0.4 + (i * colorStep)).toFixed(2); // Ensure the alpha starts at 0.4 and increases
        const shade = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`;
        shades.push(shade);
    }
    return shades;
};

export const generateConsistentColorMap = (labels, shades) => {
    let colorMap = JSON.parse(localStorage.getItem('colorMap')) || {};

    labels.forEach(label => {
        const formattedLabel = label.toLowerCase(); // Ensure consistent formatting
        if (!colorMap[formattedLabel]) {
            colorMap[formattedLabel] = shades[Object.keys(colorMap).length % shades.length];
        }
    });

    localStorage.setItem('colorMap', JSON.stringify(colorMap));
    return colorMap;
};

export const calculateTotalIncome = (data) => {
    return data.datasets[0].data.reduce((total, value) => total + value, 0);
};

export const calculateTotalExpenses = (data) => {
    return data.datasets[0].data.reduce((total, value) => total + value, 0);
};

export const calculateTotalCreditCardDebt = (data) => {
    return data.datasets[0].data.reduce((total, value) => total + value, 0);
};

export const calculateNet = (totalIncome, totalExpenses, totalCreditCardDebt) => {
    return totalIncome - totalExpenses - totalCreditCardDebt;
};

export const calculatePercentages = (totalIncome, totalExpenses, totalCreditCardDebt, net) => {
    const cashFlowPercentage = (totalExpenses / totalIncome) * 100;
    const creditCardPercentage = (totalCreditCardDebt / totalIncome) * 100;
    const netPercentage = (net / totalIncome) * 100;
    return {
        netPercentage: netPercentage.toFixed(2),
        cashFlowPercentage: cashFlowPercentage.toFixed(2),
        creditCardPercentage: creditCardPercentage.toFixed(2),
    };
};

export const prepareBarChartData = (percentages) => {
    return {
        labels: ['Net', 'Cash Flow', 'Credit Card'],
        datasets: [
            {
                label: 'Financial Overview (%)',
                data: [
                    percentages.netPercentage,
                    percentages.cashFlowPercentage,
                    percentages.creditCardPercentage,
                ],
                backgroundColor: ['rgba([52, 152, 219], 0.6)', 'rgba(46, 204, 113, 0.6)', 'rgba(231, 76, 60, 0.6)'],
                borderColor: ['rgba(52, 152, 219, 1)', 'rgba(46, 204, 113, 1)', 'rgba(231, 76, 60, 1)'],
                borderWidth: 1,
            },
        ],
    };
};

export const prepareIncomeChartData = (incomes, year, month, shades) => {
    const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;
    
    const nonRecurringIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        const incomeMonth = `${incomeDate.getFullYear()}-${String(incomeDate.getMonth() + 1).padStart(2, '0')}`;
        return !income.is_recurring && incomeMonth === formattedMonth;
    });

    const recurringIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        const incomeMonth = `${incomeDate.getFullYear()}-${String(incomeDate.getMonth() + 1).padStart(2, '0')}`;
        return income.is_recurring && incomeMonth <= formattedMonth;
    }).map(income => {
        // Determine the correct amount to use based on the effective amount and the original amount
        const amountToUse = parseFloat(income.effective_amount || income.amount);
        return {
            ...income,
            amount: amountToUse < income.amount ? amountToUse : income.amount // Use the smaller, correct amount
        };
    });

    const processedIncomes = [...nonRecurringIncomes, ...recurringIncomes];
    const sumsByCategory = processedIncomes.reduce((acc, income) => {
        const category = (income.category_name || 'Undefined Category').toLowerCase(); // Ensure consistent formatting
        acc[category] = (acc[category] || 0) + parseFloat(income.amount || 0);
        return acc;
    }, {});

    const labels = Object.keys(sumsByCategory);
    const data = Object.values(sumsByCategory);
    const colorMap = generateConsistentColorMap(labels, shades);

    return {
        labels,
        datasets: [{
            label: 'Incomes',
            data,
            backgroundColor: labels.map(label => colorMap[label.toLowerCase()]), // Ensure consistent formatting
            borderColor: ['#4b4b4b'],
            borderWidth: 1,
        }]
    };
};



export const prepareExpenseChartData = (expenses, year, month, shades) => {
    const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;
    
    const nonRecurringExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        return !expense.is_recurring && expenseMonth === formattedMonth;
    });

    const recurringExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        return expense.is_recurring && expenseMonth <= formattedMonth;
    }).map(expense => {
        // Determine the correct amount to use based on the effective amount and the original amount
        const amountToUse = parseFloat(expense.effective_amount || expense.amount);
        return {
            ...expense,
            amount: amountToUse < expense.amount ? amountToUse : expense.amount // Use the smaller, correct amount
        };
    });

    const processedExpenses = [...nonRecurringExpenses, ...recurringExpenses];
    const sumsByCategory = processedExpenses.reduce((acc, expense) => {
        const category = (expense.category_name || 'Undefined Category').toLowerCase(); // Ensure consistent formatting
        acc[category] = (acc[category] || 0) + parseFloat(expense.amount || 0);
        return acc;
    }, {});

    const labels = Object.keys(sumsByCategory);
    const data = Object.values(sumsByCategory);
    const colorMap = generateConsistentColorMap(labels, shades);

    return {
        labels,
        datasets: [{
            label: 'Expenses',
            data,
            backgroundColor: labels.map(label => colorMap[label.toLowerCase()]), // Ensure consistent formatting
            borderColor: ['#4b4b4b'],
            borderWidth: 1,
        }]
    };
};


export const prepareCreditCardChartData = (expenses, year, month, shades) => {
    const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;
    const processedExpenses = [];

    expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const closingDay = expense.credit_card.close_card_day;
        const surchargeRate = parseFloat(expense.surcharge || 0) / 100;
        const totalAmountWithSurcharge = parseFloat(expense.amount) * (1 + surchargeRate);

        let startMonth;
        if (expenseDate.getDate() <= closingDay) {
            startMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 1);
        } else {
            startMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 2, 1);
        }

        if (expense.is_recurring) {
            // Handle recurring expenses (installments = 1)
            const formattedInstallmentMonth = `${startMonth.getFullYear()}-${String(startMonth.getMonth() + 1).padStart(2, '0')}`;
            if (formattedInstallmentMonth <= formattedMonth) {
                processedExpenses.push({
                    ...expense,
                    month: formattedMonth,
                    amount: totalAmountWithSurcharge,
                });
            }
        } else if (expense.installments > 1) {
            for (let i = 0; i < expense.installments; i++) {
                const installmentMonth = new Date(startMonth);
                installmentMonth.setMonth(startMonth.getMonth() + i);
                const formattedInstallmentMonth = `${installmentMonth.getFullYear()}-${String(installmentMonth.getMonth() + 1).padStart(2, '0')}`;
                processedExpenses.push({
                    ...expense,
                    month: formattedInstallmentMonth,
                    amount: totalAmountWithSurcharge / expense.installments,
                });
            }
        } else {
            processedExpenses.push({
                ...expense,
                month: startMonth.getMonth() + 1 === month ? formattedMonth : '', // Ensure it only appears in the correct month
                amount: totalAmountWithSurcharge,
            });
        }
    });

    // Filter expenses to include only those for the current month
    const filteredExpenses = processedExpenses.filter(expense => expense.month === formattedMonth);
    const chartData = filteredExpenses.reduce((acc, expense) => {
        const label = `${expense.credit_card.brand} ending in ${expense.credit_card.last_four_digits}`.toLowerCase(); // Ensure consistent formatting
        const categoryIndex = acc.labels.indexOf(label);
        if (categoryIndex === -1) {
            acc.labels.push(label);
            acc.data.push(expense.amount);
        } else {
            acc.data[categoryIndex] += expense.amount;
        }
        return acc;
    }, { labels: [], data: [] });

    const colorMap = generateConsistentColorMap(chartData.labels, shades);

    return {
        labels: chartData.labels,
        datasets: [{
            label: 'Credit Card Expenses',
            data: chartData.data,
            backgroundColor: chartData.labels.map(label => colorMap[label.toLowerCase()]), // Ensure consistent formatting
            borderColor: ['#4b4b4b']
        }]
    };
};


export const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        tooltip: {
            callbacks: {
                label: function (context) {
                    return `${context.label}: $${context.parsed.toLocaleString()}`;
                }
            }
        },
        legend: {
            labels: {
                color: 'white' // Set legend text color to white
            }
        }
    },
    layout: {
        padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
        }
    },
    elements: {
        arc: {
            backgroundColor: generateVibrantShades([34, 98, 177], 10),
            borderColor: '#1f2a40' // Example border color for pie slices
        }
    }
};

export const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
        tooltip: {
            callbacks: {
                label: function (context) {
                    return `${context.label}: ${context.raw.toLocaleString()}%`;
                }
            }
        },
        legend: {
            labels: {
                color: 'white' // Set legend text color to white
            }
        }
    },
    layout: {
        padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
        }
    },
    scales: {
        x: {
            ticks: {
                color: 'white' // Set x-axis tick color to white
            },
            grid: {
                color: '#444' // Set x-axis grid color
            }
        },
        y: {
            ticks: {
                color: 'white' // Set y-axis tick color to white
            },
            grid: {
                color: '#444' // Set y-axis grid color
            }
        }
    }
};
