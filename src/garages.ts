import { AuthOpts } from './_models/AuthOpts';
import { GARAGE_URL, authenticatedPost } from './_utils';

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
