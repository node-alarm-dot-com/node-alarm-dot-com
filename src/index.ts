/**
 * @module node-alarm-dot-com
 */

import fetch, { Headers } from 'node-fetch';
import { AuthOpts } from './_models/AuthOpts';
import { ApiDeviceState, DeviceState, GarageState } from './_models/DeviceStates';
import { IdentityResponse } from './_models/IdentityResponse';
import { PartitionActionOptions } from './_models/PartitionActionOptions';
import { RequestOptions } from './_models/RequestOptions';
import { FlattenedSystemState, Relationships } from './_models/SystemState';

export * from './_models/AuthOpts';
export * from './_models/DeviceStates';
export * from './_models/IdentityResponse';
export * from './_models/PartitionActionOptions';
export * from './_models/RequestOptions';
export * from './_models/SystemState';
export * from './_models/SensorType';

const ADCLOGIN_URL = 'https://www.alarm.com/login';
const ADCFORMLOGIN_URL = 'https://www.alarm.com/web/Default.aspx';
const IDENTITIES_URL = 'https://www.alarm.com/web/api/identities';
const HOME_URL = 'https://www.alarm.com/web/system/home';
const SYSTEM_URL = 'https://www.alarm.com/web/api/systems/systems/';
const PARTITIONS_URL = 'https://www.alarm.com/web/api/devices/partitions/';
const SENSORS_URL = 'https://www.alarm.com/web/api/devices/sensors';
const LIGHTS_URL = 'https://www.alarm.com/web/api/devices/lights/';
const GARAGE_URL = 'https://www.alarm.com/web/api/devices/garageDoors/';
const LOCKS_URL = 'https://www.alarm.com/web/api/devices/locks/';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const UA = `node-alarm-dot-com/${require('../package.json').version}`;

// Exported methods ////////////////////////////////////////////////////////////

/**
 * Authenticate with alarm.com.
 * Returns an authentication object that can be passed to other methods.
 *
 * @param {string} username  Alarm.com username.
 * @param {string} password  Alarm.com password.
 * @param {string} existingMfaToken MFA token from browser used to bypass MFA.
 * @returns {Promise}
 */
export async function login(username: string, password: string, existingMfaToken?: string): Promise<AuthOpts> {
  let loginCookies: string;
  let ajaxKey: string;
  let loginFormBody: string, identities: { data: any; }, systems: any;

  // load initial alarm.com page to gather required hidden form fields
  await get(ADCLOGIN_URL)
    .then(res => {
      /* eslint-disable @typescript-eslint/naming-convention */
      const loginObj: any = {
        '__EVENTTARGET': null,
        '__EVENTARGUMENT': null,
        '__VIEWSTATEENCRYPTED': null,
        '__EVENTVALIDATION': res.body.match(/name="__EVENTVALIDATION".*?value="([^"]*)"/)[1],
        '__VIEWSTATE': res.body.match(/name="__VIEWSTATE".*?value="([^"]*)"/)[1],
        '__VIEWSTATEGENERATOR': res.body.match(/name="__VIEWSTATEGENERATOR".*?value="([^"]*)"/)[1],
        '__PREVIOUSPAGE': res.body.match(/name="__PREVIOUSPAGE".*?value="([^"]*)"/)[1],
        'IsFromNewSite': '1',
        'ctl00$ContentPlaceHolder1$loginform$txtUserName': username,
        'txtPassword': password
      };
      /* eslint-enable @typescript-eslint/naming-convention */
      // build login form body
      loginFormBody = Object.keys(loginObj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(loginObj[k])).join('&');
    })
    .catch(err => {
      throw new Error(`GET ${ADCLOGIN_URL} failed: ${err.message || err}`);
    });

  await fetch(ADCFORMLOGIN_URL, {
    method: 'POST',
    /* eslint-disable @typescript-eslint/naming-convention */
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
      'Cookie': `twoFactorAuthenticationId=${existingMfaToken};`
    },
    /* eslint-enable @typescript-eslint/naming-convention */
    body: loginFormBody,
    redirect: 'manual'
  })
    .then(res => {
      loginCookies = res.headers.raw()['set-cookie'].map(c => c.split(';')[0]).join('; ');
      // gather ajaxkey for session headers
      const re = /afg=([^;]+);/.exec(loginCookies);
      if (!re) {
        throw new Error(`No afg cookie: ${loginCookies}`);
      }
      ajaxKey = re[1];
    })
    .catch((err) => {
      throw new Error(`POST ${ADCFORMLOGIN_URL} failed: ${err.message || err}`);
    });

  await get(IDENTITIES_URL, {
    /* eslint-disable @typescript-eslint/naming-convention */
    headers: {
      'Accept': 'application/vnd.api+json',
      'Cookie': loginCookies,
      'ajaxrequestuniquekey': ajaxKey,
      'Referer': 'https://www.alarm.com/web/system/home',
      'User-Agent': UA
    }
    /* eslint-enable @typescript-eslint/naming-convention */
  })
    .then(res => {
      // gather identities and systems
      identities = res.body;
      systems = (identities.data || []).map((d: IdentityResponse) => getValue(d, 'relationships.selectedSystem.data.id'));
    })
    .catch(err => {
      throw new Error(`GET ${IDENTITIES_URL} failed: ${err.message || err}`);
    });

  return {
    cookie: loginCookies,
    ajaxKey: ajaxKey,
    systems: systems,
    identities: identities
  } as AuthOpts;

}


