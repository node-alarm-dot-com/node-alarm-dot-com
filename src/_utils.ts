import fetch, { Headers } from 'node-fetch';
import packageJson from '../package.json';
import { AuthOpts } from './_models/AuthOpts';
import { ApiDeviceState, DeviceState } from './_models/DeviceStates';
import { RequestOptions } from './_models/RequestOptions';
import { inspect } from 'util';

export const ADCLOGIN_URL = 'https://www.alarm.com/login';
export const ADCFORMLOGIN_URL = 'https://www.alarm.com/web/Default.aspx';
export const IDENTITIES_URL = 'https://www.alarm.com/web/api/identities';
export const HOME_URL = 'https://www.alarm.com/web/system/home';
export const SYSTEM_URL = 'https://www.alarm.com/web/api/systems/systems/';
export const PARTITIONS_URL = 'https://www.alarm.com/web/api/devices/partitions/';
export const SENSORS_URL = 'https://www.alarm.com/web/api/devices/sensors';
export const LIGHTS_URL = 'https://www.alarm.com/web/api/devices/lights/';
export const GARAGE_URL = 'https://www.alarm.com/web/api/devices/garageDoors/';
export const THERMOSTAT_URL = 'https://www.alarm.com/web/api/devices/thermostats/';
export const LOCKS_URL = 'https://www.alarm.com/web/api/devices/locks/';
export const UA = `node-alarm-dot-com/${packageJson.version}`;

export async function authenticatedGet(url: string, opts: AuthOpts) {
  const headers = {
    Accept: 'application/vnd.api+json',
    ajaxrequestuniquekey: opts.ajaxKey,
    Cookie: opts.cookie,
    Referer: HOME_URL,
    'User-Agent': UA
  };
  const res = await get(url, { headers });
  return res.body;
}

export async function authenticatedPost(url: string, opts: AuthOpts & { body?: Record<string, unknown> }) {
  const headers = {
    Accept: 'application/vnd.api+json',
    ajaxrequestuniquekey: opts.ajaxKey,
    Cookie: opts.cookie,
    Referer: HOME_URL,
    'User-Agent': UA,
    'Content-Type': 'application/json; charset=UTF-8'
  };
  const res = await post(url, { headers, body: opts.body });
  return res.body;
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
    const getUrl = `${url}?${IDs.map((id) => `ids%5B%5D=${id}`).join('&')}`;
    requests.push(authenticatedGet(getUrl, authOpts));
  } else {
    // We have found that the Alarm.com API will return a 404 error when there is an excessive number of query parameters.
    // We get around this by breaking up our GET calls into shorter URIs.
    const shortenedUrls: string[] = [];
    while (IDs.length > 50) {
      const currentArray = IDs.splice(0, 50);
      shortenedUrls.push(`${url}?${currentArray.map((id) => `ids%5B%5D=${id}`).join('&')}`);
    }
    shortenedUrls.push(`${url}?${IDs.map((id) => `ids%5B%5D=${id}`).join('&')}`);
    requests = shortenedUrls.map((u) => authenticatedGet(u, authOpts));
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
    for (const apiData of apiCall.data as DeviceState[]) {
      (stateToReturn.data as DeviceState[]).push(apiData);
    }

    for (const apiInclude of apiCall.included) {
      stateToReturn.included.push(apiInclude);
    }
  }

  stateToReturn.meta = apiStateCalls[0]!.meta;

  return stateToReturn;
}

export async function get(url: string, opts?: { headers?: Record<string, string> }) {
  let status: number;
  let resHeaders: Headers;

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: opts?.headers
    });

    status = res.status;
    resHeaders = res.headers;

    const type = res.headers.get('content-type') || '';
    const body = await (type.indexOf('json') !== -1 ? (res.status === 204 ? {} : res.json()) : res.text());

    if (status === 409) {
      throw new Error(
        'Two factor is enabled on this account but not setup in the plugin.' + ' See the wiki for details'
      );
    }
    if (status >= 400) {
      throw new Error(`status=${status}; body=${describeError(body)}`);
    }
    return {
      headers: resHeaders,
      body: body
    };
  } catch (err) {
    throw new Error(`GET ${url} failed: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
  }
}

async function post(url: string, opts: RequestOptions) {
  opts = opts || ({} as RequestOptions);

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
    const json = await (res.status === 204 ? {} : res.json());
    if (status !== 200) {
      throw new Error(`status=${status}; body=${describeError(json)}`);
    }
    return {
      headers: resHeaders,
      body: json
    };
  } catch (err) {
    throw new Error(`POST ${url} failed: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
  }
}

export function describeError(err: unknown): string {
  if (err instanceof Error) {
    return err.stack || err.message;
  }

  return inspect(err, {
    depth: 8,
    breakLength: 120
  });
}
