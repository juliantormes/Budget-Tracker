import dayjs from 'dayjs';
import { getEffectiveAmount, getExactMatchLog, getClosestLog } from '../../utils/financialUtils'

describe('getEffectiveAmount', () => {

    const getItems = () => [
        {
            id: 1,
            is_recurring: false,
            amount: 100,
            date: '2024-01-01',
            change_logs: [],
        },
        {
            id: 2,
            is_recurring: true,
            amount: 200,
            date: '2024-01-01',
            change_logs: [
                { id: 1, effective_date: '2024-02-01', new_amount: 250 },
                { id: 2, effective_date: '2024-03-01', new_amount: 300 }
            ]
        }
    ];

    it('should return original amount for non-recurring items', () => {
        const items = getItems();
        const checkDate = dayjs('2024-01-01');
        const result = getEffectiveAmount(items, checkDate, getExactMatchLog, getClosestLog);

        expect(result[0].amount).toEqual(100); // Non-recurring, original amount
    });

    it('should return original amount for recurring item with no logs before checkDate', () => {
        const items = getItems();
        const checkDate = dayjs('2024-01-01');
        const result = getEffectiveAmount(items, checkDate, getExactMatchLog, getClosestLog);

        expect(result[1].amount).toEqual(200); // Recurring, original amount for January
    });

    it('should return exact match log amount for recurring item', () => {
        const items = getItems();
        const checkDate = dayjs('2024-02-01');
        const result = getEffectiveAmount(items, checkDate, getExactMatchLog, getClosestLog);

        expect(result[1].amount).toEqual(250); // Exact match log for February
    });

    it('should return closest log amount for recurring item', () => {
        const items = getItems();
        const checkDate = dayjs('2024-03-15'); // After the closest log
        const result = getEffectiveAmount(items, checkDate, getExactMatchLog, getClosestLog);

        expect(result[1].amount).toEqual(300); // Closest log for March
    });
});
