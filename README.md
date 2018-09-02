# HomeBridge Alarm.com Plugin

Alarm.com plugin for [Homebridge](https://github.com/nfarina/homebridge).

Based purely off of John Hurliman's FrontPoint* plugin for Homebridge<small>[↗](https://github.com/jhurliman/homebridge-frontpoint)</small> with modifications to the namespace and nomenclature as Alarm.com-branded instead.

> **PRO:** This plugin does not require any additional access to external proxy APIs (e.g., WrapAPI), instead it uses Node.js to interact with Alarm.com directly.

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