/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Number indicating the type of sensor according to the Alarm.com API
 */
export enum SensorType {
  Contact_Sensor = 1,
  Motion_Sensor = 2,
  Smoke_Detector = 5,
  CO_Detector = 6,
  Heat_Detector = 8,
  Fob = 9,
  Keypad = 10,
  Water_Sensor = 17,
  Glass_Break = 19,
  Panel_Camera = 68,
  Panel_Glass_Break = 83
}
