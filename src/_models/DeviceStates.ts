import { Relationship } from './IdentityResponse';
import { RelationshipType } from './SystemState';
import { GARAGE_STATES, LIGHT_STATES, LOCK_STATES, SENSOR_STATES, SYSTEM_STATES } from './States';
import { SensorType } from './SensorType';

export interface ApiLightState extends ApiDeviceState {
  data: {
    id: string,
    type: RelationshipType.Light,
    attributes: {
      state: LIGHT_STATES,
      desiredState: LIGHT_STATES,
      isDimmer: boolean,
      isFavorite: boolean,
      lightLevel: number,
      stateTrackingEnabled: boolean,
      shouldShowFavoritesToggle: boolean,
      canEnableRemoteCommands: boolean,
      canEnableStateTracking: boolean,
      supportsRGBColorControl: boolean,
      supportsWhiteLightColorControl: boolean,
      percentWarmth: number,
      lightColorFormat: null,
      hexColor?: string,
      shouldUpdateMultiLevelState: boolean,
      managedDeviceIcon: string,
      managedDeviceType: number,
      canAccessWebSettings: boolean,
      webSettings: number,
      hasState: boolean,
      managedDeviceState: number,
      canBeRenamed: boolean,
      canBeDeleted: boolean,
      canAccessAppSettings: boolean,
      macAddress: string,
      manufacturer: string,
      isOAuth: boolean,
      isZWave: boolean,
      canBeSaved: boolean,
      canChangeDescription: boolean,
      description: string,
      deviceModelId: 82,
      canConfirmStateChange: boolean,
      remoteCommandsEnabled: boolean,
      hasPermissionToChangeState: boolean,
      deviceIcon: {
        icon: number
      },
      batteryLevelNull: null,
      lowBattery: boolean,
      criticalBattery: boolean
    },
    relationships: {
      lightGroups: {
        data: [],
        meta: {
          count: string
        }
      },
      system: {
        data: {
          id: string,
          type: RelationshipType.System
        }
      },
      stateInfo: {
        data: {
          id: string,
          type: RelationshipType.State
        }
      }
    }
  }
}

export interface LightState extends DeviceState {
  type: RelationshipType.Light,
  attributes: {
    state: LIGHT_STATES,
    desiredState: LIGHT_STATES,
    isDimmer: boolean,
    isFavorite: boolean,
    lightLevel: number,
    stateTrackingEnabled: boolean,
    shouldShowFavoritesToggle: boolean,
    canEnableRemoteCommands: boolean,
    canEnableStateTracking: boolean,
    supportsRGBColorControl: boolean,
    supportsWhiteLightColorControl: boolean,
    percentWarmth: number,
    lightColorFormat: null,
    hexColor?: string,
    shouldUpdateMultiLevelState: boolean,
    managedDeviceIcon: string,
    managedDeviceType: number,
    canAccessWebSettings: boolean,
    webSettings: number,
    hasState: boolean,
    managedDeviceState: number,
    canBeRenamed: boolean,
    canBeDeleted: boolean,
    canAccessAppSettings: boolean,
    macAddress: string,
    manufacturer: string,
    isOAuth: boolean,
    isZWave: boolean,
    canBeSaved: boolean,
    canChangeDescription: boolean,
    description: string,
    deviceModelId: 82,
    canConfirmStateChange: boolean,
    remoteCommandsEnabled: boolean,
    hasPermissionToChangeState: boolean,
    deviceIcon: {
      icon: number
    },
    batteryLevelNull: null,
    lowBattery: boolean,
    criticalBattery: boolean
  },
  relationships: {
    lightGroups: {
      data: [],
      meta: {
        count: string
      }
    },
    system: {
      data: {
        id: string,
        type: RelationshipType.System
      }
    },
    stateInfo: {
      data: {
        id: string,
        type: RelationshipType.State
      }
    }
  }
}

