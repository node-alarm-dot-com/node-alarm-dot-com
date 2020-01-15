/**
 * @module node-alarm-dot-com
 */

const fetch = require('node-fetch')

const ADCLOGIN_URL = 'https://www.alarm.com/pda/Default.aspx'
const IDENTITIES_URL = 'https://www.alarm.com/web/api/identities'
const HOME_URL = 'https://www.alarm.com/web/system/home'
const SYSTEM_URL = 'https://www.alarm.com/web/api/systems/systems/'
const PARTITIONS_URL = 'https://www.alarm.com/web/api/devices/partitions/'
const SENSORS_URL = 'https://www.alarm.com/web/api/devices/sensors'
const LIGHTS_URL = 'https://www.alarm.com/web/api/devices/lights/'
const LOCKS_URL = 'https://www.alarm.com/web/api/devices/locks/'
const CT_JSON = 'application/json;charset=UTF-8'
const UA = `node-alarm-dot-com/${require('./package').version}`

const SYSTEM_STATES = {
  UNKNOWN: 0,
  DISARMED: 1,
  ARMED_STAY: 2,
  ARMED_AWAY: 3,
  ARMED_NIGHT: 4
}

const SENSOR_STATES = {
  UNKNOWN: 0,
  CLOSED: 1,
  OPEN: 2,
  IDLE: 3,
  ACTIVE: 4,
  DRY: 5,
  WET: 6
}

const LOCK_STATES = {
  SECURED: 1,
  UNSECURED: 2
}

const LIGHT_STATES = {
  ON: 2,
  OFF: 3
}

const REL_TYPES = {
  PARTITION: 'devices/partition',
  LOCK: 'devices/lock',
  CAMERA: 'video/camera',
  GARAGE_DOOR: 'devices/garage-door',
  SCENE: 'automation/scene',
  SENSOR: 'devices/sensor',
  LIGHT: 'devices/light',
  THERMOSTAT: 'devices/thermostat',
  GEO_DEVICE: 'geolocation/geo-device',
  GEO_FENCE: 'geolocation/fence',
  CONFIGURATION: 'systems/configuration'
}

exports.login = login
exports.getCurrentState = getCurrentState

exports.armStay = armStay
exports.armAway = armAway
exports.disarm = disarm
exports.setLockSecure = setLockSecure
exports.setLockUnsecure = setLockUnsecure
exports.setLightOn = setLightOn
exports.setLightOff = setLightOff

exports.SYSTEM_STATES = SYSTEM_STATES
exports.SENSOR_STATES = SENSOR_STATES
exports.LOCK_STATES = LOCK_STATES
exports.LIGHT_STATES = LIGHT_STATES

// Exported methods ////////////////////////////////////////////////////////////

/**
 * Authenticate with alarm.com.
 * Returns an authentication object that can be passed to other methods.
 * 
 * @param {string} username Alarm.com username.
 * @param {string} password Alarm.com password.
 * @returns {Promise}
 */