/**
 * Retrieve information about the current state of a security system including
 * attributes, partitions, accessory components and relationships.
 *
 * @param {string} systemID  ID of the system to query. The Authentication
 *   object returned from the `login` method contains a `systems` property which
 *   is an array of system IDs.
 * @param {Object} authOpts  Authentication object returned from the login.
 * @returns {Promise}
 */
export async function getCurrentState(systemID: string, authOpts: AuthOpts): Promise<FlattenedSystemState> {
  // This call to the systems endpoint retrieves an overview of all devices in a system
  const res = await authenticatedGet(SYSTEM_URL + systemID, authOpts);
  const rels: Relationships = res.data.relationships;
  const components = new Map<string, ApiDeviceState>();
  // push the results of getComponents into the components
  // Now we go through and get detailed information about all devices
  const partitionIDs = rels.partitions.data.map(partition => partition.id);
  if (typeof partitionIDs[0] !== 'undefined') {
    components.set('partitions', await getComponents(PARTITIONS_URL, partitionIDs, authOpts));
  }
  const sensorIDs = rels.sensors.data.map(sensor => sensor.id);
  if (typeof sensorIDs[0] !== 'undefined') {
    components.set('sensors', await getComponents(SENSORS_URL, sensorIDs, authOpts));
  }
  const lightIDs = rels.lights.data.map(light => light.id);
  if (typeof lightIDs[0] !== 'undefined') {
    components.set('lights', await getComponents(LIGHTS_URL, lightIDs, authOpts));
  }
  const lockIDs = rels.locks.data.map(lock => lock.id);
  if (typeof lockIDs[0] !== 'undefined') {
    components.set('locks', await getComponents(LOCKS_URL, lockIDs, authOpts));
  }
  const garageIDs = rels.garageDoors.data.map(garage => garage.id);
  if (typeof garageIDs[0] !== 'undefined') {
    components.set('garages', await getComponents(GARAGE_URL, garageIDs, authOpts));
  }

  return ({
    id: res.data.id,
    attributes: res.data.attributes,
    partitions: components.has('partitions') ? components.get('partitions').data : [],
    sensors: components.has('sensors') ? components.get('sensors').data : [],
    lights: components.has('lights') ? components.get('lights').data : [],
    locks: components.has('locks') ? components.get('locks').data : [],
    garages: components.has('garages') ? components.get('garages').data : [],
    relationships: rels
  }) as FlattenedSystemState;
}

/**
 * Get information about groups of components e.g., sensors, lights, locks, garages, etc.
 *
 * @param {string} url  Base request url.
 * @param {string} componentIDs  Array of ID to retrieve.
 * @param {Object} authOpts  Authentication object returned from the login.
 * @returns {Promise}
 */
