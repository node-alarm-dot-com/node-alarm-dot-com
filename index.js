/**
 * @module frontpoint
 */

const fetch = require('node-fetch')

const LOGIN_URL = 'https://my.frontpointsecurity.com/login'
const TOKEN_URL = 'https://my.frontpointsecurity.com/api/Login/token'
const SSO_URL = 'https://my.frontpointsecurity.com/api/Account/AdcRedirectUrl'
const IDENTITIES_URL = 'https://www.alarm.com/web/api/identities'
const HOME_URL = 'https://www.alarm.com/web/system/home'
const SYSTEM_URL = 'https://www.alarm.com/web/api/systems/systems/'
const PARTITION_URL = 'https://www.alarm.com/web/api/devices/partitions/'
const SENSORS_URL = 'https://www.alarm.com/web/api/devices/sensors'
const CT_JSON = 'application/json;charset=UTF-8'
const UA = `node-frontpoint/${require('./package').version}`

const SYSTEM_STATES = {
  DISARMED: 1,
  ARMED_STAY: 2, // FIXME: Check if these are correct
  ARMED_AWAY: 3
}

exports.login = login
exports.getCurrentState = getCurrentState
exports.getPartition = getPartition
exports.getSensors = getSensors
exports.armStay = armStay
exports.armAway = armAway
exports.disarm = disarm
exports.SYSTEM_STATES = SYSTEM_STATES

// Exported methods ////////////////////////////////////////////////////////////

/**
 * Authenticate with alarm.com using the my.frontpointsecurity.com single
 * sign-on portal. Returns an authentication object that can be passed to other
 * methods.
 * 
 * @param {string} username FrontPoint username.
 * @param {string} password FrontPoint password.
 * @returns {Promise}
 */
function login(username, password) {
  let loginCookies, ajaxKey

  return post(TOKEN_URL, {
    headers: { 'Content-Type': CT_JSON, Referer: LOGIN_URL, 'User-Agent': UA },
    body: { Username: username, Password: password, RememberMe: false }
  })
    .then(res => {
      const token = res.headers.get('x-fpsso')
      if (!token)
        throw new Error(`No X-FPSSO header: ${JSON.stringify(headers.raw())}`)

      return post(SSO_URL, {
        body: { Href: LOGIN_URL },
        headers: {
          'Content-Type': CT_JSON,
          Cookie: `FPTOKEN=${token}`,
          Authorization: `Bearer ${token}`,
          Referer: LOGIN_URL,
          'User-Agent': UA
        }
      })
    })
    .then(res => {
      const redirectUrl = res.body
      return fetch(redirectUrl, { method: 'GET', redirect: 'manual' })
    })
    .then(res => {
      const cookies = res.headers.raw()['set-cookie']
      loginCookies = cookies.map(c => c.split(';')[0]).join('; ')

      const re = /afg=([^;]+);/.exec(loginCookies)
      if (!re) throw new Error(`No afg cookie: ${loginCookies}`)

      ajaxKey = re[1]
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
 * attributes, partitions, sensors, and relationships.
 * 
 * @param {string} systemID ID of the FrontPoint system to query. The
 *   Authentication object returned from the `login` method contains a `systems`
 *   property which is an array of system IDs.
 * @param {Object} authOpts Authentication object returned from the `login`
 *   method.
 * @returns {Promise}
 */
function getCurrentState(systemID, authOpts) {
  return authenticatedGet(SYSTEM_URL + systemID, authOpts).then(res => {
    const rels = res.data.relationships
    const partTasks = rels.partitions.data.map(p =>
      getPartition(p.id, authOpts)
    )
    const sensorIDs = rels.sensors.data.map(s => s.id)

    return Promise.all([
      Promise.all(partTasks),
      getSensors(sensorIDs, authOpts)
    ]).then(partitionsAndSensors => {
      const [partitions, sensors] = partitionsAndSensors
      return {
        id: res.data.id,
        attributes: res.data.attributes,
        partitions: partitions.map(p => p.data),
        sensors: sensors.data,
        relationships: rels
      }
    })
  })
}

/**
 * Get information for a single security system partition.
 * 
 * @param {string} partitionID Partition ID to retrieve
 * @param {Object} authOpts Authentication object returned from the `login`
 *   method.
 * @returns {Promise}
 */
function getPartition(partitionID, authOpts) {
  return authenticatedGet(PARTITION_URL + partitionID, authOpts)
}

/**
 * Get information for one or more sensors.
 * 
 * @param {string|string[]} sensorIDs Array of sensor ID strings.
 * @param {Object} authOpts Authentication object returned from the `login`
 *   method.
 * @returns {Promise}
 */
function getSensors(sensorIDs, authOpts) {
  if (!Array.isArray(sensorIDs)) sensorIDs = [sensorIDs]
  const query = sensorIDs.map(id => `ids%5B%5D=${id}`).join('&')
  const url = `${SENSORS_URL}?${query}`
  return authenticatedGet(url, authOpts)
}

/**
 * Arm a security system panel in "stay" mode. NOTE: This call generally takes
 * 20-30 seconds to complete.
 * 
 * @param {string} partitionID Partition ID to arm.
 * @param {Object} authOpts Authentication object returned from the `login`
 *   method.
 * @param {Object} opts Optional arguments for arming the system.
 * @param {boolean} opts.noEntryDelay Disable the 30-second entry delay.
 * @param {boolean} opts.silentArming Disable audible beeps and double the exit
 *   delay.
 * @returns {Promise}
 */
function armStay(partitionID, authOpts, opts) {
  return arm(partitionID, 'armStay', authOpts, opts)
}

/**
 * Arm a security system panel in "away" mode. NOTE: This call generally takes
 * 20-30 seconds to complete.
 * 
 * @param {string} partitionID Partition ID to arm.
 * @param {Object} authOpts Authentication object returned from the `login`
 *   method.
 * @param {Object} opts Optional arguments for arming the system.
 * @param {boolean} opts.noEntryDelay Disable the 30-second entry delay.
 * @param {boolean} opts.silentArming Disable audible beeps and double the exit
 *   delay.
 * @returns {Promise}
 */
function armAway(partitionID, authOpts, opts) {
  return arm(partitionID, 'armAway', authOpts, opts)
}

/**
 * Disarm a security system panel. NOTE: This call generally takes 20-30 seconds
 * to complete.
 * 
 * @param {string} partitionID Partition ID to disarm.
 * @param {Object} authOpts Authentication object returned from the `login`
 *   method.
 * @returns {Promise}
 */
function disarm(partitionID, authOpts) {
  return arm(partitionID, 'disarm', authOpts)
}

// Helper methods //////////////////////////////////////////////////////////////

function arm(partitionID, verb, authOpts, opts) {
  const url = `${PARTITION_URL}${partitionID}/${verb}`
  const postOpts = Object.assign({}, authOpts, {
    body: {
      noEntryDelay: verb === 'disarm' ? undefined : Boolean(opts.noEntryDelay),
      silentArming: verb === 'disarm' ? undefined : Boolean(opts.silentArming),
      statePollOnly: false
    }
  })
  return authenticatedPost(url, postOpts)
}

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
      return { headers: resHeaders, body: body }
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
      return { headers: resHeaders, body: json }
    })
    .catch(err => {
      throw new Error(`POST ${url} failed: ${err.message || err}`)
    })
}
