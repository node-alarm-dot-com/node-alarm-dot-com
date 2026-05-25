import fetch from 'node-fetch';
import { AuthOpts } from './_models/AuthOpts';
import { ApiDeviceState } from './_models/DeviceStates';
import { IdentityData, IdentityResponse } from './_models/IdentityResponse';
import { FlattenedSystemState, Relationships } from './_models/SystemState';
import {
  ADCLOGIN_URL,
  ADCFORMLOGIN_URL,
  IDENTITIES_URL,
  SYSTEM_URL,
  PARTITIONS_URL,
  SENSORS_URL,
  LIGHTS_URL,
  GARAGE_URL,
  THERMOSTAT_URL,
  LOCKS_URL,
  UA,
  authenticatedGet,
  getComponents,
  get,
  describeError
} from './_utils';

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
  let loginCookies = '';
  let ajaxKey = '';
  let loginFormBody = '';
  let identities: IdentityResponse = {} as IdentityResponse;
  let systems: string[] = [];

  // load initial alarm.com page to gather required hidden form fields
  await get(ADCLOGIN_URL)
    .then((res) => {
      const loginObj: Record<string, string | null> = {
        __EVENTTARGET: null,
        __EVENTARGUMENT: null,
        __VIEWSTATEENCRYPTED: null,
        __EVENTVALIDATION: res.body.match(/name="__EVENTVALIDATION".*?value="([^"]*)"/)[1],
        __VIEWSTATE: res.body.match(/name="__VIEWSTATE".*?value="([^"]*)"/)[1],
        __VIEWSTATEGENERATOR: res.body.match(/name="__VIEWSTATEGENERATOR".*?value="([^"]*)"/)[1],
        __PREVIOUSPAGE: res.body.match(/name="__PREVIOUSPAGE".*?value="([^"]*)"/)[1],
        IsFromNewSite: '1',
        ctl00$ContentPlaceHolder1$loginform$txtUserName: username,
        txtPassword: password
      };
      // build login form body
      loginFormBody = Object.keys(loginObj)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(String(loginObj[k])))
        .join('&');
    })
    .catch((err) => {
      throw new Error(`GET ${ADCLOGIN_URL} failed: ${describeError(err)}`);
    });

  await fetch(ADCFORMLOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
      Cookie: `twoFactorAuthenticationId=${existingMfaToken};`
    },
    body: loginFormBody,
    redirect: 'manual'
  })
    .then((res) => {
      loginCookies = (res.headers.raw()['set-cookie'] ?? []).map((c) => c.split(';')[0]).join('; ');
      // gather ajaxkey for session headers
      const re = /afg=([^;]+);/.exec(loginCookies);
      if (!re) {
        throw new Error(`No afg cookie: ${loginCookies}`);
      }
      ajaxKey = re[1] ?? '';
    })
    .catch((err) => {
      throw new Error(`POST ${ADCFORMLOGIN_URL} failed: ${err.describeError(err)}`);
    });

  await getIdentitiesState(loginCookies, ajaxKey)
    .then((res) => {
      identities = res;
      systems = (res.data || []).map((d: IdentityData) => {
        return d.relationships.selectedSystem.data.id;
      });
    })
    .catch((err) => {
      throw new Error(`GET ${IDENTITIES_URL} failed: ${err.describeError(err)}`);
    });

  return {
    cookie: loginCookies,
    ajaxKey: ajaxKey,
    systems: systems,
    identities: identities
  } as AuthOpts;
}

/**
 * This function returns the alarm.com system identity for the currently logged in system.
 * The information returned is useful for finding current systems and global config.
 */
export async function getIdentitiesState(loginCookies: string, ajaxKey: string): Promise<IdentityResponse> {
  return await get(IDENTITIES_URL, {
    headers: {
      Accept: 'application/vnd.api+json',
      Cookie: loginCookies,
      ajaxrequestuniquekey: ajaxKey,
      Referer: 'https://www.alarm.com/web/system/home',
      'User-Agent': UA
    }
  })
    .then((res) => {
      // gather identities and systems
      return res.body as IdentityResponse;
    })
    .catch((err) => {
      throw new Error(`GET ${IDENTITIES_URL} failed: ${err.describeError(err)}`);
    });
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
  const partitionIDs = rels.partitions.data.map((partition) => partition.id);
  if (typeof partitionIDs[0] !== 'undefined') {
    components.set('partitions', await getComponents(PARTITIONS_URL, partitionIDs, authOpts));
  }
  const sensorIDs = rels.sensors.data.map((sensor) => sensor.id);
  if (typeof sensorIDs[0] !== 'undefined') {
    components.set('sensors', await getComponents(SENSORS_URL, sensorIDs, authOpts));
  }
  const lightIDs = rels.lights.data.map((light) => light.id);
  if (typeof lightIDs[0] !== 'undefined') {
    components.set('lights', await getComponents(LIGHTS_URL, lightIDs, authOpts));
  }
  const lockIDs = rels.locks.data.map((lock) => lock.id);
  if (typeof lockIDs[0] !== 'undefined') {
    components.set('locks', await getComponents(LOCKS_URL, lockIDs, authOpts));
  }
  const garageIDs = rels.garageDoors.data.map((garage) => garage.id);
  if (typeof garageIDs[0] !== 'undefined') {
    components.set('garages', await getComponents(GARAGE_URL, garageIDs, authOpts));
  }
  const thermostatIDs = rels.thermostats.data.map((thermostat) => thermostat.id);
  if (typeof thermostatIDs[0] !== 'undefined') {
    components.set('thermostats', await getComponents(THERMOSTAT_URL, thermostatIDs, authOpts));
  }

  return {
    id: res.data.id,
    attributes: res.data.attributes,
    partitions: components.has('partitions') ? components.get('partitions')!.data : [],
    sensors: components.has('sensors') ? components.get('sensors')!.data : [],
    lights: components.has('lights') ? components.get('lights')!.data : [],
    locks: components.has('locks') ? components.get('locks')!.data : [],
    garages: components.has('garages') ? components.get('garages')!.data : [],
    thermostats: components.has('thermostats') ? components.get('thermostats')!.data : [],
    relationships: rels
  } as FlattenedSystemState;
}
