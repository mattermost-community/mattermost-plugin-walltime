import chrono from 'chrono-node';
import moment from 'moment-timezone';

import PluginId from './plugin_id';

let DATE_AND_TIME_FORMAT = 'ddd, MMM D LT';
const ZONE_FORMAT = 'z';
const TIME_FORMAT = 'LT';

export default class Plugin {
    // eslint-disable-next-line no-unused-vars
    initialize(registry, store) {
        registry.registerMessageWillFormatHook((message, post, postUser, currentUser) => {
            if (!postUser || !currentUser) {
                return message;
            }

            const nlpResults = chrono.parse(message, moment(post.create_at));

            if (!nlpResults.length) {
                return message;
            }

            let newMessage = message;
            const currentUserTimezone = timeZoneForUser(currentUser);
            const posterTimezone = timeZoneForUser(postUser);

            for (let i = 0, len = nlpResults.length; i < len; i++) {
                const nlpResult = nlpResults[i];
                const endDate = nlpResult.end ? nlpResult.end.date() : null;

                const adjustedStartDate = dateAdjustedToTimezone(nlpResult.start.date(), posterTimezone);
                const adjustedEndDate = endDate ? dateAdjustedToTimezone(endDate, posterTimezone) : null;

                let formattedDisplayDate;
                const currentUserStartDate = adjustedStartDate.tz(currentUserTimezone);
                if (!currentUserStartDate.isSame(moment(), 'year')) {
                    DATE_AND_TIME_FORMAT = 'llll';
                }
                if (adjustedEndDate) {
                    const currentUserEndDate = adjustedEndDate.tz(currentUserTimezone);
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

                const {text} = nlpResult;
                newMessage = `${newMessage.replace(text, `\`${text}\` *(${formattedDisplayDate})*`)}`;
            }

            return newMessage;
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