import { AuthOpts } from './_models/AuthOpts';
import { GarageState } from './_models/DeviceStates';
import { GARAGE_URL, authenticatedGet, authenticatedPost } from './_utils';

/**
 * Sets a garage to CLOSED.
 *
 * @param {string} garageID  Garage ID string.
 * @param {Object} authOpts  Authentication object returned from the `login` method.
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
 * @param {string} garageID  Garage ID string.
 * @param {Object} authOpts  Authentication object returned from the `login` method.
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

async function getGarage(garageID: string, authOpts: AuthOpts): Promise<GarageState | undefined> {
  const res = await authenticatedGet(`${GARAGE_URL}${garageID}`, authOpts);
  return res.data as GarageState;
}

export async function getGarages(garageIDs: string[], authOpts: AuthOpts): Promise<GarageState[]> {
  const results = await Promise.all(garageIDs.map((id) => getGarage(id, authOpts)));
  return results.filter((g): g is GarageState => g !== undefined);
}
