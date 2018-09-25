# Alarm.com plugin for Homebridge using Node.js

Alarm.com plugin for [Homebridge](https://github.com/nfarina/homebridge) using the [node-alarm-dot-com](https://github.com/mkormendy/node-alarm-dot-com) interface.

Forked from John Hurliman's FrontPoint* plugin for Homebridge<small>[↗](https://github.com/jhurliman/homebridge-frontpoint)</small> to replace the branding and code namespace from FrontPoint to Alarm.com.

> **NOTE:** Because this implementation uses Node.js-based HTTP requests to communicate with Alarm.com directly, this plugin does not require accounts or access with WrapAPI. 🎉

<small>*FrontPoint is simply a rebranded service provider for Alarm.com, but FrontPoint is not needed for this plugin to work.</small>

# Supported Features

 * Querying panels
   * Arming
   * Disarming
 * Sensors
   * Contact states
   * <del>Occupancy states</del> (this does not work due to lag in the Alarm.com webAPI itself)
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
2. Install this plugin: `npm install -g homebridge-node-alarm-dot-com`
3. Update your configuration file (see below).

# Configuration

### Sample config.json:


```json
{
    "platform": "Alarmdotcom",
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
```
### Fields:

* "platform": Must always be "Alarmdotcom" (required)
* "name": Can be anything (required)
* "username": Alarm.com login username, same as app (required)
* "password": Alarm.com login password, same as app (required)
* "armingModes": Object of objects with arming mode options of boolean choices

# Troubleshooting

If you are replacing the Bryan Bartow's Homebridge plugin with this implementation, you may be required to delete the `~/.homebridge/accessories/cachedAccessories` file for the new platform to show up with the new panel, accessories and devices.

**WARNING:** If you delete the contents of the `~/.homebridge/persist` folder, your Homebridge and devices will become unresponsive and you will have to entirely re-pair the Homebridge bridge (remove and re-scan the QR-code for Homebridge and set up all of your accessories/devices again).
