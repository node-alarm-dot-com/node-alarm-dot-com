export interface SystemState {
  data: {
    id: number,
    type: 'systems/system',
    attributes: {
      description: string,
      hasShapShotCameras: boolean,
      supportsSecureArming: boolean,
      remainingImageQuota: number,
      systemGroupName: string,
      unitId: number
    },
    relationships: Relationships,
    included: any[],
    meta: {
      transformer_version: string
    }
  }
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
  type: 'devices/partition' | 'devices/lock' | 'video/camera' | 'devices/garage-door' | 'automation/scene' |
    'devices/sensor' | 'devices/light' | 'devices/thermostat' | 'geolocation/geo-device' | 'geolocation/fence' |
    'systems/configuration'
}
