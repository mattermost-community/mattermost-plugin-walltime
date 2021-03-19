import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import * as chrono from 'chrono-node';

import PluginId from './plugin_id';

const customChrono = chrono.casual.clone();
customChrono.refiners.push({
    refine: (context, results) => {
        // If there is no AM/PM (meridiem) specified,
        //  let all time between 1:00 - 5:00 be PM (13.00 - 16.00)
        results.forEach((result) => {
            if (!result.start.isCertain('meridiem') &&
                //TODO make these hour values configurable
                result.start.get('hour') >= 1 && result.start.get('hour') < 5) {
                result.start.assign('meridiem', 1);
                result.start.assign('hour', result.start.get('hour') + 12);
            }
        });
        return results;
    },
});

function timeZoneForUser(user) {
    let zone;
    const {timezone} = user;
    if (timezone.useAutomaticTimezone === 'true') {
        // eslint-disable-next-line new-cap
        zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } else {
        zone = timezone.manualTimezone;
    }
    return zone;
}

function getInfoForCurrentUser(store) {
    const state = store.getState();

    const currentUser = getCurrentUser(state);
    if (!currentUser || !currentUser.locale) {
        return null;
    }

    const {locale} = currentUser;

    const currentUserTimezone = timeZoneForUser(currentUser);
    if (!currentUserTimezone) {
        return null;
    }

    return {
        currentUserTimezone,
        currentUserLocale: locale,
    };
}

function messageWillFormat(post, store) {
    const {currentUserTimezone, currentUserLocale} = getInfoForCurrentUser(store);
    let newMessage = post.message;

    // the key contains the matched text, which we'll replace later
    for (const [key, value] of Object.entries(post.props)) {
        if (!key.includes('walltime-')) {
            continue;
        }

        // Extract the real key from one namespaces with walltime-
        const parsedKey = key.replace('walltime-', '');
        const date = new Date(value);
        const dateString = date.toLocaleString(currentUserLocale, {timeZone: currentUserTimezone});
        newMessage = newMessage.replace(parsedKey, `${parsedKey} (${dateString})`);
    }

    return newMessage;
}

function messageWillPost(post, store) {
    const {message} = post;
    const info = getInfoForCurrentUser(store);
    if (info == null) {
        return {post};
    }
    const result = customChrono.parse(message, new Date());
    if (result.length === 0) {
        // if chrono didn't match with anything, just send the post as normal
        return {post};
    }
    result.forEach((date) => {
        // For each match, add a prop with key of the text that matched and value of the date parsed from match
        // Namespace the prop with walltime so we don't mess with props from elsewhere
        const key = `walltime-${date.text}`;
        post.props = {...post.props, [key]: date.date()};
    });
    return {post};
}

// This is a test message about a meeting next thursday at 1 pm and another date about next tuesday at 4 am
export default class Plugin {
    // eslint-disable-next-line no-unused-vars
    initialize(registry, store) {
        registry.registerMessageWillBePostedHook((post) => {
            return messageWillPost(post, store);
        });
        registry.registerMessageWillFormatHook((post) => {
            return messageWillFormat(post, store);
        });
    }
}

window.registerPlugin(PluginId, new Plugin());
