Node.js Frontpoint Client
=========================

Unofficial [FrontPoint Security](http://frontpointsecurity.com/) API client.

Currently supports querying security system and sensor states. Support for
arming/disarming is coming soon.

Usage
-----

`npm i frontpoint`

```js
const frontpoint = require('frontpoint')

frontpoint
  .login('your_username', 'your_password')
  .then(frontpoint.getCurrentState(res.systems[0], res))
  .then(res => {
    console.log('Security Systems:', res.partitions)
    console.log('Sensors:', res.sensors)
  })
```