export async function getComponents(url: string, componentIDs: string[], authOpts: AuthOpts): Promise<ApiDeviceState> {
  const IDs = Array.isArray(componentIDs) ? componentIDs : [componentIDs];
  let requests: Promise<ApiDeviceState>[] = [];

  if (IDs.length <= 50) {
    const getUrl = `${url}?${IDs.map(id => `ids%5B%5D=${id}`).join('&')}`;
    requests.push(authenticatedGet(getUrl, authOpts));
  } else {
    // We have found that the Alarm.com API will return a 404 error when there is an excessive number of query parameters.
    // We get around this by breaking up our GET calls into shorter URIs.
    const shortenedUrls: string[] = [];
    while (IDs.length > 50) {
      const currentArray = IDs.splice(0, 50);
      shortenedUrls.push(`${url}?${currentArray.map(id => `ids%5B%5D=${id}`).join('&')}`);
    }
    shortenedUrls.push(`${url}?${IDs.map(id => `ids%5B%5D=${id}`).join('&')}`);
    requests = shortenedUrls.map(u => authenticatedGet(u, authOpts));
  }
  return await combineAPIDeviceAPICalls(requests);
}

async function combineAPIDeviceAPICalls(apiCalls: Promise<ApiDeviceState>[]): Promise<ApiDeviceState> {
  const apiStateCalls = await Promise.all(apiCalls);

  const stateToReturn = {
    data: [] as DeviceState[],
    included: []
  } as ApiDeviceState;
  for (const apiCall of apiStateCalls) {
    for (const apiData of (apiCall.data) as DeviceState[]) {
      (stateToReturn.data as DeviceState[]).push(apiData);
    }

    for (const apiInclude of apiCall.included) {
      stateToReturn.included.push(apiInclude);
    }
  }

  stateToReturn.meta = apiStateCalls[0].meta;

  return stateToReturn;
}


// Partition methods ///////////////////////////////////////////////////////////

/**
 * Perform partition actions, e.g., armAway, armStay, disarm.
 *
 * @param {string} partitionID  Partition ID to perform action on.
 * @param {string} action  Action (verb) to perform on partition.
 * @param {Object} authOpts  Authentication object returned from the login.
 * @param {Object} opts  Additional options for the action.
 */
function partitionAction(partitionID: string, action: string, authOpts: AuthOpts, opts?: PartitionActionOptions) {
  opts = opts || {
    noEntryDelay: false,
    silentArming: false,
    nightArming: false
  };
  const url = `${PARTITIONS_URL}${partitionID}/${action}`;
  const body = {
    noEntryDelay: action === 'disarm' ? undefined : Boolean(opts.noEntryDelay),
    silentArming: action === 'disarm' ? undefined : Boolean(opts.silentArming),
    statePollOnly: false
  };
  // We only want to set nightArming when told to do so
  //This is because calling nightArm when not supported will break the action
  if (opts.nightArming) {
    body['nightArming'] = true;
  }

  const postOpts = Object.assign({}, authOpts, {body});
  return authenticatedPost(url, postOpts);
}

/**
 * Convenience Method:
 * Arm a security system panel in "stay" mode. NOTE: This call generally takes
 * 20-30 seconds to complete.
 *
 * @param {string} partitionID  Partition ID to arm.
 * @param {Object} authOpts  Authentication object returned from the login.
 * @param {Object} opts  Optional arguments for arming the system.
 * @param {boolean} opts.noEntryDelay  Disable the 30-second entry delay.
 * @param {boolean} opts.silentArming  Disable audible beeps and double the exit
 *   delay.
 * @returns {Promise}
 */
export function armStay(partitionID: string, authOpts: AuthOpts, opts: PartitionActionOptions) {
  return partitionAction(partitionID, 'armStay', authOpts, opts);
}

/**
 * Convenience Method:
 * Arm a security system panel in "away" mode. NOTE: This call generally takes
 * 20-30 seconds to complete.
 *
 * @param {string} partitionID  Partition ID to arm.
 * @param {Object} authOpts  Authentication object returned from the login.
 * @param {Object} opts  Optional arguments for arming the system.
 * @param {boolean} opts.noEntryDelay  Disable the 30-second entry delay.
 * @param {boolean} opts.silentArming  Disable audible beeps and double the exit
 *   delay.
 * @returns {Promise}
 */
export function armAway(partitionID: string, authOpts: AuthOpts, opts: PartitionActionOptions) {
  return partitionAction(partitionID, 'armAway', authOpts, opts);
}

/**
 * Convenience Method:
 * Disarm a security system panel. NOTE: This call generally takes 20-30 seconds
 * to complete.
 *
 * @param {string} partitionID  Partition ID to disarm.
 * @param {Object} authOpts  Authentication object returned from the login.
 * @returns {Promise}
 */
export function disarm(partitionID: string, authOpts: AuthOpts) {
  return partitionAction(partitionID, 'disarm', authOpts);
}


