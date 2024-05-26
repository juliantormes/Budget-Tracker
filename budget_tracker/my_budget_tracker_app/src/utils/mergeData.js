export function mergeData(currentData, pastData) {
    const uniqueData = new Map();
    currentData.forEach(item => uniqueData.set(item.id, item));
    pastData.forEach(item => {
        if (!uniqueData.has(item.id)) {
            uniqueData.set(item.id, item);
        }
    });
    return Array.from(uniqueData.values());
}