export interface ApiLockState extends ApiDeviceState {
  data: {
    id: string,
    type: RelationshipType.Lock,
    attributes: {
      state: LOCK_STATES,
      desiredState: LOCK_STATES,
      maxUserCodeLength: number,
      supportsScheduledUserCodes: boolean,
      supportsTemporaryUserCodes: boolean,
      supportsLatchControl: boolean,
      managedDeviceType: number,
      managedDeviceIcon: string,
      canBeRenamed: boolean,
      hasState: boolean,
      managedDeviceState: number,
      canBeDeleted: boolean,
      canAccessWebSettings: boolean,
      canAccessAppSettings: boolean,
      webSettings: number,
      macAddress: string,
      manufacturer: string,
      isOAuth: boolean,
      isZWave: boolean,
      canBeSaved: boolean,
      canChangeDescription: boolean,
      description: string,
      deviceModelId: number,
      canConfirmStateChange: boolean,
      remoteCommandsEnabled: boolean,
      hasPermissionToChangeState: boolean,
      deviceIcon: {
        icon: number
      },
      batteryLevelNull: number,
      lowBattery: boolean,
      criticalBattery: boolean
    },
    relationships: {
      system: {
        data: {
          id: string,
          type: RelationshipType.System
        }
      },
      stateInfo: {
        data: {
          id: string,
          type: RelationshipType.State
        }
      }
    },
  }
}

export interface LockState extends DeviceState {
  type: RelationshipType.Lock,
  attributes: {
    state: LOCK_STATES,
    desiredState: LOCK_STATES,
    maxUserCodeLength: number,
    supportsScheduledUserCodes: boolean,
    supportsTemporaryUserCodes: boolean,
    supportsLatchControl: boolean,
    managedDeviceType: number,
    managedDeviceIcon: string,
    canBeRenamed: boolean,
    hasState: boolean,
    managedDeviceState: number,
    canBeDeleted: boolean,
    canAccessWebSettings: boolean,
    canAccessAppSettings: boolean,
    webSettings: number,
    macAddress: string,
    manufacturer: string,
    isOAuth: boolean,
    isZWave: boolean,
    canBeSaved: boolean,
    canChangeDescription: boolean,
    description: string,
    deviceModelId: number,
    canConfirmStateChange: boolean,
    remoteCommandsEnabled: boolean,
    hasPermissionToChangeState: boolean,
    deviceIcon: {
      icon: number
    },
    batteryLevelNull: number,
    lowBattery: boolean,
    criticalBattery: boolean
  },
  relationships: {
    system: {
      data: {
        id: string,
        type: RelationshipType.System
      }
    },
    stateInfo: {
      data: {
        id: string,
        type: RelationshipType.State
      }
    }
  }
}

export interface ApiGarageState extends ApiDeviceState {
  data: {
    id: string
    type: RelationshipType.GarageDoor,
    attributes: {
      state: GARAGE_STATES,
      desiredState: GARAGE_STATES,
      managedDeviceIcon: string,
      managedDeviceType: number,
      hasState: boolean,
      managedDeviceState: number,
      canBeRenamed: boolean,
      canBeDeleted: boolean,
      canAccessWebSettings: boolean,
      canAccessAppSettings: boolean,
      webSettings: number,
      macAddress: string,
      manufacturer: string,
      isOAuth: boolean,
      isZWave: boolean,
      canBeSaved: boolean,
      canChangeDescription: boolean,
      description: string,
      deviceModelId: number,
      canConfirmStateChange: boolean,
      remoteCommandsEnabled: boolean,
      hasPermissionToChangeState: boolean,
      deviceIcon: {
        icon: number
      },
      batteryLevelNull: null,
      lowBattery: boolean,
      criticalBattery: boolean
    },
    relationships: {
      system: {
        data: {
          id: string,
          type: RelationshipType.System
        }
      },
      stateInfo: {
        data: {
          id: string,
          type: RelationshipType.State
        }
      }
    }
  }
}