// Sensor methods //////////////////////////////////////////////////////////////

// Sensors don't do anything, but they report state when we get information
// about any of the components, sensors included.


// Light methods ///////////////////////////////////////////////////////////////

/**
 * Perform non-dimmable light actions, i.e. turn on, turn off
 *
 * @param {string} lightID  Light ID string.
 * @param {string} action  Action (verb) to perform on the light.
 * @param {Object} authOpts  Authentication object returned from the login.
 */
function lightAction(lightID: string, authOpts: AuthOpts, action: string) {
  const url = `${LIGHTS_URL}${lightID}/${action}`;
  const postOpts = Object.assign({}, authOpts, {
    body: {
      statePollOnly: false
    }
  });
  return authenticatedPost(url, postOpts);
}

/**
 * Perform dimmable light actions, e.g., turn on, turn off, change brightness level.
 *
 * @param {string} lightID  Light ID string.
 * @param {string} action  Action (verb) to perform on the light.
 * @param {Object} authOpts  Authentication object returned from the login.
 * @param {number} brightness  An integer, 1-100, indicating brightness.
 */
function dimmerAction(lightID: string, authOpts: AuthOpts, brightness: number, action: string) {
  const url = `${LIGHTS_URL}${lightID}/${action}`;
  const postOpts = Object.assign({}, authOpts, {
    body: {
      dimmerLevel: brightness,
      statePollOnly: false
    }
  });
  return authenticatedPost(url, postOpts);
}

/**
 * Convenience Method:
 * Sets a light to ON and adjusts brightness level (1-100) of dimmable lights.
 *
 * @param {string} lightID  Light ID string.
 * @param {number} brightness  An integer, 1-100, indicating brightness.
 * @param {Object} authOpts  Authentication object returned from the login.
 * @param {boolean} isDimmer  Indicates whether or not light is dimmable.
 * @returns {Promise}
 */
export function setLightOn(lightID: string, authOpts: AuthOpts, brightness: number, isDimmer: boolean) {
  if (isDimmer) {
    return dimmerAction(lightID, authOpts, brightness, 'turnOn');
  } else {
    return lightAction(lightID, authOpts, 'turnOn');
  }
}

/**
 * Convenience Method:
 * Sets a light to OFF. The brightness level is ignored.
 *
 * @param {string} lightID  Light ID string.
 * @param {number} brightness  An integer, 1-100, indicating brightness. Ignored.
 * @param {Object} authOpts  Authentication object returned from the login.
 * @param {boolean} isDimmer  Indicates whether or not light is dimmable.
 * @returns {Promise}
 */
export function setLightOff(lightID: string, authOpts: AuthOpts, brightness: number, isDimmer: boolean) {
  if (isDimmer) {
    return dimmerAction(lightID, authOpts, brightness, 'turnOff');
  } else {
    return lightAction(lightID, authOpts, 'turnOff');
  }
}


// Lock methods ////////////////////////////////////////////////////////////////

/**
 * Perform lock actions, e.g., lock, unlock.
 *
 * @param {string} lockID  Lock ID string.
 * @param {string} action  Action (verb) to perform on the lock.
 * @param {Object} authOpts  Authentication object returned from the login.
 */
function lockAction(lockID: string, authOpts: AuthOpts, action: string) {
  const url = `${LOCKS_URL}${lockID}/${action}`;
  const postOpts = Object.assign({}, authOpts, {
    body: {
      statePollOnly: false
    }
  });
  return authenticatedPost(url, postOpts);
}

/**
 * Convenience Method:
 * Sets a lock to "locked" (SECURED).
 *
 * @param {string} lockID  Lock ID string.
 * @param {Object} authOpts  Authentication object returned from the login.
 * @returns {Promise}
 */
export function setLockSecure(lockID: string, authOpts: AuthOpts) {
  return lockAction(lockID, authOpts, 'lock');
}

/**
 * Convenience Method:
 * Sets a lock to "unlocked" (UNSECURED).
 *
 * @param {string} lockID  Lock ID string.
 * @param {Object} authOpts  Authentication object returned from the login.
 * @returns {Promise}
 */
export function setLockUnsecure(lockID: string, authOpts: AuthOpts) {
  return lockAction(lockID, authOpts, 'unlock');
}

