import { AuthOpts } from './_models/AuthOpts';
import { LightState } from './_models/DeviceStates';
import { LIGHTS_URL, authenticatedGet, authenticatedPost } from './_utils';

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

async function getLight(lightID: string, authOpts: AuthOpts): Promise<LightState | undefined> {
  const res = await authenticatedGet(`${LIGHTS_URL}${lightID}`, authOpts);
  return res.data as LightState;
}

export async function getLights(lightIDs: string[], authOpts: AuthOpts): Promise<LightState[]> {
  const results = await Promise.all(lightIDs.map((id) => getLight(id, authOpts)));
  return results.filter((l): l is LightState => l !== undefined);
}