export interface GarageState extends DeviceState {
  type: RelationshipType.GarageDoor,
  attributes: {
    state: GARAGE_STATES,
    desiredState: GARAGE_STATES,
    managedDeviceIcon: string,
    managedDeviceType: number,
    hasState: boolean,
    managedDeviceState: number,
    canBeRenamed: boolean,
    canBeDeleted: boolean,
    canAccessWebSettings: boolean,
    canAccessAppSettings: boolean,
    webSettings: number,
    macAddress: string,
    manufacturer: string,
    isOAuth: boolean,
    isZWave: boolean,
    canBeSaved: boolean,
    canChangeDescription: boolean,
    description: string,
    deviceModelId: number,
    canConfirmStateChange: boolean,
    remoteCommandsEnabled: boolean,
    hasPermissionToChangeState: boolean,
    deviceIcon: {
      icon: number
    },
    batteryLevelNull: null,
    lowBattery: boolean,
    criticalBattery: boolean
  },
  relationships: {
    system: {
      data: {
        id: string,
        type: RelationshipType.System
      }
    },
    stateInfo: {
      data: {
        id: string,
        type: RelationshipType.State
      }
    }
  }
}

export interface ApiPartitionState extends ApiDeviceState {
  data: {
    id: string,
    type: RelationshipType.Partition,
    attributes: {
      'partitionId': number,
      'state': SYSTEM_STATES,
      'desiredState': SYSTEM_STATES,
      'extendedArmingOptions': {
        'Disarmed': [],
        'ArmedStay': [],
        'ArmedAway': [],
        'ArmedNight': []
      },
      'invalidExtendedArmingOptions': {
        'Disarmed': number[][],
        'ArmedStay': number[][],
        ArmedAway: number[][],
        ArmedNight: number[][]
      },
      needsClearIssuesPrompt: boolean,
      canEnableAlexa: boolean,
      isAlexaEnabled: boolean,
      managedDeviceType: number,
      managedDeviceIcon: string,
      canBeRenamed: boolean,
      canAccessWebSettings: boolean,
      canAccessAppSettings: boolean,
      webSettings: number,
      hasState: boolean,
      managedDeviceState: number,
      canBeDeleted: boolean,
      macAddress: string,
      manufacturer: string,
      isOAuth: boolean,
      isZWave: boolean,
      canBeSaved: boolean,
      canChangeDescription: boolean,
      description: string,
      deviceModelId: number,
      canConfirmStateChange: boolean,
      remoteCommandsEnabled: boolean,
      hasPermissionToChangeState: boolean,
      deviceIcon: {
        icon: number
      },
      batteryLevelNull?: null,
      lowBattery: boolean,
      criticalBattery: boolean
    },
    relationships: {
      sensors: {
        data: Relationship[],
        meta: {
          count: number
        }
      }
    }
  }
}

export interface PartitionState extends DeviceState {
  id: string,
  type: RelationshipType.Partition,
  attributes: {
    'partitionId': number,
    'state': SYSTEM_STATES,
    'desiredState': SYSTEM_STATES,
    'extendedArmingOptions': {
      'Disarmed': [],
      'ArmedStay': [],
      'ArmedAway': [],
      'ArmedNight': []
    },
    'invalidExtendedArmingOptions': {
      'Disarmed': number[][],
      'ArmedStay': number[][],
      ArmedAway: number[][],
      ArmedNight: number[][]
    },
    needsClearIssuesPrompt: boolean,
    canEnableAlexa: boolean,
    isAlexaEnabled: boolean,
    managedDeviceType: number,
    managedDeviceIcon: string,
    canBeRenamed: boolean,
    canAccessWebSettings: boolean,
    canAccessAppSettings: boolean,
    webSettings: number,
    hasState: boolean,
    managedDeviceState: number,
    canBeDeleted: boolean,
    macAddress: string,
    manufacturer: string,
    isOAuth: boolean,
    isZWave: boolean,
    canBeSaved: boolean,
    canChangeDescription: boolean,
    description: string,
    deviceModelId: number,
    canConfirmStateChange: boolean,
    remoteCommandsEnabled: boolean,
    hasPermissionToChangeState: boolean,
    deviceIcon: {
      icon: number
    },
    batteryLevelNull?: null,
    lowBattery: boolean,
    criticalBattery: boolean
  },
  relationships: {
    sensors: {
      data: Relationship[],
      meta: {
        count: number
      }
    }
  }
}

