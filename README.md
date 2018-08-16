# Walltime Plugin

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

