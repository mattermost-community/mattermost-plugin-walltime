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
        {
            test: 'Meeting scheduled for 10am GMT+2',
            expected: 'Meeting scheduled for `10am GMT+2` *(9:00 AM BST)*',
        },

        // The word 'now' should not be rendered with a local time, although chrono-node can identify it as a time reference
        {
            test: 'now that is surprising',
            expected: 'now that is surprising',
        },

        // The word 'ah' should not be interpreted as a time interval
        {
            test: 'ah that is surprising',
            expected: 'ah that is surprising',
        },

        // Messages where the source timezone is missing should not be localized
        {
            test: 'tomorrow at 1pm',
            expected: 'tomorrow at 1pm',
        },

        // Mentioning a weekday name should, by default, refer to the next occurrence of that weekday
        {
            test: 'Sunday at 4pm GMT',
            expected: '`Sunday at 4pm GMT` *(Sun, Aug 29 5:00 PM BST)*',
        },
    ];

    testCases.forEach((tc) => {
        expect(convertTimesToLocal(tc.test, 1629738610000, 'Europe/London', 'en')).toEqual(tc.expected);
    });
});
