# Walltime Plugin (Beta) ![CircleCI branch](https://img.shields.io/circleci/project/github/mattermost/mattermost-plugin-walltime/master.svg)

Use the walltime plugin to detect timestamps and convert them to the user's own timezone. This plugin is currently in beta.


## Example

User in the timezone `America\Toronto` post the following message:

```
Let's meet today at 10am EST
```

A user in another timezone, ie. `Europe\Berlin` will see:

```
Let's meet today at 10am EST (Thursday, August 16, 2018 5:00 PM CEST)
```

Another example:

```
Let's meet today at noon EDT
```

the user reading the message in another timezone will see:

```
Let's meet today at noon EDT (Thursday, August 16, 2018 6:00 AM CEST)
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

One time run `cd webapp && npm clean-install --also=dev` to install dependencies.

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