// Garage methods ////////////////////////////////////////////////////////////////
/**
 * Get information for one or more garages.
 *
 * @param {string[]} garageIDs Array of Garage ID strings.
 * @param {Object} authOpts Authentication object returned from the `login`
 *   method.
 * @returns {Promise}
 */
function getGarages(garageIDs: string[], authOpts: AuthOpts): Promise<GarageState> {
  if (!Array.isArray(garageIDs)) {
    garageIDs = [garageIDs];
  }
  const query = garageIDs.map(id => `ids%5B%5D=${id}`).join('&');
  const url = `${GARAGE_URL}?${query}`;
  return authenticatedGet(url, authOpts);
}

/**
 * Sets a garage to CLOSED.
 *
 *
 * @param {string} garageID Lock ID string.
 * @param {Object} authOpts Authentication object returned from the `login`
 *   method.
 * @returns {Promise}
 */
export function closeGarage(garageID: string, authOpts: AuthOpts) {
  const url = `${GARAGE_URL}${garageID}/close`;
  const postOpts = Object.assign({}, authOpts, {
    body: {
      statePollOnly: false
    }
  });
  return authenticatedPost(url, postOpts);
}

/**
 * Sets a garage to OPEN.
 *
 * @param {string} garageID Lock ID string.
 * @param {Object} authOpts Authentication object returned from the `login`
 *   method.
 * @returns {Promise}
 */
export function openGarage(garageID: string, authOpts: AuthOpts) {
  const url = `${GARAGE_URL}${garageID}/open`;
  const postOpts = Object.assign({}, authOpts, {
    body: {
      statePollOnly: false
    }
  });
  return authenticatedPost(url, postOpts);
}

// Helper methods //////////////////////////////////////////////////////////////

function getValue(data: any, path: string | any[]) {
  if (typeof path === 'string') {
    path = path.split('.');
  }
  for (let i = 0; typeof data === 'object' && i < path.length; i++) {
    data = data[path[i]];
  }
  return data;
}

async function authenticatedGet(url: string, opts: any) {
  opts = opts || {};
  opts.headers = opts.headers || {} as Headers;
  opts.headers.Accept = 'application/vnd.api+json';
  opts.headers.ajaxrequestuniquekey = opts.ajaxKey;
  opts.headers.Cookie = opts.cookie;
  opts.headers.Referer = HOME_URL;
  opts.headers['User-Agent'] = UA;

  const res = await get(url, opts);
  return res.body;
}

async function authenticatedPost(url: string, opts: any) {
  opts = opts || {};
  opts.headers = opts.headers || {};
  opts.headers.Accept = 'application/vnd.api+json';
  opts.headers.ajaxrequestuniquekey = opts.ajaxKey;
  opts.headers.Cookie = opts.cookie;
  opts.headers.Referer = HOME_URL;
  opts.headers['User-Agent'] = UA;
  opts.headers['Content-Type'] = 'application/json; charset=UTF-8';

  const res = await post(url, opts);
  return res.body;
}

async function get(url: string, opts?: any): Promise<{ headers: Headers; body: any }> {
  opts = opts || {} as RequestOptions;

  let status: number;
  let resHeaders: Headers;

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: opts.headers
    });

    status = res.status;
    resHeaders = res.headers;

    const type = res.headers.get('content-type') || '';
    const body: any = await (type.indexOf('json') !== -1 ? (res.status === 204 ? {} : res.json()) : res.text());

    if (status === 409) {
      throw new Error('Two factor is enabled on this account but not setup in the plugin.' +
        ' See the wiki for details');
    }
    if (status >= 400) {
      throw new Error(body.Message || body || status);
    }
    return {
      headers: resHeaders,
      body: body
    };
  } catch (err) {
    throw new Error(`GET ${url} failed: ${err.message || err}`);
  }
}

async function post(url: string, opts: RequestOptions) {
  opts = opts || {} as RequestOptions;

  let status: number;
  let resHeaders: Headers;

  try {
    const res = await fetch(url, {
      method: 'POST',
      redirect: 'manual',
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      headers: opts.headers
    });
    status = res.status;
    resHeaders = res.headers;
    const json: any = await (res.status === 204 ? {} : res.json());
    if (status !== 200) {
      throw new Error(json.Message || status);
    }
    return {
      headers: resHeaders,
      body: json
    };
  } catch (err) {
    throw new Error(`POST ${url} failed: ${err.message || err}`);
  }
}
