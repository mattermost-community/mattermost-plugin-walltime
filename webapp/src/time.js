const chrono = require('chrono-node');
const moment = require('moment-timezone');

let DATE_AND_TIME_FORMAT = 'ddd, MMM D LT';
const ZONE_FORMAT = 'z';
const TIME_FORMAT = 'LT';

// Disable zh-Hant support in the default chrono parser
chrono.casual.parsers = chrono.casual.parsers.filter((parser) => {
    return !parser.constructor.name.startsWith('ZHHant');
});

export function convertTimesToLocal(message, messageCreationTime, localTimezone, locale) {
    const parsedTimes = chrono.en.parse(message, new Date(messageCreationTime), {forwardDate: true});
    if (!parsedTimes || !parsedTimes.length) {
        return message;
    }
    let newMessage = message;

    for (let i = 0, len = parsedTimes.length; i < len; i++) {
        const parsedTime = parsedTimes[i];

        const anchorTimezoneStart = parsedTime.start.knownValues.timezoneOffset;
        if (typeof anchorTimezoneStart === 'undefined') {
            return message;
        }

        let formattedDisplayDate;

        const currentUserStartDate = moment(parsedTime.start.date()).tz(localTimezone).locale(locale);
        if (!currentUserStartDate.isSame(moment(), 'year')) {
            DATE_AND_TIME_FORMAT = 'llll';
        }
        if (parsedTime.end) {
            const currentUserEndDate = moment(parsedTime.end.date()).tz(localTimezone).locale(locale);
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
