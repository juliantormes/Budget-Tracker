import { useState, useEffect, useCallback, useMemo } from 'react';
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

    const getExactMatchLog = useCallback((changeLogs, currentDate) => {
        return changeLogs.find(log =>
            log.date.year() === currentDate.year() &&
            log.date.month() === currentDate.month()
        );
    }, []);

    const getClosestLog = useCallback((changeLogs, currentDate) => {
        return changeLogs
            .filter(log => log.date.isBefore(currentDate.startOf('month')))
            .sort((a, b) => b.date.diff(a.date))[0];
    }, []);

    const getEffectiveAmount = useCallback((items, checkDate) => {
        return items.flatMap(item => {
            if (!item.is_recurring) {
                return [{
                    ...item,
                    amount: item.amount,
                }];
            }

            const startDate = dayjs(item.date).startOf('month');

            // Precompute the change logs once to avoid recalculating inside the loop
            const changeLogs = item.change_logs.map(log => ({
                ...log,
                date: dayjs(log.effective_date)
            }));

            const results = [];
            let currentDate = startDate;

            while (currentDate.isBefore(checkDate) || currentDate.isSame(checkDate, 'month')) {
                const exactMatchLog = getExactMatchLog(changeLogs, currentDate);
                const closestLog = getClosestLog(changeLogs, currentDate);

                const effectiveAmount = exactMatchLog ? exactMatchLog.new_amount : closestLog ? closestLog.new_amount : item.amount;

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
    }, [getExactMatchLog, getClosestLog]);

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
    }, [year, month, fetchYearData, getEffectiveAmount]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = fetchData;

    const incomeChartData = useMemo(() => prepareIncomeChartData(data.incomes, year, month, generateVibrantShades([52, 152, 219], 10)), [data.incomes, year, month]);
    const expenseChartData = useMemo(() => prepareExpenseChartData(data.expenses.filter(expense => !expense.credit_card), year, month, generateVibrantShades([46, 204, 113], 10)), [data.expenses, year, month]);
    const creditCardChartData = useMemo(() => prepareCreditCardChartData(data.creditCardExpenses, year, month, generateVibrantShades([231, 76, 60], 10)), [data.creditCardExpenses, year, month]);

    const totalIncome = useMemo(() => calculateTotalIncome(incomeChartData), [incomeChartData]);
    const totalExpenses = useMemo(() => calculateTotalExpenses(expenseChartData), [expenseChartData]);
    const totalCreditCardDebt = useMemo(() => calculateTotalCreditCardDebt(creditCardChartData), [creditCardChartData]);
    const net = useMemo(() => calculateNet(totalIncome, totalExpenses, totalCreditCardDebt), [totalIncome, totalExpenses, totalCreditCardDebt]);
    const percentages = useMemo(() => calculatePercentages(totalIncome, totalExpenses, totalCreditCardDebt, net), [totalIncome, totalExpenses, totalCreditCardDebt, net]);
    const barChartData = useMemo(() => prepareBarChartData(percentages), [percentages]);
    
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
