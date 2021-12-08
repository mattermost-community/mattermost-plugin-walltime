const chrono = require('chrono-node');
const moment = require('moment-timezone');

const YEAR_DATE_AND_TIME_FORMAT = 'llll';
const DATE_AND_TIME_FORMAT = 'ddd, MMM D LT';
const TIME_FORMAT = 'LT';

// Disable zh-Hant support in the default chrono parser
chrono.casual.parsers = chrono.casual.parsers.filter((parser) => {
    return !parser.constructor.name.startsWith('ZHHant');
});

// Determine display formatting for a parsed time relative to (optional) previous and next parsed times
function relativeRenderingFormat(previous, current, next) {
    const previousMoment = previous ? moment(previous.date()) : moment();
    const currentMoment = moment(current.date());
    const nextMoment = next ? moment(next.date()) : moment();

    let format = YEAR_DATE_AND_TIME_FORMAT;
    if (currentMoment.isSame(previousMoment, 'year')) {
        format = DATE_AND_TIME_FORMAT;
    }
    if (!current.isCertain('day') && !current.isCertain('weekday')) {
        format = TIME_FORMAT;
    }

    // Edge case: if the UTC offset on the next timestamp in the range is different, include the timezone code
    // This can happen if a time range crosses a daylight savings change
    if (next && currentMoment.utcOffset() !== nextMoment.utcOffset()) {
        format += ' z';
    }

    // Include the timezone code on the last formatted timestamp
    if (!next) {
        format += ' z';
    }
    return format;
}

// Render a parsed time relative to (optional) relative parsed time
function renderRelativeTimestamp(previous, current, next, localTimezone, locale) {
    const renderingFormat = relativeRenderingFormat(previous, current, next);
    const renderMoment = moment(current.date()).tz(localTimezone).locale(locale);
    return renderMoment.format(renderingFormat);
}

export function convertTimesToLocal(message, messageCreationTime, localTimezone, locale) {
    const referenceDate = {instant: messageCreationTime, timezone: null};
    const parsedTimes = chrono.parse(message, referenceDate, {forwardDate: true});
    if (!parsedTimes || !parsedTimes.length) {
        return message;
    }
    let localizedMessage = message;

    for (let i = 0, len = parsedTimes.length; i < len; i++) {
        const parsedTime = parsedTimes[i];
        if (!parsedTime.start.isCertain('timezoneOffset')) {
            return message;
        }

        let formattedDisplayDate = renderRelativeTimestamp(null, parsedTime.start, parsedTime.end, localTimezone, locale);
        if (parsedTime.end) {
            formattedDisplayDate += ' - ' + renderRelativeTimestamp(parsedTime.start, parsedTime.end, null, localTimezone, locale);
        }
        localizedMessage = localizedMessage.replace(parsedTime.text, `\`${parsedTime.text}\` *(${formattedDisplayDate})*`);
    }
    return localizedMessage;
}
