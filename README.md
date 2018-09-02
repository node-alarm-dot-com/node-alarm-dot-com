# HomeBridge Alarm.com Plugin

Alarm.com plugin for [Homebridge](https://github.com/nfarina/homebridge) using the [node-alarm-dot-com](https://github.com/mkormendy/node-alarm-dot-com) interface.

Based purely off of John Hurliman's FrontPoint* plugin for Homebridge<small>[↗](https://github.com/jhurliman/homebridge-frontpoint)</small> with modifications to the namespace and branding as Alarm.com instead.

> **NOTE:** Because this uses Node.js-based HTTP requests to communicate with Alarm.com directly, this plugin does not require any additional accounts with access to external proxy APIs (e.g., WrapAPI). 🎉

<small>*FrontPoint is simply a rebranded service provider for Alarm.com, but FrontPoint is not needed for this plugin to work.</small>

Supported Features
------------------

 * Querying panels
   * Arming
   * Disarming
 * Sensors
   * Contact states
   * Occupancy states
   * Water Leak states
 * *(Lights states/action - coming soon)*
   * *on*
   * *off*
   * *dimmer*
 * *(Locks states/action - coming soon)*
   * *lock*
   * *unlock*

# Installation

1. Install homebridge: `npm install -g homebridge`
2. Install this plugin: `npm install -g homebridge-alarm-dot-com`
3. Update your configuration file (see below).

# Configuration

### Sample config.json:


```json
//...
{
    "platform": "Alarm-dot-com",
    "name": "Security System",
    "username": "<ENTER YOUR ALARM.COM USERNAME>",
    "password": "<ENTER YOUR ALARM.COM PASSWORD>",
    "armingModes": {
        "away": {
            "noEntryDelay": false,
            "silentArming": false
        },
        "night": {
            "noEntryDelay": false,
            "silentArming": false
        },
        "stay": {
            "noEntryDelay": false,
            "silentArming": false
        }
    }
}
//...
```
### Fields:

* "platform": Must always be "Alarm-dot-com" (required)
* "name": Can be anything (required)
* "username": Alarm.com login username, same as app (required)
* "password": Alarm.com login password, same as app (required)
* "armingModes": Object of objects with arming mode options of boolean choices