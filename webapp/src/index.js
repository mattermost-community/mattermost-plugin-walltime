import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import PluginId from './plugin_id';

import {convertTimesToLocal} from './time.js';

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
    const {message} = post;

    const info = getInfoForCurrentUser(store);
    if (info === null) {
        return message;
    }
    const {currentUserTimezone, currentUserLocale} = info;

    return convertTimesToLocal(message, post.create_at, currentUserTimezone, currentUserLocale);
}

export default class Plugin {
    // eslint-disable-next-line no-unused-vars
    initialize(registry, store) {
        registry.registerMessageWillFormatHook((post) => {
            return messageWillFormat(post, store);
        });
    }
}

window.registerPlugin(PluginId, new Plugin());
