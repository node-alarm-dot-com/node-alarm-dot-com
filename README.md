Node.js Alarm.com Interface
===========================

Unofficial interface module written in Node.js to access and operate [Alarm.com](https://www.alarm.com/) security systems.

Intended for use with the fork: [https://github.com/mkormendy/homebridge-alarm.com](https://github.com/mkormendy/homebridge-alarm.com), originally created by Bryan Bartow for his Alarm.com plugin for Homebridge<small>[↗](https://github.com/bryan-bartow/homebridge-alarm.com)</small>.

This interface works best with the fork: [https://github.com/mkormendy/homebridge-alarm-dot-com](https://github.com/mkormendy/homebridge-alarm-dot-com), based off of John Hurliman's FrontPoint* plugin for Homebridge<small>[↗](https://github.com/jhurliman/homebridge-frontpoint)</small>. This variation replaces the FrontPoint login authentication process with the natively compatible Alarm.com login authentication process.

<small>*FrontPoint is a rebranded service provider for Alarm.com.</small>

Supported Features
------------------

 * Querying panels
  * Arming
  * Disarming
 * Sensors
  * Contact states
  * Occupancy states
  * Water Leak states
 * (Lights states/action - coming soon)
  * on
  * off
  * dimmer
 * (Locks states/action - coming soon)
  * lock
  * unlock

Usage
-----

**Install:**

`npm i homebridge-alarm-dot-com`

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
| systemID | <code>string</code> | ID of the FrontPoint system to query. The   Authentication object returned from the `login` method contains a `systems`   property which is an array of system IDs. |
| authOpts | <code>Object</code> | Authentication object returned from the `login`   method. |

<a name="module_nodeADC..getPartition"></a>

### nodeADC~getPartition(partitionID, authOpts) ⇒ <code>Promise</code>
Get information for a single security system partition.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| partitionID | <code>string</code> | Partition ID to retrieve |
| authOpts | <code>Object</code> | Authentication object returned from the `login`   method. |

<a name="module_nodeADC..getSensors"></a>

### nodeADC~getSensors(sensorIDs, authOpts) ⇒ <code>Promise</code>
Get information for one or more sensors.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| sensorIDs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Array of sensor ID strings. |
| authOpts | <code>Object</code> | Authentication object returned from the `login`   method. |

<a name="module_nodeADC..armStay"></a>

### nodeADC~armStay(partitionID, authOpts, opts) ⇒ <code>Promise</code>
Arm a security system panel in "stay" mode. NOTE: This call may take 20-30 seconds to complete.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| partitionID | <code>string</code> | Partition ID to arm. |
| authOpts | <code>Object</code> | Authentication object returned from the `login`   method. |
| opts | <code>Object</code> | Optional arguments for arming the system. |
| opts.noEntryDelay | <code>boolean</code> | Disable the 30-second entry delay. |
| opts.silentArming | <code>boolean</code> | Disable audible beeps and double the exit   delay. |

<a name="module_nodeADC..armAway"></a>

### nodeADC~armAway(partitionID, authOpts, opts) ⇒ <code>Promise</code>
Arm a security system panel in "away" mode. NOTE: This call may take 20-30 seconds to complete.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| partitionID | <code>string</code> | Partition ID to arm. |
| authOpts | <code>Object</code> | Authentication object returned from the `login`   method. |
| opts | <code>Object</code> | Optional arguments for arming the system. |
| opts.noEntryDelay | <code>boolean</code> | Disable the 30-second entry delay. |
| opts.silentArming | <code>boolean</code> | Disable audible beeps and double the exit   delay. |

<a name="module_nodeADC..disarm"></a>

### nodeADC~disarm(partitionID, authOpts) ⇒ <code>Promise</code>
Disarm a security system panel.

**Kind**: inner method of [<code>nodeADC</code>](#module_nodeADC)

| Param | Type | Description |
| --- | --- | --- |
| partitionID | <code>string</code> | Partition ID to disarm. |
| authOpts | <code>Object</code> | Authentication object returned from the `login`   method. |

Acknowledgements
----------------

- **Original Code:** [https://github.com/jhurliman/node-frontpoint](https://github.com/jhurliman/node-frontpoint)
- **Alarm.com Login Process:** [Schwark Satyavolu](https://github.com/schwark), original author of [pyalarmcom](https://github.com/schwark/pyalarmcom)
- **Alarm.com Mobile Login Tips:** [Bryan Bartow](https://github.com/bryan-bartow), original author of [homebridge-alarm.com](https://github.com/bryan-bartow/homebridge-alarm.com)


