import chrono from 'chrono-node';
import moment from 'moment-timezone';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

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
            if (!currentUser || !currentUser.locale) {
                return message;
            }

            const {locale} = currentUser;

            const nlpResults = chrono.parse(message, moment(post.create_at), {forwardDate: true});
            if (!nlpResults || !nlpResults.length) {
                return message;
            }

            const currentUserTimezone = timeZoneForUser(currentUser);
            if (!currentUserTimezone) {
                return message;
            }

            let newMessage = message;

            for (let i = 0, len = nlpResults.length; i < len; i++) {
                const nlpResult = nlpResults[i];

                if (!nlpResult.tags.ENTimeExpressionParser || !nlpResult.tags.ExtractTimezoneAbbrRefiner) {
                    continue;
                }

                const anchorTimezoneStart = nlpResult.start.knownValues.timezoneOffset;
                if (!anchorTimezoneStart) {
                    return message;
                }

                let formattedDisplayDate;

                const currentUserStartDate = moment(nlpResult.start.date()).tz(currentUserTimezone).locale(locale);
                if (!currentUserStartDate.isSame(moment(), 'year')) {
                    DATE_AND_TIME_FORMAT = 'llll';
                }
                if (nlpResult.end) {
                    const currentUserEndDate = moment(nlpResult.end.date()).tz(currentUserTimezone).locale(locale);
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