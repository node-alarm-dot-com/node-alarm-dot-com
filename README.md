Node.js Alarm.com Interface
===========================

Unofficial interface module written in Node.js to access and operate [Alarm.com](https://www.alarm.com/) security systems.

This interface works best with the fork: [https://github.com/node-alarm-dot-com/homebridge-node-alarm-dot-com](https://github.com/node-alarm-dot-com/homebridge-node-alarm-dot-com), based off of John Hurliman's FrontPoint* plugin for Homebridge<small>[↗](https://github.com/jhurliman/homebridge-frontpoint)</small>. This variation <del>adds</del> changes the default login authentication <del>for</del> to Alarm.com. <del>with a switch to use the FrontPoint login authentication process if desired.</del>

<small>*FrontPoint is simply a rebranded service provider for Alarm.com.</small>

Originally intended for use with the fork: [https://github.com/node-alarm-dot-com/homebridge-node-alarm-dot-com](https://github.com/node-alarm-dot-com/homebridge-node-alarm-dot-com), originally created by Bryan Bartow for his Alarm.com plugin for Homebridge<small>[↗](https://github.com/bryan-bartow/homebridge-alarm.com)</small>.

Supported Features
------------------

 * Querying panels
   * Arming
   * Disarming
 * Sensors
   * Contact states
   * <del>Occupancy states</del> (this does not work due to lag in the Alarm.com webAPI itself)
   * Water Leak states
 * Lights
   * On/Off switch
   * Dimmer switch
 * Locks
   * Lock/Unlock switch
 * Thermostats
   * State (Off, Heat, Cool, Auto)
   * Desired Heat setpoint
   * Desired Cool setpoint

Usage
-----

**Install:**

`npm i node-alarm-dot-com`

**Querying:**

```js
const nodeADC = require('node-alarm-dot-com')

nodeADC
  .login('your_username', 'your_password')
  .then(authOpts => nodeADC.getCurrentState(authOpts.systems[0], authOpts))
  .then(res => {
    console.log('Security Systems:', res.partitions)
    console.log('Sensors:', res.sensors)
  })
  .catch(err => console.error(err))
```

**Arming:**

```js
const nodeADC = require('node-alarm-dot-com')

nodeADC
  .login('your_username', 'your_password')
  .then(authOpts => {
    return nodeADC
      .getCurrentState(authOpts.systems[0], authOpts)
      .then(res => {
        // This will take 20-30 seconds
        nodeADC.armStay(res.partitions[0].id, authOpts).then(res => {
          console.log(res)
        })
      })
  })
  .catch(err => console.error(err))
```

Documentation
-----

<a name="module_nodeADC"></a>

* [nodeADC](#module_nodeADC)
    * [~login(username, password)](#module_nodeADCmodule_nodeADC..login) ⇒ <code>Promise</code>
    * [~getCurrentState(systemID, authOpts)](#module_nodeADC..getCurrentState) ⇒ <code>Promise</code>
    * [~getPartition(partitionID, authOpts)](#module_nodeADC..getPartition) ⇒ <code>Promise</code>
    * [~getSensors(sensorIDs, authOpts)](#module_nodeADC..getSensors) ⇒ <code>Promise</code>
    * [~getLights(lightIDs, authOpts)](#module_nodeADC..getLights) ⇒ <code>Promise</code>
    * [~turnOnLight(lightID, brightness, authOpts)](#module_nodeADC..turnOnLight) ⇒ <code>Promise</code>
    * [~turnOffLight(lightID, brightness, authOpts)](#module_nodeADC..turnOffLight) ⇒ <code>Promise</code>
    * [~getLocks(lockIDs, authOpts)](#module_nodeADC..getLocks) ⇒ <code>Promise</code>
    * [~secureLock(lockID, authOpts)](#module_nodeADC..secureLock) ⇒ <code>Promise</code>
    * [~unsecureLock(lockID, authOpts)](#module_nodeADC..unsecureLock) ⇒ <code>Promise</code>
    * [~setThermostatState(thermostatID, newState, authOpts)](#module_nodeADC..setThermostatState) ⇒ <code>Promise</code>
    * [~setThermostatTargetHeatTemperature(thermostatID, newTemp, authOpts)](#module_nodeADC..setThermostatTargetHeatTemperature) ⇒ <code>Promise</code>
    * [~setThermostatTargetCoolTemperature(thermostatID, newTemp, authOpts)](#module_nodeADC..setThermostatTargetCoolTemperature) ⇒ <code>Promise</code>
    * [~armStay(partitionID, authOpts, opts)](#module_nodeADC..armStay) ⇒ <code>Promise</code>
    * [~armAway(partitionID, authOpts, opts)](#module_nodeADC..armAway) ⇒ <code>Promise</code>
    * [~disarm(partitionID, authOpts)](#module_nodeADC..disarm) ⇒ <code>Promise</code>

<a name="module_nodeADC..login"></a>

### nodeADC~login(username, password) ⇒ <code>Promise</code>
Authenticate with alarm.com using the mobile webpage login form (loads faster than the desktop webpage login form). Returns an authentication object that can be passed to other methods.

**Kind**: inner method of [<code>module_nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | FrontPoint username. |
| password | <code>string</code> | FrontPoint password. |

<a name="module_nodeADC..getCurrentState"></a>

### nodeADC~getCurrentState(systemID, authOpts) ⇒ <code>Promise</code>
Retrieve information about the current state of a security system including attributes, partitions, sensors, and relationships.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| systemID | <code>string</code> | ID of the FrontPoint system to query. The   Authentication object returned from the `login` method contains a `systems` property which is an array of system IDs. |
| authOpts | <code>Object</code> | Authentication object returned from the `login` method. |

<a name="module_nodeADC..getPartition"></a>

### nodeADC~getPartition(partitionID, authOpts) ⇒ <code>Promise</code>
Get information for a single security system partition.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| partitionID | <code>string</code> | Partition ID to retrieve |
| authOpts | <code>Object</code> | Authentication object returned from the `login` method. |

<a name="module_nodeADC..getSensors"></a>

### nodeADC~getSensors(sensorIDs, authOpts) ⇒ <code>Promise</code>
Get information for one or more sensors.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| sensorIDs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Array of sensor ID strings. |
| authOpts | <code>Object</code> | Authentication object returned from the `login` method. |

<a name="module_nodeADC..getLights"></a>

### nodeADC~getLights(lightIDs, authOpts) ⇒ <code>Promise</code>
Get information for one or more lights.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| lightIDs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Array of light ID strings. |
| authOpts | <code>Object</code> | Authentication object returned from the `login` method. |

<a name="module_nodeADC..turnOnLight"></a>

### nodeADC~turnOnLight(lightID, brightness, authOpts) ⇒ <code>Promise</code>
Sets a light to ON and adjusts brightness level (1-100) of dimmable lights.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| lightID | <code>string</code> | Light ID string. |
| brightness | <code>number</code> | An integer, 1-100, indicating brightness. |
| authOpts | <code>Object</code> | Authentication object returned from the `login` method. |

<a name="module_nodeADC..turnOffLight"></a>

### nodeADC~turnOffLight(lightID, brightness, authOpts) ⇒ <code>Promise</code>
Sets a light to OFF. The brightness level is ignored.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| lightID | <code>string</code> | Light ID string. |
| brightness | <code>number</code> | <del>An integer, 1-100, indicating brightness.</del> Ignored. |
| authOpts | <code>Object</code> | Authentication object returned from the `login` method. |

<a name="module_nodeADC..getLocks"></a>

### nodeADC~getLocks(lightIDs, authOpts) ⇒ <code>Promise</code>
Get information for one or more locks.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| lockIDs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Array of lock ID strings. |
| authOpts | <code>Object</code> | Authentication object returned from the `login` method. |

<a name="module_nodeADC..secureLock"></a>

### nodeADC~secureLock(lockID, authOpts) ⇒ <code>Promise</code>
Sets a lock to "locked" (SECURED).

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| lockID | <code>string</code> | Lock ID string. |
| authOpts | <code>Object</code> | Authentication object returned from the `login` method. |

<a name="module_nodeADC..unsecureLock"></a>

### nodeADC~unsecureLock(lockID, authOpts) ⇒ <code>Promise</code>
Sets a lock to "unlocked" (UNSECURED).

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| lockID | <code>string</code> | Lock ID string. |
| authOpts | <code>Object</code> | Authentication object returned from the `login` method. |

<a name="module_nodeADC..setThermostatState"></a>

### nodeADC~setThermostatState(thermostatID, newState, authOpts) ⇒ <code>Promise</code>
Update Thermostat State (see `THERMOSTAT_STATES`)

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param        | Type                           | Description                                                 |
|--------------|--------------------------------|-------------------------------------------------------------|
| thermostatID | <code>string</code>            | Thermostat ID string.                                       |
| newState     | <code>THERMOSTAT_STATES</code> | Desired state, `THERMOSTAT_STATES.OFF`/`HEAT`/`COOL`/`AUTO` |
| authOpts     | <code>Object</code>            | Authentication object returned from the `login` method.     |

<a name="module_nodeADC..setThermostatTargetHeatTemperature"></a>

### nodeADC~setThermostatTargetHeatTemperature(thermostatID, newTemp, authOpts) ⇒ <code>Promise</code>
Set desired Heat setpoint temperature for Thermostat

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param        | Type                | Description                                             |
|--------------|---------------------|---------------------------------------------------------|
| thermostatID | <code>string</code> | Thermostat ID string.                                   |
| newTemp      | <code>number</code> | Desired temperature                                     |
| authOpts     | <code>Object</code> | Authentication object returned from the `login` method. |

<a name="module_nodeADC..setThermostatTargetCoolTemperature"></a>

### nodeADC~setThermostatTargetCoolTemperature(thermostatID, newTemp, authOpts) ⇒ <code>Promise</code>
Set desired Cool setpoint temperature for Thermostat

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param        | Type                | Description                                             |
|--------------|---------------------|---------------------------------------------------------|
| thermostatID | <code>string</code> | Thermostat ID string.                                   |
| newTemp      | <code>number</code> | Desired temperature                                     |
| authOpts     | <code>Object</code> | Authentication object returned from the `login` method. |

<a name="module_nodeADC..armStay"></a>

### nodeADC~armStay(partitionID, authOpts, opts) ⇒ <code>Promise</code>
Arm a security system panel in "stay" mode. NOTE: This call may take 20-30 seconds to complete.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| partitionID | <code>string</code> | Partition ID to arm. |
| authOpts | <code>Object</code> | Authentication object returned from the `login` method. |
| opts | <code>Object</code> | Optional arguments for arming the system. |
| opts.noEntryDelay | <code>boolean</code> | Disable the 30-second entry delay. |
| opts.silentArming | <code>boolean</code> | Disable audible beeps and double the exit delay. |

<a name="module_nodeADC..armAway"></a>

### nodeADC~armAway(partitionID, authOpts, opts) ⇒ <code>Promise</code>
Arm a security system panel in "away" mode. NOTE: This call may take 20-30 seconds to complete.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| partitionID | <code>string</code> | Partition ID to arm. |
| authOpts | <code>Object</code> | Authentication object returned from the `login` method. |
| opts | <code>Object</code> | Optional arguments for arming the system. |
| opts.noEntryDelay | <code>boolean</code> | Disable the 30-second entry delay. |
| opts.silentArming | <code>boolean</code> | Disable audible beeps and double the exit delay. |

<a name="module_nodeADC..disarm"></a>

### nodeADC~disarm(partitionID, authOpts) ⇒ <code>Promise</code>
Disarm a security system panel.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| partitionID | <code>string</code> | Partition ID to disarm. |
| authOpts | <code>Object</code> | Authentication object returned from the `login` method. |

Notes
-----
In efforts to maintain this project as a native Alarm.com implementation, authentication and reference to FrontPoint have been removed altogether within the code as of versions 1.6.0. This allows for the codebase to be cleaner without having to solve everyone else's extraneous Alarm.com Verified-Partner setups, encouraging separate forks and augmentation for those unique scenarios.

Acknowledgements
----------------

- **Original Code:** [https://github.com/jhurliman/node-frontpoint](https://github.com/jhurliman/node-frontpoint)
- **Alarm.com Login Process:** [Schwark Satyavolu](https://github.com/schwark), original author of [pyalarmcom](https://github.com/schwark/pyalarmcom)
- **Alarm.com Mobile Login Tips:** [Bryan Bartow](https://github.com/bryan-bartow), original author of [homebridge-alarm.com](https://github.com/bryan-bartow/homebridge-alarm.com)
- **Lights/Locks Implementation:** [Chase Lau](https://github.com/chase9)



