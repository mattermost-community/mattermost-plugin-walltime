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

            const nlpDateResults = chrono.parse(message, moment(post.create_at));

            if (!nlpDateResults.length) {
                return message;
            }

            let timezoneMessage = message;
            const currentUserTimezone = timeZoneForUser(currentUser);
            const posterTimezome = timeZoneForUser(postUser);

            for (let i = 0, len = nlpDateResults.length; i < len; i++) {
                const nlpResult = nlpDateResults[i];
                const endDate = nlpResult.end ? nlpResult.end.date() : null;

                const adjustedStartDate = dateAdjustedToTimezone(nlpResult.start.date(), posterTimezome);
                const adjustedEndDate = endDate ? dateAdjustedToTimezone(endDate, posterTimezome) : null;

                let formattedDateDisplay;
                const currentUserStartDate = adjustedStartDate.tz(currentUserTimezone);
                if (adjustedEndDate) {
                    const currentUserEndDate = adjustedEndDate.tz(currentUserTimezone);
                    if (currentUserStartDate.isSame(currentUserEndDate, 'day')) {
                        formattedDateDisplay = `${currentUserStartDate.format(DATE_FORMAT_NO_ZONE)} - ${currentUserEndDate.format(TIME_FORMAT_WITH_ZONE)}`;
                    } else {
                        formattedDateDisplay = `${currentUserStartDate.format(DATE_FORMAT_WITH_ZONE)} - ${currentUserEndDate.format(DATE_FORMAT_WITH_ZONE)}`;
                    }
                } else {
                    formattedDateDisplay = currentUserStartDate.format(DATE_FORMAT_WITH_ZONE);
                }

                const {text} = nlpResult;
                timezoneMessage = `${timezoneMessage.replace(text, `\`${text}\` *(${formattedDateDisplay})*`)}`;
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