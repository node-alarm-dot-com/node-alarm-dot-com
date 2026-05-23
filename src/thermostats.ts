import { AuthOpts } from './_models/AuthOpts';
import { THERMOSTAT_STATES } from './_models/States';
import { THERMOSTAT_URL, authenticatedPost } from './_utils';

/**
 * Update thermostat state
 *
 * @param {string} thermostatID  Thermostat ID string.
 * @param {Object} newState  New desired state.
 * @param {Object} authOpts  Authentication object returned from the `login` method.
 * @returns {Promise}
 */
export function setThermostatState(thermostatID: string, newState: THERMOSTAT_STATES, authOpts: AuthOpts) {
  const url = `${THERMOSTAT_URL}${thermostatID}/setState`;
  const postOpts = Object.assign({}, authOpts, {
    body: {
      desiredState: newState,
      statePollOnly: false
    }
  });
  return authenticatedPost(url, postOpts);
}

/**
 * Sets a thermostat target heat temperature.
 *
 * @param {string} thermostatID  Thermostat ID string.
 * @param {number} newTemp  New target temperature.
 * @param {Object} authOpts  Authentication object returned from the `login` method.
 * @returns {Promise}
 */
export function setThermostatTargetHeatTemperature(thermostatID: string, newTemp: number, authOpts: AuthOpts) {
  const url = `${THERMOSTAT_URL}${thermostatID}/setState`;
  const postOpts = Object.assign({}, authOpts, {
    body: {
      desiredHeatSetpoint: newTemp,
      statePollOnly: false
    }
  });
  return authenticatedPost(url, postOpts);
}

/**
 * Sets a thermostat target cool temperature.
 *
 * @param {string} thermostatID  Thermostat ID string.
 * @param {number} newTemp  New target temperature.
 * @param {Object} authOpts  Authentication object returned from the `login` method.
 * @returns {Promise}
 */
export function setThermostatTargetCoolTemperature(thermostatID: string, newTemp: number, authOpts: AuthOpts) {
  const url = `${THERMOSTAT_URL}${thermostatID}/setState`;
  const postOpts = Object.assign({}, authOpts, {
    body: {
      desiredCoolSetpoint: newTemp,
      statePollOnly: false
    }
  });
  return authenticatedPost(url, postOpts);
}
