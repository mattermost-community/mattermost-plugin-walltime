const chrono = require('chrono-node');
const marked = require('marked');
const moment = require('moment-timezone');

const DATE_AND_TIME_FORMAT = 'ddd, MMM D LT';
const ZONE_FORMAT = 'z';
const TIME_FORMAT = 'LT';
const DATE_FORMAT = 'llll';

// Disable zh-Hant support in the default chrono parser
chrono.casual.parsers = chrono.casual.parsers.filter((parser) => {
    return !parser.constructor.name.startsWith('ZHHant');
});

export function convertTimesToLocal(message, messageCreationTime, localTimezone, locale) {
    const filterRenderer = new marked.Renderer();
    filterRenderer.codespan = () => '';
    filterRenderer.paragraph = (text) => text;
    const filteredMessage = marked(message, {renderer: filterRenderer});

    const referenceDate = {instant: messageCreationTime, timezone: null};
    const parsedTimes = chrono.parse(filteredMessage, referenceDate, {forwardDate: true});
    if (!parsedTimes || !parsedTimes.length) {
        return message;
    }
    let newMessage = message;

    for (let i = 0, len = parsedTimes.length; i < len; i++) {
        const parsedTime = parsedTimes[i];

        if (!parsedTime.start.isCertain('timezoneOffset')) {
            return message;
        }

        let renderingFormat = DATE_AND_TIME_FORMAT;
        let formattedDisplayDate;

        const currentUserStartDate = moment(parsedTime.start.date()).tz(localTimezone).locale(locale);
        if (!currentUserStartDate.isSame(moment(), 'year')) {
            renderingFormat = DATE_FORMAT;
        } else if (!parsedTime.start.isCertain('day') && !parsedTime.start.isCertain('weekday')) {
            renderingFormat = TIME_FORMAT;
        }
        if (parsedTime.end) {
            const currentUserEndDate = moment(parsedTime.end.date()).tz(localTimezone).locale(locale);
            if (!currentUserEndDate.isSame(moment(), 'year')) {
                renderingFormat = DATE_FORMAT;
            }
            if (currentUserStartDate.isSame(currentUserEndDate, 'day')) {
                formattedDisplayDate = `${currentUserStartDate.format(renderingFormat)} - ${currentUserEndDate.format(TIME_FORMAT + ' ' + ZONE_FORMAT)}`;
            } else {
                formattedDisplayDate = `${currentUserStartDate.format(renderingFormat + ' ' + ZONE_FORMAT)} - ${currentUserEndDate.format(renderingFormat + ' ' + ZONE_FORMAT)}`;
            }
        } else {
            formattedDisplayDate = currentUserStartDate.format(renderingFormat + ' ' + ZONE_FORMAT);
        }

        const {text} = parsedTime;
        newMessage = `${newMessage.replace(text, `\`${text}\` *(${formattedDisplayDate})*`)}`;
    }

    return newMessage;
}