function login(username, password) {
  let loginCookies, ajaxKey, loginFormBody, pdaSessionUrl

  // load initial mobile page
  return get(ADCLOGIN_URL)
    .then(res => {
      // capture and store sessionized redirect url to mobile login page
      pdaSessionUrl = res.headers.get('Location')
    })
    .then(res => {
      // get sessionized mobile login page
      return get(pdaSessionUrl)
        .then(res => {
          const loginObj = {
            '__EVENTTARGET': null,
            '__EVENTARGUMENT': null,
            '__VIEWSTATEENCRYPTED': null,
            '__EVENTVALIDATION': res.body.match(/name="__EVENTVALIDATION".*?value="([^"]*)"/)[1],
            '__VIEWSTATE': res.body.match(/name="__VIEWSTATE".*?value="([^"]*)"/)[1],
            '__VIEWSTATEGENERATOR': res.body.match(/name="__VIEWSTATEGENERATOR".*?value="([^"]*)"/)[1],
            'ctl00$ContentPlaceHolder1$txtLogin': username,
            'ctl00$ContentPlaceHolder1$txtPassword': password,
            'ctl00$ContentPlaceHolder1$btnLogin': 'Login'
          }
          loginFormBody = Object.keys(loginObj).map(k => encodeURIComponent(k)
            + '=' + encodeURIComponent(loginObj[k])).join('&')
        })
        .catch(err => {
          throw new Error(`GET ${pdaSessionUrl} failed: ${err.message || err}`)
        })
    })
    .then(res => {
      // submit form on sessionized mobile login page
      return fetch(pdaSessionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': UA,
            'Cookie': loginCookies
          },
          body: loginFormBody,
          redirect: 'manual'
        })
        .then(res => {
          // capture cookies
          loginCookies = res.headers.raw()['set-cookie']
            .map(c => c.split(';')[0]).join('; ')

          // get Mobile-to-Desktop web-API redirect
          return get(res.headers.get('Location'), {
              headers: {
                'Cookie': loginCookies
              },
              redirect: 'manual'
            })
            .then(res => {
              // capture new cookies with apikey and sessionid (very important)
              loginCookies = res.headers.raw()['set-cookie']
                .map(c => c.split(';')[0]).join('; ')
              // capture ajaxkey for future submission headers as well
              const re = /afg=([^;]+);/.exec(loginCookies)
              if (!re) throw new Error(`No afg cookie: ${loginCookies}`)
              ajaxKey = re[1]
            })
            .catch(err => {
              throw new Error(`GET ${res.headers.get('Location')} failed:
                              ${err.message || err}`)
            })
        })
        .catch(err => {
          throw new Error(`POST ${pdaSessionUrl} failed: ${err.message || err}`)
        })
    })
    .then(() =>
      get(IDENTITIES_URL, {
        headers: {
          Accept: 'application/vnd.api+json',
          Cookie: loginCookies,
          AjaxRequestUniqueKey: ajaxKey,
          Referer: 'https://www.alarm.com/web/system/home',
          'User-Agent': UA
        }
      })
    )
    .then(res => {
      const identities = res.body
      const systems = (identities.data || []).map(d =>
        getValue(d, 'relationships.selectedSystem.data.id')
      )

      return {
        cookie: loginCookies,
        ajaxKey: ajaxKey,
        systems: systems,
        identities: identities
      }
    })
}

/**
 * Retrieve information about the current state of a security system including
 * attributes, partitions, accessory components and relationships.
 * 
 * @param {string} systemID ID of the system to query. The Authentication object
 *   returned from the `login` method contains a `systems` property which is an
 *   array of system IDs.
 * @param {Object} authOpts Authentication object returned from the login.
 * @returns {Promise}
 */
function getCurrentState(systemID, authOpts) {
  return authenticatedGet(SYSTEM_URL + systemID, authOpts).then(res => {

    const rels = res.data.relationships
    const resultingComponentsContainer = []

    // push the results of getComponents into the resultingComponentsContainer

    const partitionIDs = rels.partitions.data.map(p => p.id)
    if (typeof partitionIDs[0] != 'undefined') {
      resultingComponentsContainer.push(getComponents(PARTITIONS_URL, partitionIDs, authOpts))
    }
    const sensorIDs = rels.sensors.data.map(s => s.id)
    if (typeof sensorIDs[0] != 'undefined') {
      resultingComponentsContainer.push(getComponents(SENSORS_URL, sensorIDs, authOpts))
    }
    const lightIDs = rels.lights.data.map(l => l.id)
    if (typeof lightIDs[0] != 'undefined') {
      resultingComponentsContainer.push(getComponents(LIGHTS_URL, lightIDs, authOpts))
    }
    const lockIDs = rels.locks.data.map(l => l.id)
    if (typeof lockIDs[0] != 'undefined') {
      resultingComponentsContainer.push(getComponents(LOCKS_URL, lockIDs, authOpts))
    }

    return Promise.all(resultingComponentsContainer)
    .then(resultingSystemComponents => {
      // destructured assignment
      const [partitions, sensors, lights, locks] = resultingSystemComponents
      return {
        id: res.data.id,
        attributes: res.data.attributes,
        partitions: typeof partitions != 'undefined' ? partitions.data : [],
        sensors: typeof sensors != 'undefined' ? sensors.data : [],
        lights: typeof lights != 'undefined' ? lights.data : [],
        locks: typeof locks != 'undefined' ? locks.data : [],
        relationships: rels
      }
    })

  })
}