export interface ApiSensorState extends ApiDeviceState {
  data: Array<{
    id: string,
    type: RelationshipType.Sensor,
    attributes: {
      deviceType: number,
      openClosedStatus: number,
      state: SENSOR_STATES,
      stateText: string,
      isMonitoringEnabled: boolean,
      managedDeviceIcon: string,
      managedDeviceState: number,
      managedDeviceType: number,
      hasState: boolean,
      canBeRenamed: boolean,
      canBeDeleted: boolean,
      canAccessWebSettings: boolean,
      canAccessAppSettings: boolean,
      webSettings: number,
      macAddress: string,
      manufacturer: string,
      isOAuth: boolean,
      isZWave: boolean,
      canBeSaved: boolean,
      canChangeDescription: boolean,
      description: string,
      deviceModelId: number,
      canConfirmStateChange: boolean,
      remoteCommandsEnabled: boolean,
      hasPermissionToChangeState: boolean,
      deviceIcon: {
        icon: number
      },
      batteryLevelNull?: null,
      lowBattery: boolean,
      criticalBattery: boolean
    },
    relationships: {
      system: {
        data: {
          id: string,
          type: RelationshipType.System
        }
      },
      stateInfo: {
        data: {
          id: string,
          type: RelationshipType.State
        }
      }
    }
  }>
}

export interface SensorState extends DeviceState {
  id: string,
  type: RelationshipType.Sensor,
  attributes: {
    deviceType: SensorType,
    openClosedStatus: number,
    state: SENSOR_STATES,
    stateText: string,
    isMonitoringEnabled: boolean,
    managedDeviceIcon: string,
    managedDeviceState: number,
    managedDeviceType: number,
    hasState: boolean,
    canBeRenamed: boolean,
    canBeDeleted: boolean,
    canAccessWebSettings: boolean,
    canAccessAppSettings: boolean,
    webSettings: number,
    macAddress: string,
    manufacturer: string,
    isOAuth: boolean,
    isZWave: boolean,
    canBeSaved: boolean,
    canChangeDescription: boolean,
    description: string,
    deviceModelId: number,
    canConfirmStateChange: boolean,
    remoteCommandsEnabled: boolean,
    hasPermissionToChangeState: boolean,
    deviceIcon: {
      icon: number
    },
    batteryLevelNull?: null,
    lowBattery: boolean,
    criticalBattery: boolean
  },
  relationships: {
    system: {
      data: {
        id: string,
        type: RelationshipType.System
      }
    },
    stateInfo: {
      data: {
        id: string,
        type: RelationshipType.State
      }
    }
  }
}

export interface ApiCameraState extends ApiDeviceState {
  data: {
    id: string,
    type: RelationshipType.Camera,
    attributes: {
      supportsSnapShot: boolean,
      isRecordingToContinuousCloud: boolean,
      canTakeSnapshot: boolean,
      canRequestRecording: boolean,
      hasSvrSchedule: boolean,
      excludedFromVisualVerification: boolean,
      liveViewHdToggleEnabled: boolean,
      canPanTilt: boolean,
      canZoom: boolean,
      panTiltPresets: [],
      preferredPanTiltPreset?: [],
      isUnreachable: boolean,
      lastSuccessfulSupervision: Date,
      canStreamToPanel: boolean,
      canChangeStreamToPanel: boolean,
      canStreamToPanelBeEnabled: boolean,
      isStreamToPanelEnabled: boolean,
      doorbellChimeType: number,
      supportsVmdSchedules: boolean,
      deviceImagePath: string,
      deviceModel: string,
      macAddress: string,
      firmwareVersion: string,
      publicIp: string,
      privateIp: string,
      port: number,
      httpsPort: number,
      shouldUseEntireImageForSnapshot: boolean,
      hasDdnsed: boolean,
      usageProtocolMapping: {},
      isVirtualCamera: boolean,
      supportsLiveView: boolean,
      forcedAspectRatio: null,
      canBeSaved: boolean,
      canChangeDescription: boolean,
      description: string,
      deviceModelId: number,
      canConfirmStateChange: boolean,
      remoteCommandsEnabled: boolean,
      hasPermissionToChangeState: boolean,
      deviceIcon: {
        icon: number
      },
      batteryLevelNull?: null,
      lowBattery: boolean,
      criticalBattery: boolean
    },
    relationships: {
      videoEvents: {
        data: [],
        meta: {
          count: number
        }
      },
      videoSource: {
        data: {
          id: string,
          type: 'video/liveVideoSource'
        }
      },
      videoSourceHd: {
        data: {
          id: string,
          type: 'video/liveVideoHighestResSource'
        }
      },
      svrVideoSource: {
        data: {
          id: string,
          type: 'video/videoSources/svrVideoSource'
        }
      },
      snapshot: {
        data: {
          id: string,
          type: 'video/snapshot'
        }
      },
      system: {
        data: {
          id: string,
          type: 'systems/system'
        }
      },
      stateInfo: {
        data: null
      }
    }
  },
  included: [],
  meta: {
    transformer_version: '1.1'
  }
}

