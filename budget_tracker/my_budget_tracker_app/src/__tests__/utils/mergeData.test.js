import { mergeData } from '../../utils/mergeData'

describe('mergeData', () => {

    it('should merge data correctly when currentData has unique items', () => {
        const currentData = [
            { id: 1, value: 'A' },
            { id: 2, value: 'B' },
        ];
        const pastData = [];

        const result = mergeData(currentData, pastData);

        expect(result).toEqual([
            { id: 1, value: 'A' },
            { id: 2, value: 'B' },
        ]);
    });

    it('should merge data correctly when pastData has unique items', () => {
        const currentData = [];
        const pastData = [
            { id: 1, value: 'A' },
            { id: 2, value: 'B' },
        ];

        const result = mergeData(currentData, pastData);

        expect(result).toEqual([
            { id: 1, value: 'A' },
            { id: 2, value: 'B' },
        ]);
    });

    it('should prioritize currentData items over pastData', () => {
        const currentData = [
            { id: 1, value: 'Current A' },
            { id: 2, value: 'Current B' },
        ];
        const pastData = [
            { id: 1, value: 'Past A' },
            { id: 2, value: 'Past B' },
        ];

        const result = mergeData(currentData, pastData);

        expect(result).toEqual([
            { id: 1, value: 'Current A' },
            { id: 2, value: 'Current B' },
        ]);
    });

    it('should add pastData items if they are not in currentData', () => {
        const currentData = [
            { id: 1, value: 'Current A' },
        ];
        const pastData = [
            { id: 2, value: 'Past B' },
        ];

        const result = mergeData(currentData, pastData);

        expect(result).toEqual([
            { id: 1, value: 'Current A' },
            { id: 2, value: 'Past B' },
        ]);
    });

    it('should return an empty array if both currentData and pastData are empty', () => {
        const currentData = [];
        const pastData = [];

        const result = mergeData(currentData, pastData);

        expect(result).toEqual([]);
    });
});
