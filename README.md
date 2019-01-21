# Alarm.com plugin for Homebridge using Node.js

Alarm.com plugin for [Homebridge](https://github.com/nfarina/homebridge) using the [node-alarm-dot-com](https://github.com/mkormendy/node-alarm-dot-com) interface.

[![NPM](https://nodei.co/npm/homebridge-node-alarm-dot-com.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/homebridge-node-alarm-dot-com/)

[![npm](https://img.shields.io/npm/dm/homebridge-node-alarm-dot-com.svg)](https://www.npmjs.com/package/homebridge-node-alarm-dot-com)
[![npm](https://img.shields.io/npm/v/homebridge-node-alarm-dot-com.svg)](https://www.npmjs.com/package/homebridge-node-alarm-dot-com)

Forked from John Hurliman's FrontPoint* plugin for Homebridge<small>[↗](https://github.com/jhurliman/homebridge-frontpoint)</small> to replace the branding and code namespace from FrontPoint to Alarm.com.

> **NOTE:** Because this implementation uses Node.js-based HTTP requests to communicate with Alarm.com directly, this plugin does not require accounts or access with WrapAPI. :tada:

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
* "authTimeoutMinutes": Timeout to Re-Authenticate session (**WARNING:** choosing a time less than 10 minutes could possibly ban/disable your account from Alarm.com)
* "pollTimeoutSeconds": Device polling interval (**WARNING:** choosing a time less than 60 seconds could possibly ban/disable your account from Alarm.com)
* <details><summary>"logLevel": Adjust what gets reported in the logs <strong>(click to expand)</strong></summary><ul><li>0 = NO LOG ENTRIES</li><li>1 = ONLY ERRORS</li><li>2 = ONLY WARNINGS and ERRORS</li><li><strong>3 = GENERAL NOTICES, ERRORS and WARNINGS (default)</strong></li><li>4 = VERBOSE (everything including development output)</li></ul></details>

# Troubleshooting

Before assuming that something is wrong with the plugin, please review the [issues on this project's github repository](https://github.com/mkormendy/homebridge-node-alarm-dot-com/issues?utf8=%E2%9C%93&q=sort%3Aupdated-desc+) to see if there's already a similar issue reported where a solution has been proposed or the outcome is expected due to limitations with the Alarm.com web API.

### Migrating from Bryan Bartow's homebridge-alarm.com

If you are replacing the Bryan Bartow's Homebridge plugin with this implementation, you may be required to delete the `~/.homebridge/accessories/cachedAccessories` file for the new platform to show up with the new panel, accessories and devices.

**WARNING:** If you delete the contents of the `~/.homebridge/persist` folder, your Homebridge and devices will become unresponsive and you will have to entirely re-pair the Homebridge bridge (remove and re-scan the QR-code for Homebridge and set up all of your accessories/devices again).

### Logging

The default setting for log entries is set to report critical errors, warnings about devices and notices about connecting to the Alarm.com account. Once you feel that your security system devices are being represented in HomeKit correctly you can choose to reduce the amount of information being output to the logs to save space or remove cruft while troubleshooting other Homebridge plugins.

To modify the log behaviour, add the "logLevel" field to the Alarmdotcom platform block in the Homebridge configuration file. The following example illustrates that we only want critical errors to be reported in the log.
#### Sample config.json with "logLevel" setting:
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
    },
    "logLevel": 1
}
```
