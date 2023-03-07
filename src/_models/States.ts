/* eslint-disable @typescript-eslint/naming-convention */
/***
 * State of the partition as defined by Alarm.com
 * @readonly
 * @enum {number}
 */
export enum SYSTEM_STATES {
  UNKNOWN = 0,
  DISARMED = 1,
  ARMED_STAY = 2,
  ARMED_AWAY = 3,
  ARMED_NIGHT = 4
}

/***
 * State of the sensor as defined by Alarm.com
 * @readonly
 * @enum {number}
 */
export enum SENSOR_STATES {
  UNKNOWN = 0,
  CLOSED = 1,
  OPEN = 2,
  IDLE = 3,
  ACTIVE = 4,
  DRY = 5,
  WET = 6
}

/***
 * State of the light as defined by Alarm.com
 * @readonly
 * @enum {number}
 */
export enum LIGHT_STATES {
  ON = 2,
  OFF = 3
}

/***
 * State of the lock as defined by Alarm.com
 * @readonly
 * @enum {number}
 */
export enum LOCK_STATES {
  SECURED = 1,
  UNSECURED = 2
}

/***
 * State of the garage as defined by Alarm.com
 * @readonly
 * @enum {number}
 */
export enum GARAGE_STATES {
  //UNKNOWN: 0,  //ADC does not have an unknown state. ADC returns temp popup
  OPEN = 1, //double check
  CLOSED = 2 //double check
}

/***
 * State of the thermostat as defined by Alarm.com
 * @readonly
 * @enum {number}
 */
export enum THERMOSTAT_STATES {
  OFF = 1,
  HEATING = 2,
  COOLING = 3,
  AUTO
}

/***
 * Relation types as defined by Alarm.com.
 * Relationship types tell you what object is being sent from the API.
 * @readonly
 */
export enum REL_TYPES {
  CONFIGURATION = 'systems/configuration',
  PARTITION = 'devices/partition',
  SENSOR = 'devices/sensor',
  LIGHT = 'devices/light',
  LOCK = 'devices/lock',
  GARAGE_DOOR = 'devices/garage-door',
  CAMERA = 'video/camera',
  THERMOSTAT = 'devices/thermostat',
  GEO_DEVICE = 'geolocation/geo-device',
  GEO_FENCE = 'geolocation/fence',
  SCENE = 'automation/scene'
}
