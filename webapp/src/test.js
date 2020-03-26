import {convertTimesToLocal} from './time';

test('convertTimesToLocal', () => {
    const testCases = [

        // This is an incorrect test case that demonstrates the issue with this plugin. 10am ET is not 8am pacific time at the refrence time.
        // Additional tests shoudl be written if we find a solution to this.
        {
            test: "Let's meet today at 10am ET",
            expected: "Let's meet `today at 10am ET` *(Wed, Jul 17, 2019 8:00 AM PDT)*",
        },
    ];

    testCases.forEach((tc) => {
        expect(convertTimesToLocal(tc.test, 1563387832493, 'America/Vancouver', 'en')).toEqual(tc.expected);
    });
});