/**
 * Get information about groups of components e.g., sensors, lights, locks, etc.
 *
 * @param {string} url Base request url
 * @param {string} componentIDs Array of ID to retrieve
 * @param {Object} authOpts Authentication object returned from the login.
 * @returns {Promise}
 */
function getComponents(url, componentIDs, authOpts) {
  const IDs = Array.isArray(componentIDs) ? componentIDs : [componentIDs];
  return authenticatedGet(`${url}?${IDs.map(id => `ids%5B%5D=${id}`).join('&')}`, authOpts);
}

// Partition methods ///////////////////////////////////////////////////////////

/**
 * Perform partition actions, e.g., armAway, armStay, disarm.
 *
 * @param {string} partitionID Partition ID to perform action on.
 * @param {string} action Action (verb) to perform on partition.
 * @param {Object} authOpts Authentication object returned from the login.
 * @param {Object} opts Additional options for the action.
 */
function partitionAction(partitionID, action, authOpts, opts) {
  const url = `${PARTITIONS_URL}${partitionID}/${action}`
  const postOpts = Object.assign({}, authOpts, {
    body: {
      noEntryDelay: action === 'disarm' ? undefined : Boolean(opts.noEntryDelay),
      silentArming: action === 'disarm' ? undefined : Boolean(opts.silentArming),
      statePollOnly: false
    }
  })
  return authenticatedPost(url, postOpts)
}

/**
 * Convenience Method:
 * Arm a security system panel in "stay" mode. NOTE: This call generally takes
 * 20-30 seconds to complete.
 * 
 * @param {string} partitionID Partition ID to arm.
 * @param {Object} authOpts Authentication object returned from the login.
 * @param {Object} opts Optional arguments for arming the system.
 * @param {boolean} opts.noEntryDelay Disable the 30-second entry delay.
 * @param {boolean} opts.silentArming Disable audible beeps and double the exit
 *   delay.
 * @returns {Promise}
 */
function armStay(partitionID, authOpts, opts) {
  return partitionAction(partitionID, 'armStay', authOpts, opts)
}

/**
 * Convenience Method:
 * Arm a security system panel in "away" mode. NOTE: This call generally takes
 * 20-30 seconds to complete.
 * 
 * @param {string} partitionID Partition ID to arm.
 * @param {Object} authOpts Authentication object returned from the login.
 * @param {Object} opts Optional arguments for arming the system.
 * @param {boolean} opts.noEntryDelay Disable the 30-second entry delay.
 * @param {boolean} opts.silentArming Disable audible beeps and double the exit
 *   delay.
 * @returns {Promise}
 */
function armAway(partitionID, authOpts, opts) {
  return partitionAction(partitionID, 'armAway', authOpts, opts)
}

/**
 * Convenience Method:
 * Disarm a security system panel. NOTE: This call generally takes 20-30 seconds
 * to complete.
 * 
 * @param {string} partitionID Partition ID to disarm.
 * @param {Object} authOpts Authentication object returned from the login.
 * @returns {Promise}
 */
function disarm(partitionID, authOpts) {
  return partitionAction(partitionID, 'disarm', authOpts)
}

// Sensor methods //////////////////////////////////////////////////////////////

// Sensors don't do anything, but they report state when we get information
// about any of the components, sensors included.

// Light methods ///////////////////////////////////////////////////////////////

/**
 * Perform light actions, e.g., turn on, turn off, change brightness level.
 *
 * @param {string} lightID Light ID string.
 * @param {string} action Action (verb) to perform on the light.
 * @param {Object} authOpts Authentication object returned from the login.
 * @param {number} brightness brightness An integer, 1-100, indicating brightness. Ignored.
 */
function lightAction(lightID, authOpts, brightness, action) {
  const url = `${LIGHTS_URL}${lightID}/${action}`
  const postOpts = Object.assign({}, authOpts, {
    body: {
      dimmerLevel: brightness,
      statePollOnly: false
    }
  })
  return authenticatedPost(url, postOpts)
}

/**
 * Convenience Method:
 * Sets a light to ON and adjusts brightness level (1-100) of dimmable lights.
 * 
 * @param {string} lightID Light ID string.
 * @param {number} brightness An integer, 1-100, indicating brightness.
 * @param {Object} authOpts Authentication object returned from the login.
 * @returns {Promise}
 */
