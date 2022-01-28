import {convertTimesToLocal} from './time';

beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

test.each([

    // This is an incorrect test case that demonstrates the issue with this plugin. 10am ET is not 8am pacific time at the refrence time.
    // Additional tests shoudl be written if we find a solution to this.
    {
        test: "Let's meet today at 10am ET",
        expected: "Let's meet `today at 10am ET` *(Wed, Jul 17, 2019 8:00 AM PDT)*",
    },
])('convertTimesToLocal: "$test"', ({test, expected}) => {
    expect(convertTimesToLocal(test, 1563387832493, 'America/Vancouver', 'en')).toEqual(expected);
});

test.each([
    {
        now: new Date('2021-09-08 02:24:57 +0100'),
        test: 'The game is at 12pm UTC',
        expected: 'The game is `at 12pm UTC` *(1:00 PM BST)*',
    },
    {
        now: new Date('2021-12-10 14:16:35 +0000'),
        test: 'Last deploy is Thursday at 11:59pm UTC',
        expected: 'Last deploy is `Thursday at 11:59pm UTC` *(Fri, Aug 27 12:59 AM BST)*',
    },
    {
        now: new Date('2021-12-10 14:16:35 +0000'),
        test: 'Last deploy is at 11:59pm UTC',
        expected: 'Last deploy is `at 11:59pm UTC` *(12:59 AM BST)*',
    },
    {
        now: new Date('2021-12-02 15:00:56 +0000'),
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
        now: new Date('2021-12-02 15:00:56 +0000'),
        test: 'Sunday at 4pm GMT',
        expected: '`Sunday at 4pm GMT` *(Sun, Aug 29 5:00 PM BST)*',
    },

    // Times should still be localized when another time duration is mentioned later in the sentence
    {
        test: 'Today at 16:30 CET and then we will take a 15 minute break',
        expected: '`Today at 16:30 CET` *(Mon, Aug 23, 2021 4:30 PM BST)* and then we will take a 15 minute break',
    },
])('timezoneParsing: "$test"', ({now, test, expected}) => {
    // Some of the library's logic is currently not 'stable', because, for example, we call moment() without arguments
    // A few of our test cases are therefore pinned to specific points-in-time, pending temporal stability
    if (now) {
        jest.setSystemTime(now);
    }
    expect(convertTimesToLocal(test, 1629738610000, 'Europe/London', 'en')).toEqual(expected);
});

test('crossDaylightSavings', () => {
    const testCases = [
        {
            test: 'Today from 2pm - 7pm PDT',
            expected: '`Today from 2pm - 7pm PDT` *(Sat, Oct 30 10:00 PM BST - Sun, Oct 31 2:00 AM GMT)*',
        },
    ];

    testCases.forEach((tc) => {
        jest.setSystemTime(new Date(1638965948000));
        expect(convertTimesToLocal(tc.test, 1635562800000, 'Europe/London', 'en')).toEqual(tc.expected);
    });
});
