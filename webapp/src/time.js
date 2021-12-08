const chrono = require('chrono-node');
const moment = require('moment-timezone');

const YEAR_DATE_AND_TIME_FORMAT = 'llll';
const DATE_AND_TIME_FORMAT = 'ddd, MMM D LT';
const ZONE_FORMAT = 'z';
const TIME_FORMAT = 'LT';

// Disable zh-Hant support in the default chrono parser
chrono.casual.parsers = chrono.casual.parsers.filter((parser) => {
    return !parser.constructor.name.startsWith('ZHHant');
});

// Determine display formatting for a parsed time relative to an (optional) previous parsed time
function relativeRenderingFormat(current, previous) {
    const currentMoment = moment(current.date());
    const previousMoment = previous ? moment(previous.date()) : moment();

    let format = YEAR_DATE_AND_TIME_FORMAT;
    if (currentMoment.isSame(previousMoment, 'year')) {
        format = DATE_AND_TIME_FORMAT;
    }
    if (!current.isCertain('day') && !current.isCertain('weekday')) {
        format = TIME_FORMAT;
    }
    return format + ' ' + ZONE_FORMAT;
}

// Render a parsed time relative to an (optional) previous parsed time
function renderRelativeTimestamp(current, previous, localTimezone, locale) {
    const renderingFormat = relativeRenderingFormat(current, previous);
    const renderMoment = moment(current.date()).tz(localTimezone).locale(locale);
    return renderMoment.format(renderingFormat);
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

        if (!parsedTime.start.isCertain('timezoneOffset')) {
            return message;
        }

        let formattedDisplayDate = renderRelativeTimestamp(parsedTime.start, null, localTimezone, locale);
        if (parsedTime.end) {
            formattedDisplayDate += ' - ' + renderRelativeTimestamp(parsedTime.end, parsedTime.start, localTimezone, locale);
        }

        const {text} = parsedTime;
        newMessage = `${newMessage.replace(text, `\`${text}\` *(${formattedDisplayDate})*`)}`;
    }

    return newMessage;
}
