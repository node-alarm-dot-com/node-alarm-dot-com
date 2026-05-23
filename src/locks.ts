import { AuthOpts } from './_models/AuthOpts';
import { LOCKS_URL, authenticatedPost } from './_utils';

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
