import { AuthOpts } from './_models/AuthOpts';
import { CameraSnapshotResponse } from './_models/DeviceStates';
import { CAMERA_SNAPSHOT_URL, authenticatedGet } from './_utils';

/**
 * Requests a fresh live-view snapshot for a camera and returns the signed, time-limited
 * URL that Alarm.com issues for it. The URL points at a separate video CDN host and is not
 * itself authenticated with Alarm.com session cookies.
 */
export async function getCameraSnapshotUrl(cameraId: string, authOpts: AuthOpts): Promise<string> {
  const res = (await authenticatedGet(`${CAMERA_SNAPSHOT_URL}${cameraId}`, authOpts)) as CameraSnapshotResponse;
  const { url, error } = res.data.attributes;

  if (error) {
    throw new Error(`Unable to get camera snapshot for ${cameraId}: ${error}`);
  }

  return url;
}
