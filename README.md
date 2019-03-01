# Walltime Plugin [![CircleCI](https://circleci.com/gh/mattermost/mattermost-plugin-walltime.svg?style=svg)](https://circleci.com/gh/mattermost/mattermost-plugin-walltime)

This plugin convert a message that contains some kind of date/time and parse the date/time to show in the user timezone.


## Example

User in the timezone `America\Toronto` post the following message:

```
Let's meet today at 10am
```

A user in another timezone, ie. `Europe\Berlin` will see:

```
Let's meet today at 10am (Thursday, August 16, 2018 4:00 PM CEST)
```

Another example:

```
Let's meet today at noon
```

the user reading the message in another timezone will see:

```
Let's meet today at noon (Thursday, August 16, 2018 7:00 AM CEST)
```

## Installation

__Requires Mattermost 5.2 or higher__

1. Install the plugin
    1. Download the latest version of the plugin from the GitHub releases page
    2. In Mattermost, go the System Console -> Plugins -> Management
    3. Upload the plugin
2. Enable the plugin
    * Go to System Console -> Plugins -> Management and click "Enable"

## Developing

One time run `cd webapp && npm run pre-build` to get `mattermost-redux` working.

Use `make dist` to build distributions of the plugin that you can upload to a Mattermost server.

Use `make check-style` to check the style.

Use `make deploy` to deploy the plugin to your local server.

There is a build target to automate deploying and enabling the plugin to your server, but it requires configuration and [http](https://httpie.org/) to be installed:
```
export MM_SERVICESETTINGS_SITEURL=http://localhost:8065/
export MM_ADMIN_USERNAME=admin
export MM_ADMIN_PASSWORD=password
make deploy
```

Alternatively, if you are running your `mattermost-server` out of a sibling directory by the same name, use the `deploy` target alone to  unpack the files into the right directory. You will need to restart your server and manually enable your plugin.

In production, deploy and upload your plugin via the [System Console](https://about.mattermost.com/default-plugin-uploads).