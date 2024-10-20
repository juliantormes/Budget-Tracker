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
    prepareCreditCardChartData
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
afterEach(() => {
    localStorageMock = {};  // Clear the mock storage after each test
    jest.restoreAllMocks(); // Restore original functions after each test
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
            { id: 1, category_name: 'Salary', amount: 1000, date: '2024-01-01T00:00:00Z', is_recurring: false },  // Ensure date is in ISO format
            { id: 2, category_name: 'Bonus', amount: 500, date: '2024-01-01T00:00:00Z', is_recurring: false },
        ];
        const year = 2024;
        const month = 1;
        const shades = ['rgba(52, 152, 219, 0.6)', 'rgba(46, 204, 113, 0.6)'];
        const result = prepareIncomeChartData(incomes, year, month, shades);

        console.log(result); // Debugging output to inspect the returned result

        expect(result.labels).toEqual(['salary', 'bonus']); // Labels are case-insensitive and lowercase
        expect(result.datasets[0].data).toEqual([1000, 500]); // Data sums
        expect(result.datasets[0].backgroundColor).toEqual(['rgba(52, 152, 219, 0.6)', 'rgba(46, 204, 113, 0.6)']); // Shades applied
    });
});
describe('prepareExpenseChartData', () => {
    it('should prepare expense chart data correctly', () => {
        const expenses = [
            { id: 1, category_name: 'Groceries', amount: 500, date: '2024-01-01', is_recurring: false },
            { id: 2, category_name: 'Rent', amount: 1500, date: '2024-01-01', is_recurring: true, effective_amount: 1600 },
        ];
        const year = 2024;
        const month = 1;
        const shades = ['rgba(52, 152, 219, 0.6)', 'rgba(46, 204, 113, 0.6)'];

        const result = prepareExpenseChartData(expenses, year, month, shades);

        console.log(result); // Debugging output to inspect the returned result

        expect(result.labels).toEqual(['groceries', 'rent']); // Labels are case-insensitive and lowercase
        expect(result.datasets[0].data).toEqual([500, 1600]); // Data should correctly apply the effective amount for recurring
        expect(result.datasets[0].backgroundColor).toEqual(['rgba(52, 152, 219, 0.6)', 'rgba(46, 204, 113, 0.6)']); // Shades applied
    });
});
describe('prepareCreditCardChartData', () => {
    it('should prepare credit card chart data correctly', () => {
        const expenses = [
            { id: 1, category_name: 'Groceries', amount: 500, date: '2024-01-01', credit_card: { brand: 'Visa', last_four_digits: '1234' }, installments: 3, surcharge: '10.00' },
            { id: 2, category_name: 'Subscriptions', amount: 100, date: '2024-01-15', credit_card: { brand: 'Mastercard', last_four_digits: '5678' }, installments: 1, surcharge: '5.00' },
        ];
        const year = 2024;
        const month = 1;
        const shades = ['rgba(52, 152, 219, 0.6)', 'rgba(46, 204, 113, 0.6)'];

        const result = prepareCreditCardChartData(expenses, year, month, shades);

        console.log(result); // Debugging output to inspect the returned result

        expect(result.labels).toEqual(['visa ending in 1234', 'mastercard ending in 5678']); // Labels should reflect the credit card brands
        expect(result.datasets[0].data).toEqual([165.00, 105.00]); // Amounts should include surcharge and be distributed across installments
        expect(result.datasets[0].backgroundColor).toEqual(['rgba(52, 152, 219, 0.6)', 'rgba(46, 204, 113, 0.6)']); // Shades applied
    });
});

describe('prepareBarChartData', () => {
    it('should prepare bar chart data correctly', () => {
        const percentages = {
            netPercentage: '40.00',
            cashFlowPercentage: '30.00',
            creditCardPercentage: '30.00',
        };

        const result = prepareBarChartData(percentages);

        console.log(result); // Debugging output to inspect the returned result

        expect(result.labels).toEqual(['Net', 'Cash Flow', 'Credit Card']); // Labels should be correct
        expect(result.datasets[0].data).toEqual(["40.00", "30.00", "30.00"]); // Data should match percentages
        expect(result.datasets[0].backgroundColor).toEqual([
            'rgba([52, 152, 219], 0.6)',
            'rgba(46, 204, 113, 0.6)',
            'rgba(231, 76, 60, 0.6)'
        ]); // Correct colors should be applied
    });
});

