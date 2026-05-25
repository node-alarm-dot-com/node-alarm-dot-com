import { AuthOpts } from './_models/AuthOpts';
import { PartitionState } from './_models/DeviceStates';
import { PartitionActionOptions } from './_models/PartitionActionOptions';
import { PARTITIONS_URL, authenticatedGet, authenticatedPost } from './_utils';

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
    nightArming: false,
    forceBypass: false
  };
  const url = `${PARTITIONS_URL}${partitionID}/${action}`;
  const body: {
    noEntryDelay?: boolean;
    silentArming?: boolean;
    statePollOnly: boolean;
    nightArming?: boolean;
    forceBypass?: boolean;
  } = {
    noEntryDelay: action === 'disarm' ? undefined : Boolean(opts.noEntryDelay),
    silentArming: action === 'disarm' ? undefined : Boolean(opts.silentArming),
    statePollOnly: false
  };
  // We only want to set nightArming when told to do so
  //This is because calling nightArm when not supported will break the action
  if (opts.nightArming === true) {
    body['nightArming'] = true;
  }

  if (opts.forceBypass === true) {
    body['forceBypass'] = true;
  }

  const postOpts = Object.assign({}, authOpts, { body });
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

async function getPartition(partitionID: string, authOpts: AuthOpts): Promise<PartitionState | undefined> {
  const res = await authenticatedGet(`${PARTITIONS_URL}${partitionID}`, authOpts);
  return res.data as PartitionState;
}

export async function getPartitions(partitionIDs: string[], authOpts: AuthOpts): Promise<PartitionState[]> {
  const results = await Promise.all(partitionIDs.map((id) => getPartition(id, authOpts)));
  return results.filter((p): p is PartitionState => p !== undefined);
}
