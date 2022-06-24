export enum SYSTEM_STATES {
  UNKNOWN = 0,
  DISARMED = 1,
  ARMED_STAY = 2,
  ARMED_AWAY = 3,
  ARMED_NIGHT = 4
}

export enum SENSOR_STATES {
  UNKNOWN = 0,
  CLOSED = 1,
  OPEN = 2,
  IDLE = 3,
  ACTIVE = 4,
  DRY = 5,
  WET = 6
}

export enum LIGHT_STATES {
  ON = 2,
  OFF = 3
}

export enum LOCK_STATES {
  SECURED = 1,
  UNSECURED = 2
}

export enum GARAGE_STATES {
  //UNKNOWN: 0,  //ADC does not have an unknown state. ADC returns temp popup
  OPEN = 1,
  CLOSED = 2
}

export enum SHADE_STATES {
  OPEN = 2,
  CLOSED = 1  //needs testing  
}

export enum REL_TYPES {
  CONFIGURATION = 'systems/configuration',
  PARTITION = 'devices/partition',
  SENSOR = 'devices/sensor',
  LIGHT = 'devices/light',
  LOCK = 'devices/lock',
  GARAGE_DOOR = 'devices/garage-door',
  SHADE = 'devices/shade',
  CAMERA = 'video/camera',
  THERMOSTAT = 'devices/thermostat',
  GEO_DEVICE = 'geolocation/geo-device',
  GEO_FENCE = 'geolocation/fence',
  SCENE = 'automation/scene'
}
