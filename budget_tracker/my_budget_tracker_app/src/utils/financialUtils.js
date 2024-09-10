import dayjs from 'dayjs';

export const getExactMatchLog = (changeLogs, currentDate) => {
    return changeLogs.find(log =>
        log.date.year() === currentDate.year() && log.date.month() === currentDate.month()
    );
};

export const getClosestLog = (changeLogs, currentDate) => {
    return changeLogs
        .filter(log => log.date.isBefore(currentDate.startOf('month')))
        .sort((a, b) => b.date.diff(a.date))[0];
};

export const getEffectiveAmount = (items, checkDate, getExactMatchLog, getClosestLog) => {
    return items.flatMap(item => {
        if (!item.is_recurring) {
            return [{ ...item, amount: item.amount }];
        }

        const startDate = dayjs(item.date).startOf('month');
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
};
