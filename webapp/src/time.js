const chrono = require('chrono-node');
const moment = require('moment-timezone');

let DATE_AND_TIME_FORMAT = 'ddd, MMM D LT';
const ZONE_FORMAT = 'z';
const TIME_FORMAT = 'LT';

// Disable zh-Hant support in the default chrono parser
chrono.casual.parsers = chrono.casual.parsers.filter((parser) => {
    return !parser.constructor.name.startsWith('ZHHant');
});

// Convert a chrono-node result into a timezone-offset-aware momentjs object
function chronoToMoment(result) {
    return moment([
        result.get('year'),
        result.get('month') - 1,
        result.get('day'),
        result.get('hour'),
        result.get('minute'),
        result.get('second'),
        result.get('millisecond'),
    ]).utcOffset(result.get('timezoneOffset'), true);
}

export function convertTimesToLocal(message, messageCreationTime, localTimezone, locale) {
    const referenceDate = {instant: messageCreationTime, timezone: null};
    const parsedTimes = chrono.parse(message, referenceDate, {forwardDate: true});
    if (!parsedTimes || !parsedTimes.length) {
        return message;
    }
    let newMessage = message;

    for (let i = 0, len = parsedTimes.length; i < len; i++) {
        const parsedTime = parsedTimes[i];

        // Workaround: remove the timezone offset when the word "now" is identified as a timestamp
        if (parsedTime.text === 'now') {
            delete parsedTime.start.knownValues.timezoneOffset;
        }

        const anchorTimezoneStart = parsedTime.start.knownValues.timezoneOffset;
        if (typeof anchorTimezoneStart === 'undefined') {
            return message;
        }

        let formattedDisplayDate;

        const currentUserStartDate = chronoToMoment(parsedTime.start).tz(localTimezone).locale(locale);
        if (!currentUserStartDate.isSame(moment(), 'year')) {
            DATE_AND_TIME_FORMAT = 'llll';
        }
        if (parsedTime.end) {
            const currentUserEndDate = chronoToMoment(parsedTime.end).tz(localTimezone).locale(locale);
            if (!currentUserEndDate.isSame(moment(), 'year')) {
                DATE_AND_TIME_FORMAT = 'llll';
            }
            if (currentUserStartDate.isSame(currentUserEndDate, 'day')) {
                formattedDisplayDate = `${currentUserStartDate.format(DATE_AND_TIME_FORMAT)} - ${currentUserEndDate.format(TIME_FORMAT + ' ' + ZONE_FORMAT)}`;
            } else {
                formattedDisplayDate = `${currentUserStartDate.format(DATE_AND_TIME_FORMAT + ' ' + ZONE_FORMAT)} - ${currentUserEndDate.format(DATE_AND_TIME_FORMAT + ' ' + ZONE_FORMAT)}`;
            }
        } else {
            formattedDisplayDate = currentUserStartDate.format(DATE_AND_TIME_FORMAT + ' ' + ZONE_FORMAT);
        }

        const {text} = parsedTime;
        newMessage = `${newMessage.replace(text, `\`${text}\` *(${formattedDisplayDate})*`)}`;
    }

    return newMessage;
}
