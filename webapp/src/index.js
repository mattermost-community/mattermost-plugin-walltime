import chrono from 'chrono-node';
import moment from 'moment-timezone';

import {getCurrentUser, getUser} from 'mattermost-redux/selectors/entities/users';

import PluginId from './plugin_id';

let DATE_AND_TIME_FORMAT = 'ddd, MMM D LT';
const ZONE_FORMAT = 'z';
const TIME_FORMAT = 'LT';

export default class Plugin {
    // eslint-disable-next-line no-unused-vars
    initialize(registry, store) {
        registry.registerMessageWillFormatHook((post) => {
            const {message} = post;
            const state = store.getState();
            const currentUser = getCurrentUser(state);
            const postUser = getUser(state, post.user_id);

            if (!postUser || !currentUser) {
                return message;
            }

            const nlpResults = chrono.parse(message, moment(post.create_at));

            if (!nlpResults || !nlpResults.length) {
                return message;
            }

            let newMessage = message;
            const currentUserTimezone = timeZoneForUser(currentUser);

            for (let i = 0, len = nlpResults.length; i < len; i++) {
                const nlpResult = nlpResults[i];

                if (!nlpResult.tags.ENTimeExpressionParser || !nlpResult.tags.ExtractTimezoneAbbrRefiner) {
                    continue;
                }

                const anchorTimezoneStart = nlpResult.start.knownValues.timezoneOffset;
                let anchorTimezoneEnd = null;

                const endDate = nlpResult.end ? nlpResult.end.date() : null;
                if (endDate) {
                    anchorTimezoneEnd = nlpResult.end.knownValues.timezoneOffset;
                }

                const adjustedStartDate = dateAdjustedToTimezone(nlpResult.start.date(), anchorTimezoneStart);
                const adjustedEndDate = endDate ? dateAdjustedToTimezone(endDate, anchorTimezoneEnd) : null;

                let formattedDisplayDate;
                const {locale} = currentUser;
                const currentUserStartDate = adjustedStartDate.tz(currentUserTimezone).locale(locale);
                if (!currentUserStartDate.isSame(moment(), 'year')) {
                    DATE_AND_TIME_FORMAT = 'llll';
                }
                if (adjustedEndDate) {
                    const currentUserEndDate = adjustedEndDate.tz(currentUserTimezone).locale(locale);
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

const dateAdjustedToTimezone = (date, offsetMinutes) => {
    return moment(date).subtract(-moment().utcOffset() + offsetMinutes, 'minutes');
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