import chrono from 'chrono-node';
import moment from 'moment-timezone';

import PluginId from './plugin_id';

export default class Plugin {
    // eslint-disable-next-line no-unused-vars
    initialize(registry, store) {
        registry.registerMessageWillFormatHook((message, post, postUser, currentUser) => {
            if (!postUser || !currentUser || postUser.id === currentUser.id) {
                return message;
            }
            const posterTimezome = timeZoneForUser(postUser);
            const currentUserTimezone = timeZoneForUser(currentUser);
            const referenceDate = moment(post.create_at);
            const parseResults = chrono.parse(message, referenceDate);

            if (!parseResults.length) {
                return message;
            }

            let timezoneMessage = message;

            parseResults.forEach((parseResult) => {
                const parsedMessageStartDate = parseResult.start.date();

                const parsedMessageEndDate = parseResult.end ? parseResult.end.date() : null;

                const parsedText = parseResult.text;

                const parsedMessageStartDateMoment = moment(parsedMessageStartDate).subtract(-moment().utcOffset() + moment().tz(posterTimezome).utcOffset(), 'minutes');

                let parsedMessageEndDateMoment;
                if (parsedMessageEndDate) {
                    parsedMessageEndDateMoment = moment(parsedMessageEndDate).subtract(-moment().utcOffset() + moment().tz(posterTimezome).utcOffset(), 'minutes');
                }

                const currentUserMessageStartDate = parsedMessageStartDateMoment.tz(currentUserTimezone);

                let currentUserMessageEndDate;
                if (parsedMessageEndDateMoment) {
                    currentUserMessageEndDate = parsedMessageEndDateMoment.tz(currentUserTimezone);

                    if (currentUserMessageStartDate.isSame(currentUserMessageEndDate, 'day')) {
                        timezoneMessage = `${timezoneMessage.replace(parsedText, `\`${parsedText}\``)} *(${currentUserMessageStartDate.format('LLLL')} - ${currentUserMessageEndDate.format('LT z')})*`;
                    } else {
                        timezoneMessage = `${timezoneMessage.replace(parsedText, `\`${parsedText}\``)} *(${currentUserMessageStartDate.format('LLLL z')} - ${currentUserMessageEndDate.format('LLLL z')})*`;
                    }
                } else {
                    timezoneMessage = `${timezoneMessage.replace(parsedText, `\`${parsedText}\` *(${currentUserMessageStartDate.format('LLLL z')})*`)}`;
                }
            });

            return timezoneMessage;
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