import { useState, useEffect, useCallback } from 'react';
import pLimit from 'p-limit';
import { useFetchYearData } from './useFetchYearData';
import { mergeData } from '../utils/mergeData';
import {
    generateVibrantShades,
    prepareBarChartData,
    prepareIncomeChartData,
    prepareExpenseChartData,
    prepareCreditCardChartData,
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateTotalCreditCardDebt,
    calculateNet,
    calculatePercentages
} from '../utils/chartUtils';
import dayjs from 'dayjs';

export function useFetchFinancialData(year, month) {
    const [data, setData] = useState({ incomes: [], expenses: [], creditCardExpenses: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchYearData = useFetchYearData();

    const generateMonthlyData = (item, startDate, endDate) => {
        const results = [];
        let currentDate = startDate;

        while (currentDate.isBefore(endDate)) {
            const exactMatchLog = item.change_logs.find(log =>
                dayjs(log.effective_date).year() === currentDate.year() &&
                dayjs(log.effective_date).month() === currentDate.month()
            );

            const closestLog = item.change_logs
                .filter(log => dayjs(log.effective_date).isBefore(currentDate.startOf('month')))
                .sort((a, b) => dayjs(b.effective_date).diff(dayjs(a.effective_date)))[0];

            const effectiveAmount = exactMatchLog ? exactMatchLog.new_amount : closestLog ? closestLog.new_amount : item.amount;

            results.push({
                ...item,
                date: currentDate.format('YYYY-MM-DD'),
                amount: effectiveAmount
            });

            currentDate = currentDate.add(1, 'month');
        }

        return results;
    };

    const getEffectiveAmount = (items, checkDate) => {
        return items.flatMap(item => {
            if (!item.is_recurring) {
                return [{
                    ...item,
                    amount: item.amount,
                }];
            }
    
            const startDate = dayjs(item.date).startOf('month');
    
            // Ensure we generate data only for the months between the start date and the check date
            const results = [];
            let currentDate = startDate;
    
            while (currentDate.isBefore(checkDate) || currentDate.isSame(checkDate, 'month')) {
                const exactMatchLog = item.change_logs.find(log =>
                    dayjs(log.effective_date).year() === currentDate.year() &&
                    dayjs(log.effective_date).month() === currentDate.month()
                );
    
                const closestLog = item.change_logs
                    .filter(log => dayjs(log.effective_date).isBefore(currentDate.startOf('month')))
                    .sort((a, b) => dayjs(b.effective_date).diff(dayjs(a.effective_date)))[0];
    
                const effectiveAmount = exactMatchLog ? exactMatchLog.new_amount : closestLog ? closestLog.new_amount : item.amount;
    
                // Only push the entry for the specific month being checked (avoid accumulating amounts)
                if (currentDate.isSame(checkDate, 'month')) {
                    results.push({
                        ...item,
                        date: currentDate.format('YYYY-MM-DD'),
                        amount: effectiveAmount
                    });
                }
    
                currentDate = currentDate.add(1, 'month');
            }
    
            return results;
        });
    };
    

    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            const limit = pLimit(5);

            const currentYearData = await fetchYearData(year);

            const maxInstallments = currentYearData.expenses.reduce((max, expense) => {
                return Math.max(max, expense.installments || 0);
            }, 0);

            const yearsToFetch = Math.ceil(maxInstallments / 12);

            let pastDataResults = [];
            if (yearsToFetch > 0) {
                const pastYears = [];
                for (let i = 1; i <= yearsToFetch; i++) {
                    pastYears.push(year - i);
                }

                const pastDataPromises = pastYears.map((y) => limit(() => fetchYearData(y)));
                pastDataResults = await Promise.all(pastDataPromises);
            }

            const allIncomes = mergeData(currentYearData.incomes, pastDataResults.flatMap(res => res.incomes || []));
            const allExpenses = mergeData(currentYearData.expenses, pastDataResults.flatMap(res => res.expenses || []));
            const allCreditCardExpenses = mergeData(currentYearData.creditCardExpenses, pastDataResults.flatMap(res => res.creditCardExpenses || []));

            const checkDate = dayjs(new Date(year, month - 1, 1));  // Define check date based on year and month

            setData({
                incomes: getEffectiveAmount(allIncomes, checkDate),
                expenses: getEffectiveAmount(allExpenses, checkDate),
                creditCardExpenses: allCreditCardExpenses,
            });

        } catch (error) {
            console.error('Failed to fetch financial data:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [year, month, fetchYearData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = fetchData;

    const incomeChartData = prepareIncomeChartData(data.incomes, year, month, generateVibrantShades([52, 152, 219], 10));
    const expenseChartData = prepareExpenseChartData(data.expenses.filter(expense => !expense.credit_card), year, month, generateVibrantShades([46, 204, 113], 10));
    const creditCardChartData = prepareCreditCardChartData(data.creditCardExpenses, year, month, generateVibrantShades([231, 76, 60], 10));

    const totalIncome = calculateTotalIncome(incomeChartData);
    const totalExpenses = calculateTotalExpenses(expenseChartData);
    const totalCreditCardDebt = calculateTotalCreditCardDebt(creditCardChartData);
    const net = calculateNet(totalIncome, totalExpenses, totalCreditCardDebt);
    const percentages = calculatePercentages(totalIncome, totalExpenses, totalCreditCardDebt, net);
    const barChartData = prepareBarChartData(percentages);
    
    return { 
        data, 
        loading, 
        error, 
        refetch, 
        incomeChartData, 
        expenseChartData, 
        creditCardChartData, 
        totalIncome, 
        totalExpenses, 
        totalCreditCardDebt, 
        net, 
        barChartData 
    };
}
