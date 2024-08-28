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

    const getEffectiveAmount = (items, checkDate) => {
        console.log(`Calculating effective amounts for check date: ${checkDate.format('YYYY-MM-DD')}`);
        
        return items.map(item => {
            console.log(`Processing item with ID: ${item.id} and original amount: ${item.amount}`);
            
            // Only check for effective amounts if the item is recurring
            if (!item.is_recurring) {
                console.log(`Item ID ${item.id} is not recurring. Using original amount: ${item.amount}`);
                return {
                    ...item,
                    amount: item.amount,
                };
            }
    
            const startOfCheckMonth = checkDate.startOf('month');
            console.log(`Start of check month: ${startOfCheckMonth.format('YYYY-MM-DD')}`);
    
            const exactMatchLog = item.change_logs
                ? item.change_logs.find(log =>
                    dayjs(log.effective_date).year() === checkDate.year() &&
                    dayjs(log.effective_date).month() === checkDate.month()
                )
                : null;
    
            if (exactMatchLog) {
                console.log(`Exact match found for item ID ${item.id}: ${exactMatchLog.new_amount} effective on ${exactMatchLog.effective_date}`);
                return {
                    ...item,
                    amount: exactMatchLog.new_amount,
                };
            }
    
            const closestLog = item.change_logs
                ? item.change_logs
                    .filter(log => dayjs(log.effective_date).isBefore(startOfCheckMonth))
                    .sort((a, b) => dayjs(b.effective_date).diff(dayjs(a.effective_date)))[0]
                : null;
    
            if (closestLog) {
                console.log(`Closest log found for item ID ${item.id}: ${closestLog.new_amount} effective on ${closestLog.effective_date}`);
            } else {
                console.log(`No relevant change log found for item ID ${item.id}. Using original amount: ${item.amount}`);
            }
    
            return {
                ...item,
                amount: closestLog ? closestLog.new_amount : item.amount,
            };
        });
    };
    
    
    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            console.log(`Fetching data for year: ${year}, month: ${month}`);
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
            console.log(`Check date set to: ${checkDate.format('YYYY-MM-DD')}`);

            setData({
                incomes: getEffectiveAmount(allIncomes, checkDate),
                expenses: getEffectiveAmount(allExpenses, checkDate),
                creditCardExpenses: allCreditCardExpenses,  // Assuming credit card expenses don't need the same treatment
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
    console.log("Income Chart Data:", incomeChartData);
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
