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

test('timezoneParsing', () => {
    const testCases = [
        {
            test: 'The game is at 12pm UTC',
            expected: 'The game is `at 12pm UTC` *(1:00 PM BST)*',
        },
        {
            test: 'Last deploy is Thursday at 11:59pm UTC',
            expected: 'Last deploy is `Thursday at 11:59pm UTC` *(Fri, Aug 27 12:59 AM BST)*',
        },
        {
            test: 'Last deploy is at 11:59pm UTC',
            expected: 'Last deploy is `at 11:59pm UTC` *(12:59 AM BST)*',
        },
    ];

    testCases.forEach((tc) => {
        expect(convertTimesToLocal(tc.test, 1629738610000, 'Europe/London', 'en')).toEqual(tc.expected);
    });
});
