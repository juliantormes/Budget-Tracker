import { 
    generateVibrantShades, 
    generateConsistentColorMap, 
    calculateTotalIncome, 
    calculateTotalExpenses, 
    calculateTotalCreditCardDebt, 
    calculateNet, 
    calculatePercentages, 
    prepareBarChartData, 
    prepareIncomeChartData, 
    prepareExpenseChartData, 
    prepareCreditCardChartData, 
    pieChartOptions, 
    barChartOptions 
} from '../../utils/chartUtils'; // Adjust the path according to your folder structure
import { jest } from '@jest/globals';

// If you are testing functions that use `localStorage`, you can mock it like this:
let localStorageMock = {};

beforeEach(() => {
    localStorageMock = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => localStorageMock[key] || null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
        localStorageMock[key] = value;
    });
});

describe('generateVibrantShades', () => {
    it('should generate the correct number of shades', () => {
        const baseColor = [34, 98, 177];
        const numOfShades = 5;
        const shades = generateVibrantShades(baseColor, numOfShades);
        expect(shades.length).toBe(numOfShades);
    });

    it('should return shades with alpha values between 0.4 and 1.0', () => {
        const baseColor = [34, 98, 177];
        const numOfShades = 5;
        const shades = generateVibrantShades(baseColor, numOfShades);
        shades.forEach((shade, index) => {
            const alpha = parseFloat(shade.match(/rgba\(.*,(.*)\)/)[1].trim());
            expect(alpha).toBeGreaterThanOrEqual(0.4);
            expect(alpha).toBeLessThanOrEqual(1);
        });
    });
});
describe('generateConsistentColorMap', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should generate a color map for new labels', () => {
        const labels = ['Income', 'Expense'];
        const shades = ['rgba(34, 98, 177, 0.4)', 'rgba(34, 98, 177, 0.6)'];
        const colorMap = generateConsistentColorMap(labels, shades);
        expect(Object.keys(colorMap)).toEqual(['income', 'expense']);
        expect(colorMap.income).toBe(shades[0]);
        expect(colorMap.expense).toBe(shades[1]);
    });

    it('should store and retrieve the color map from localStorage', () => {
        const labels = ['Income', 'Expense'];
        const shades = ['rgba(34, 98, 177, 0.4)', 'rgba(34, 98, 177, 0.6)'];
        const colorMap = generateConsistentColorMap(labels, shades);
        localStorage.setItem('colorMap', JSON.stringify(colorMap));
        const storedColorMap = JSON.parse(localStorage.getItem('colorMap'));
        expect(storedColorMap).not.toBeNull();
        expect(storedColorMap).toHaveProperty('income');
        expect(storedColorMap).toHaveProperty('expense');
    });
});
describe('calculateTotalIncome', () => {
    it('should calculate the total income', () => {
        const data = { datasets: [{ data: [100, 200, 300] }] };
        const total = calculateTotalIncome(data);
        expect(total).toBe(600);
    });
});

describe('calculateTotalExpenses', () => {
    it('should calculate the total expenses', () => {
        const data = { datasets: [{ data: [50, 150, 200] }] };
        const total = calculateTotalExpenses(data);
        expect(total).toBe(400);
    });
});

describe('calculateTotalCreditCardDebt', () => {
    it('should calculate the total credit card debt', () => {
        const data = { datasets: [{ data: [20, 30, 50] }] };
        const total = calculateTotalCreditCardDebt(data);
        expect(total).toBe(100);
    });
});
describe('calculateNet', () => {
    it('should calculate the net balance', () => {
        const totalIncome = 1000;
        const totalExpenses = 400;
        const totalCreditCardDebt = 200;
        const net = calculateNet(totalIncome, totalExpenses, totalCreditCardDebt);
        expect(net).toBe(400);
    });
});
describe('calculatePercentages', () => {
    it('should calculate percentages correctly', () => {
        const totalIncome = 1000;
        const totalExpenses = 400;
        const totalCreditCardDebt = 200;
        const net = 400;
        const percentages = calculatePercentages(totalIncome, totalExpenses, totalCreditCardDebt, net);
        expect(percentages.cashFlowPercentage).toBe('40.00');
        expect(percentages.creditCardPercentage).toBe('20.00');
        expect(percentages.netPercentage).toBe('40.00');
    });
});
describe('prepareIncomeChartData', () => {
    it('should prepare income chart data correctly', () => {
        const incomes = [
            { id: 1, category_name: 'Salary', amount: 1000, date: '2024-01-01', is_recurring: false },
            { id: 2, category_name: 'Bonus', amount: 500, date: '2024-01-01', is_recurring: false },
        ];
        const year = 2024;
        const month = 1;
        const shades = ['rgba(52, 152, 219, 0.6)', 'rgba(46, 204, 113, 0.6)'];
    
        const result = prepareIncomeChartData(incomes, year, month, shades);
    
        console.log(result); // Debugging output
    
        expect(result.labels).toEqual(['salary', 'bonus']); // Labels are case-insensitive and lowercase
        expect(result.datasets[0].data).toEqual([1000, 500]); // Data sums
        expect(result.datasets[0].backgroundColor).toEqual(['rgba(52, 152, 219, 0.6)', 'rgba(46, 204, 113, 0.6)']); // Shades applied
    });
});