export interface CameraState extends DeviceState {
  type: RelationshipType.Camera,
  attributes: {
    supportsSnapShot: boolean,
    isRecordingToContinuousCloud: boolean,
    canTakeSnapshot: boolean,
    canRequestRecording: boolean,
    hasSvrSchedule: boolean,
    excludedFromVisualVerification: boolean,
    liveViewHdToggleEnabled: boolean,
    canPanTilt: boolean,
    canZoom: boolean,
    panTiltPresets: [],
    preferredPanTiltPreset?: [],
    isUnreachable: boolean,
    lastSuccessfulSupervision: Date,
    canStreamToPanel: boolean,
    canChangeStreamToPanel: boolean,
    canStreamToPanelBeEnabled: boolean,
    isStreamToPanelEnabled: boolean,
    doorbellChimeType: number,
    supportsVmdSchedules: boolean,
    deviceImagePath: string,
    deviceModel: string,
    macAddress: string,
    firmwareVersion: string,
    publicIp: string,
    privateIp: string,
    port: number,
    httpsPort: number,
    shouldUseEntireImageForSnapshot: boolean,
    hasDdnsed: boolean,
    usageProtocolMapping: {},
    isVirtualCamera: boolean,
    supportsLiveView: boolean,
    forcedAspectRatio: null,
    canBeSaved: boolean,
    canChangeDescription: boolean,
    description: string,
    deviceModelId: number,
    canConfirmStateChange: boolean,
    remoteCommandsEnabled: boolean,
    hasPermissionToChangeState: boolean,
    deviceIcon: {
      icon: number
    },
    batteryLevelNull?: null,
    lowBattery: boolean,
    criticalBattery: boolean
  },
  relationships: {
    videoEvents: {
      data: [],
      meta: {
        count: number
      }
    },
    videoSource: {
      data: {
        id: string,
        type: 'video/liveVideoSource'
      }
    },
    videoSourceHd: {
      data: {
        id: string,
        type: 'video/liveVideoHighestResSource'
      }
    },
    svrVideoSource: {
      data: {
        id: string,
        type: 'video/videoSources/svrVideoSource'
      }
    },
    snapshot: {
      data: {
        id: string,
        type: 'video/snapshot'
      }
    },
    system: {
      data: {
        id: string,
        type: 'systems/system'
      }
    },
    stateInfo: {
      data: null
    }
  }
}

/**
 * Base interface for retrieving device state from Alarm.com's API
 * All devices retrieved contain these properties.
 */
export interface ApiDeviceState {
  data: {
    id: string,
    type: RelationshipType,
    attributes: any,
    relationships: any,
  } | Array<{
    id: string,
    type: RelationshipType,
    attributes: any,
    relationships: any,
  }>,
  included: [],
  meta: {
    transformer_version: '1.1' | string
  }
}

export interface DeviceState {
  id: string,
  type: RelationshipType,
  attributes: any,
  relationships: any
}
