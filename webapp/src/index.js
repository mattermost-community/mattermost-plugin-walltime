import chrono from 'chrono-node';
import moment from 'moment-timezone';

import PluginId from './plugin_id';

const DATE_FORMAT_WITH_ZONE = 'LLLL z';
const DATE_FORMAT_NO_ZONE = 'LLLL';
const TIME_FORMAT_WITH_ZONE = 'LT z';

export default class Plugin {
    // eslint-disable-next-line no-unused-vars
    initialize(registry, store) {
        registry.registerMessageWillFormatHook((message, post, postUser, currentUser) => {
            if (!postUser || !currentUser || postUser.id === currentUser.id) {
                return message;
            }
            const referenceDate = moment(post.create_at);
            const parseResults = chrono.parse(message, referenceDate);

            if (!parseResults.length) {
                return message;
            }

            let timezoneMessage = message;

            const currentUserTimezone = timeZoneForUser(currentUser);
            const posterTimezome = timeZoneForUser(postUser);

            for (let i = 0, len = parseResults.length; i < len; i++) {
                const parseResult = parseResults[i];
                const parsedMessageEndDate = parseResult.end ? parseResult.end.date() : null;
                const parsedText = parseResult.text;

                const parsedMessageStartDateAdjusted = dateAdjustedToTimezone(parseResult.start.date(), posterTimezome);

                let parsedMessageEndDateAdjusted;
                if (parsedMessageEndDate) {
                    parsedMessageEndDateAdjusted = dateAdjustedToTimezone(parsedMessageEndDate, posterTimezome);
                }

                const currentUserMessageStartDate = parsedMessageStartDateAdjusted.tz(currentUserTimezone);
                if (!parsedMessageEndDateAdjusted) {
                    timezoneMessage = `${timezoneMessage.replace(parsedText, `\`${parsedText}\` *(${currentUserMessageStartDate.format(DATE_FORMAT_WITH_ZONE)})*`)}`;
                    continue;
                }

                const currentUserMessageEndDate = parsedMessageEndDateAdjusted.tz(currentUserTimezone);
                if (currentUserMessageStartDate.isSame(currentUserMessageEndDate, 'day')) {
                    timezoneMessage = `${timezoneMessage.replace(parsedText, `\`${parsedText}\``)} *(${currentUserMessageStartDate.format(DATE_FORMAT_NO_ZONE)} - ${currentUserMessageEndDate.format(TIME_FORMAT_WITH_ZONE)})*`;
                } else {
                    timezoneMessage = `${timezoneMessage.replace(parsedText, `\`${parsedText}\``)} *(${currentUserMessageStartDate.format(DATE_FORMAT_WITH_ZONE)} - ${currentUserMessageEndDate.format(DATE_FORMAT_WITH_ZONE)})*`;
                }
            }

            return timezoneMessage;
        });
    }
}

const dateAdjustedToTimezone = (date, timezone) => {
    return moment(date).subtract(-moment().utcOffset() + moment().tz(timezone).utcOffset(), 'minutes');
};

const timeZoneForUser = (user) => {
    let zone;
    const {timezone} = user;
    if (timezone.useAutomaticTimezone === 'true') {
        zone = timezone.automaticTimezone;
    } else {
        zone = timezone.manualTimezone;
    }
    return zone;
};

window.registerPlugin(PluginId, new Plugin());