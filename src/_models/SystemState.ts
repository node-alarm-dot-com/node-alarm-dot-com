import { GarageState, LightState, LockState, PartitionState, SensorState, ThermostatState } from './DeviceStates';

/**
 * Response information from
 * api/systems/systems/{id}
 */
export interface SystemState {
  data: {
    id: number,
    type: RelationshipType.System,
    attributes: SystemAttributes,
    relationships: Relationships,
    included: any[],
    meta: {
      transformer_version: string
    }
  }
}

export interface SystemAttributes {
  description: string,
  hasShapShotCameras: boolean,
  supportsSecureArming: boolean,
  remainingImageQuota: number,
  systemGroupName: string,
  unitId: number
}

export interface FlattenedSystemState {
  id: number,
  attributes: SystemAttributes,
  partitions: PartitionState[],
  sensors: SensorState[],
  lights: LightState[],
  locks: LockState[],
  garages: GarageState[],
  thermostats: ThermostatState[],
  relationships: Relationships
}

export interface Relationships {
  partitions: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  locks: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  accessControlAccessPointDevices: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  cameras: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  sdCardCameras: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  garageDoors: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  waterValves: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  scenes: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  sensors: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  waterSensors: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  sumpPumps: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  waterMeters: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  lights: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  x10Lights: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  thermostats: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  remoteTemperatureSensors: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  commercialTemperatureSensors: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  valveSwitches: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  boilerControlSystem: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  geoDevices: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  fences: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  imageSensors: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  configuration: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  shades: {
    data: Relationship[],
    meta: {
      count: string
    }
  },
  lutronShades: {
    data: Relationship[],
    meta: {
      count: string
    }
  }
}

interface Relationship {
  id: string,
  //TODO: Sometimes there can be a constraint on type. We should look into implementing generics for this purpose.
  type: RelationshipType
}

export enum RelationshipType {
  Partition = 'devices/partition',
  Lock = 'devices/lock',
  Camera = 'video/camera',
  GarageDoor = 'devices/garage-door',
  Scene = 'automation/scene',
  Sensor = 'devices/sensor',
  Light = 'devices/light',
  Thermostat = 'devices/thermostat',
  GeoDevice = 'geolocation/geo-device',
  GeoFence = 'geolocation/fence',
  SystemConfig = 'systems/configuration',
  System = 'systems/system',
  State = 'devices/state-info'
}

export enum AutomationType {
  PeakProtect = 'automation/peak-protect',
  RuleSuggestion = 'automation/rules/ruleSuggestion'
}