function setLightOn(lightID, authOpts, brightness) {
  return lightAction(lightID, authOpts, brightness, 'turnOn')
}

/**
 * Convenience Method:
 * Sets a light to OFF. The brightness level is ignored.
 * 
 * @param {string} lightID Light ID string.
 * @param {number} brightness An integer, 1-100, indicating brightness. Ignored.
 * @param {Object} authOpts Authentication object returned from the login.
 * @returns {Promise}
 */
function setLightOff(lightID, authOpts, brightness) {
  return lightAction(lightID, authOpts, brightness, 'turnOff')
}

// Lock methods ////////////////////////////////////////////////////////////////

/**
 * Perform lock actions, e.g., lock, unlock.
 *
 * @param {string} lockID Lock ID string.
 * @param {string} action Action (verb) to perform on the lock.
 * @param {Object} authOpts Authentication object returned from the login.
 */
function lockAction(lockID, authOpts, action) {
  const url = `${LOCKS_URL}${lockID}/${action}`
  const postOpts = Object.assign({}, authOpts, {
    body: {
      statePollOnly: false
    }
  })
  return authenticatedPost(url, postOpts)
}

/**
 * Convenience Method:
 * Sets a lock to "locked" (SECURED).
 * 
 * @param {string} lockID Lock ID string.
 * @param {Object} authOpts Authentication object returned from the login.
 * @returns {Promise}
 */
function setLockSecure(lockID, authOpts) {
  return lockAction(lockID, authOpts, 'lock')
}

/**
 * Convenience Method:
 * Sets a lock to "unlocked" (UNSECURED).
 * 
 * @param {string} lockID Lock ID string.
 * @param {Object} authOpts Authentication object returned from the login.
 * @returns {Promise}
 */
function setLockUnsecure(lockID, authOpts) {
  return lockAction(lockID, authOpts, 'unlock')
}

// Helper methods //////////////////////////////////////////////////////////////

function getValue(data, path) {
  if (typeof path === 'string') path = path.split('.')
  for (let i = 0; typeof data === 'object' && i < path.length; i++)
    data = data[path[i]]
  return data
}

function authenticatedGet(url, opts) {
  opts = opts || {}
  opts.headers = opts.headers || {}
  opts.headers.Accept = 'application/vnd.api+json'
  opts.headers.AjaxRequestUniqueKey = opts.ajaxKey
  opts.headers.Cookie = opts.cookie
  opts.headers.Referer = HOME_URL
  opts.headers['User-Agent'] = UA

  return get(url, opts).then(res => res.body)
}

function authenticatedPost(url, opts) {
  opts = opts || {}
  opts.headers = opts.headers || {}
  opts.headers.Accept = 'application/vnd.api+json'
  opts.headers.AjaxRequestUniqueKey = opts.ajaxKey
  opts.headers.Cookie = opts.cookie
  opts.headers.Referer = HOME_URL
  opts.headers['User-Agent'] = UA
  opts.headers['Content-Type'] = 'application/json; charset=UTF-8'

  return post(url, opts).then(res => res.body)
}

function get(url, opts) {
  opts = opts || {}

  let status
  let resHeaders

  return fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: opts.headers
    })
    .then(res => {
      status = res.status
      resHeaders = res.headers

      const type = res.headers.get('content-type') || ''
      return type.indexOf('json') !== -1 ? res.json() : res.text()
    })
    .then(body => {
      if (status >= 400) throw new Error(body.Message || body || status)
      return {
        headers: resHeaders,
        body: body
      }
    })
    .catch(err => {
      throw new Error(`GET ${url} failed: ${err.message || err}`)
    })
}

function post(url, opts) {
  opts = opts || {}

  let status
  let resHeaders

  return fetch(url, {
      method: 'POST',
      redirect: 'manual',
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      headers: opts.headers
    })
    .then(res => {
      status = res.status
      resHeaders = res.headers
      return res.json()
    })
    .then(json => {
      if (status !== 200) throw new Error(json.Message || status)
      return {
        headers: resHeaders,
        body: json
      }
    })
    .catch(err => {
      throw new Error(`POST ${url} failed: ${err.message || err}`)
    })
}
