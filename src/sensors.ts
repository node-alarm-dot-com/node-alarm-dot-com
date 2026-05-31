import { AuthOpts } from './_models/AuthOpts';
import { SensorState } from './_models/DeviceStates';
import { SENSORS_URL, authenticatedGet } from './_utils';

async function getSensor(sensorID: string, authOpts: AuthOpts): Promise<SensorState | undefined> {
  const res = await authenticatedGet(`${SENSORS_URL}/${sensorID}`, authOpts);
  return res.data as SensorState;
}

export async function getSensors(sensorIDs: string[], authOpts: AuthOpts): Promise<SensorState[]> {
  const results = await Promise.all(sensorIDs.map((id) => getSensor(id, authOpts)));
  return results.filter((s): s is SensorState => s !== undefined);
}
