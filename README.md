Node.js Frontpoint Client
=========================

Unofficial [FrontPoint Security](http://frontpointsecurity.com/) API client. Currently supports querying security system and sensor states, arming, and disarming.

Usage
-----

**Install:**
`npm i frontpoint`

**Querying:**
```js
const frontpoint = require('frontpoint')

frontpoint
  .login('your_username', 'your_password')
  .then(authOpts => frontpoint.getCurrentState(authOpts.systems[0], authOpts))
  .then(res => {
    console.log('Security Systems:', res.partitions)
    console.log('Sensors:', res.sensors)
  })
  .catch(err => console.error(err))
```

**Arming:**
```js
const frontpoint = require('frontpoint')

frontpoint
  .login('your_username', 'your_password')
  .then(authOpts => {
    return frontpoint
      .getCurrentState(authOpts.systems[0], authOpts)
      .then(res => {
        // This will take 20-30 seconds
        frontpoint.armStay(res.partitions[0].id, authOpts).then(res => {
          console.log(res)
        })
      })
  })
  .catch(err => console.error(err))
```

Documentation
-----

<a name="module_frontpoint"></a>

* [frontpoint](#module_frontpoint)
    * [~login(username, password)](#module_frontpoint..login) ⇒ <code>Promise</code>
    * [~getCurrentState(systemID, authOpts)](#module_frontpoint..getCurrentState) ⇒ <code>Promise</code>
    * [~getPartition(partitionID, authOpts)](#module_frontpoint..getPartition) ⇒ <code>Promise</code>
    * [~getSensors(sensorIDs, authOpts)](#module_frontpoint..getSensors) ⇒ <code>Promise</code>
    * [~armStay(partitionID, authOpts, opts)](#module_frontpoint..armStay) ⇒ <code>Promise</code>
    * [~armAway(partitionID, authOpts, opts)](#module_frontpoint..armAway) ⇒ <code>Promise</code>
    * [~disarm(partitionID, authOpts)](#module_frontpoint..disarm) ⇒ <code>Promise</code>

<a name="module_frontpoint..login"></a>

### frontpoint~login(username, password) ⇒ <code>Promise</code>
Authenticate with alarm.com using the my.frontpointsecurity.com single
sign-on portal. Returns an authentication object that can be passed to other
methods.

**Kind**: inner method of [<code>frontpoint</code>](#module_frontpoint)

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | FrontPoint username. |
| password | <code>string</code> | FrontPoint password. |

<a name="module_frontpoint..getCurrentState"></a>

### frontpoint~getCurrentState(systemID, authOpts) ⇒ <code>Promise</code>
Retrieve information about the current state of a security system including
attributes, partitions, sensors, and relationships.

**Kind**: inner method of [<code>frontpoint</code>](#module_frontpoint)

| Param | Type | Description |
| --- | --- | --- |
| systemID | <code>string</code> | ID of the FrontPoint system to query. The   Authentication object returned from the `login` method contains a `systems`   property which is an array of system IDs. |
| authOpts | <code>Object</code> | Authentication object returned from the `login`   method. |

<a name="module_frontpoint..getPartition"></a>

### frontpoint~getPartition(partitionID, authOpts) ⇒ <code>Promise</code>
Get information for a single security system partition.

**Kind**: inner method of [<code>frontpoint</code>](#module_frontpoint)

| Param | Type | Description |
| --- | --- | --- |
| partitionID | <code>string</code> | Partition ID to retrieve |
| authOpts | <code>Object</code> | Authentication object returned from the `login`   method. |

<a name="module_frontpoint..getSensors"></a>

### frontpoint~getSensors(sensorIDs, authOpts) ⇒ <code>Promise</code>
Get information for one or more sensors.

**Kind**: inner method of [<code>frontpoint</code>](#module_frontpoint)

| Param | Type | Description |
| --- | --- | --- |
| sensorIDs | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Array of sensor ID strings. |
| authOpts | <code>Object</code> | Authentication object returned from the `login`   method. |

<a name="module_frontpoint..armStay"></a>

### frontpoint~armStay(partitionID, authOpts, opts) ⇒ <code>Promise</code>
Arm a security system panel in "stay" mode. NOTE: This call generally takes
20-30 seconds to complete.

**Kind**: inner method of [<code>frontpoint</code>](#module_frontpoint)

| Param | Type | Description |
| --- | --- | --- |
| partitionID | <code>string</code> | Partition ID to arm. |
| authOpts | <code>Object</code> | Authentication object returned from the `login`   method. |
| opts | <code>Object</code> | Optional arguments for arming the system. |
| opts.noEntryDelay | <code>boolean</code> | Disable the 30-second entry delay. |
| opts.silentArming | <code>boolean</code> | Disable audible beeps and double the exit   delay. |

<a name="module_frontpoint..armAway"></a>

### frontpoint~armAway(partitionID, authOpts, opts) ⇒ <code>Promise</code>
Arm a security system panel in "away" mode. NOTE: This call generally takes
20-30 seconds to complete.

**Kind**: inner method of [<code>frontpoint</code>](#module_frontpoint)

| Param | Type | Description |
| --- | --- | --- |
| partitionID | <code>string</code> | Partition ID to arm. |
| authOpts | <code>Object</code> | Authentication object returned from the `login`   method. |
| opts | <code>Object</code> | Optional arguments for arming the system. |
| opts.noEntryDelay | <code>boolean</code> | Disable the 30-second entry delay. |
| opts.silentArming | <code>boolean</code> | Disable audible beeps and double the exit   delay. |

<a name="module_frontpoint..disarm"></a>

### frontpoint~disarm(partitionID, authOpts) ⇒ <code>Promise</code>
Disarm a security system panel. NOTE: This call generally takes 20-30 seconds
to complete.

**Kind**: inner method of [<code>frontpoint</code>](#module_frontpoint)

| Param | Type | Description |
| --- | --- | --- |
| partitionID | <code>string</code> | Partition ID to disarm. |
| authOpts | <code>Object</code> | Authentication object returned from the `login`   method. |
