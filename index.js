const frontpoint = require('frontpoint')

const PLUGIN_ID = 'homebridge-frontpoint'
const PLUGIN_NAME = 'FrontPoint'
const MANUFACTURER = 'FrontPoint Security'
const AUTH_TIMEOUT_MS = 1000 * 60 * 10
const DEFAULT_REFRESH_S = 60

let Accessory, Service, Characteristic, UUIDGen

module.exports = function(homebridge) {
  Accessory = homebridge.platformAccessory
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  UUIDGen = homebridge.hap.uuid

  homebridge.registerPlatform(PLUGIN_ID, PLUGIN_NAME, FrontPointPlatform, true)
}

class FrontPointPlatform {
  constructor(log, config, api) {
    this.log = log
    this.config = config || { platform: PLUGIN_NAME }
    this.debug = this.config.debug || false

    if (!this.config.username)
      throw new Error('FrontPoint: Missing required username in config')
    if (!this.config.password)
      throw new Error('FrontPoint: Missing required password in config')

    this.config.refreshSeconds = this.config.refreshSeconds || DEFAULT_REFRESH_S

    this.accessories = {}
    this.authOpts = { expires: +new Date() - 1 }

    // Default arming mode options
    this.armingModes = {
      "away": {
        noEntryDelay: false,
        silentArming: false
      },
      "night": {
        noEntryDelay: false,
        silentArming: true
      },
      "stay": {
        noEntryDelay: false,
        silentArming: true
      }
    };

    // Overwrite default arming modes with config settings.
    if (this.config.armingModes !== undefined) {
      for(var key in this.config.armingModes) {
        this.armingModes[key].noEntryDelay = Boolean(this.config.armingModes[key].noEntryDelay);
        this.armingModes[key].silentArming = Boolean(this.config.armingModes[key].silentArming);
      }
    }

    if (api) {
      this.api = api
      this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this))
    }
  }

  // HomeBridge method overrides ///////////////////////////////////////////////

  didFinishLaunching() {
    this.listDevices()
      .then(res => {
        this.log(
          `Received ${res.partitions.length} partitions(s) and ${
            res.sensors.length
          } sensor(s) from FrontPoint`
        )

        res.partitions.forEach(p => {
          this.addPartition(p)
          this.log(`Added partition ${p.attributes.description} (${p.id})`)
        })

        res.sensors.forEach(s => {
          this.addSensor(s)
          this.log(`Added sensor ${s.attributes.description} (${s.id})`)
        })
      })
      .catch(err => {
        this.log(`UNHANDLED ERROR: ${err.stack}`)
      })

    // Start a timer to periodically refresh status
    this.timerID = setInterval(
      () => this.refreshDevices(),
      this.config.refreshSeconds * 1000
    )
  }

  configureAccessory(accessory) {
    this.log(
      `Loaded from cache: ${accessory.context.name} (${
        accessory.context.accID
      })`
    )

    const existing = this.accessories[accessory.context.accID]
    if (existing) this.removeAccessory(existing)

    if (accessory.context.partitionType) {
      this.setupPartition(accessory)
    } else if (accessory.context.sensorType) {
      this.setupSensor(accessory)
    } else {
      this.log(`Unrecognized accessory ${accessory.context.accID}`)
    }

    this.accessories[accessory.context.accID] = accessory
  }

  // Internal methods //////////////////////////////////////////////////////////

  login() {
    // Cache expiration check
    const now = +new Date()
    if (this.authOpts.expires > now) return Promise.resolve(this.authOpts)

    this.log(`Logging into FrontPoint as ${this.config.username}`)
    return frontpoint
      .login(this.config.username, this.config.password)
      .then(authOpts => {
        // Cache login response and estimated expiration time
        authOpts.expires = +new Date() + AUTH_TIMEOUT_MS
        this.authOpts = authOpts

        this.log(`Logged into FrontPoint as ${this.config.username}`)
        return authOpts
      })
  }

  listDevices() {
    return this.login()
      .then(res => fetchStateForAllSystems(res))
      .then(systemStates => {
        return systemStates.reduce(
          (out, system) => {
            out.partitions = out.partitions.concat(system.partitions)
            out.sensors = out.sensors.concat(system.sensors)
            return out
          },
          { partitions: [], sensors: [] }
        )
      })
  }

  refreshDevices() {
    this.login()
      .then(res => fetchStateForAllSystems(res))
      .then(systemStates => {
        systemStates.forEach(system => {
          system.partitions.forEach(partition => {
            const accessory = this.accessories[partition.id]
            if (!accessory) return this.addPartition(partition)

            this.setPartitionState(accessory, partition)
          })

          system.sensors.forEach(sensor => {
            const accessory = this.accessories[sensor.id]
            if (!accessory) return this.addSensor(sensor)

            this.setSensorState(accessory, sensor)
          })
        })
      })
      .catch(err => this.log(err))
  }

  addPartition(partition) {
    const id = partition.id
    let accessory = this.accessories[id]
    if (accessory) this.removeAccessory(accessory)

    const name = partition.attributes.description
    const uuid = UUIDGen.generate(id)
    accessory = new Accessory(name, uuid)

    accessory.context = {
      accID: id,
      name: name,
      state: null,
      desiredState: null,
      statusFault: null,
      partitionType: 'default'
    }

    this.log(`Adding partition ${name} (id=${id}, uuid=${uuid})`)
    this.addAccessory(accessory, Service.SecuritySystem, 'Security Panel')

    this.setupPartition(accessory)

    // Set the initial partition state
    this.setPartitionState(accessory, partition)
  }

  setupPartition(accessory) {
    const id = accessory.context.accID
    const name = accessory.context.name
    const model = 'Security Panel'

    // Always reachable
    accessory.reachable = true

    // Setup HomeKit accessory information
    accessory
      .getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, MANUFACTURER)
      .setCharacteristic(Characteristic.Model, model)
      .setCharacteristic(Characteristic.SerialNumber, id)

    // Setup event listeners

    accessory.on('identify', (paired, callback) => {
      this.log(`${name} identify requested, paired=${paired}`)
      callback()
    })

    const service = accessory.getService(Service.SecuritySystem)

    service
      .getCharacteristic(Characteristic.SecuritySystemCurrentState)
      .on('get', callback => callback(null, accessory.context.state))

    service
      .getCharacteristic(Characteristic.SecuritySystemTargetState)
      .on('get', callback => callback(null, accessory.context.desiredState))
      .on('set', (value, callback) =>
        this.changePartitionState(accessory, value, callback)
      )

    service
      .getCharacteristic(Characteristic.StatusFault)
      .on('get', callback => callback(null, accessory.context.statusFault))
  }

  addSensor(sensor) {
    const id = sensor.id
    let accessory = this.accessories[id]
    if (accessory) this.removeAccessory(accessory)

    const [type, characteristic, model] = getSensorType(sensor)
    if (type === undefined) {
      this.log(`Warning: Sensor with unknown state ${sensor.attributes.state}`)
      return
    }

    const name = sensor.attributes.description
    const uuid = UUIDGen.generate(id)
    accessory = new Accessory(name, uuid)

    accessory.context = {
      accID: id,
      name: name,
      state: null,
      batteryLow: false,
      sensorType: model
    }

    this.log(`Adding ${model} "${name}" (id=${id}, uuid=${uuid})`)
    this.addAccessory(accessory, type, model)

    this.setupSensor(accessory)

    // Set the initial sensor state
    this.setSensorState(accessory, sensor)
  }

  setupSensor(accessory) {
    const id = accessory.context.accID
    const name = accessory.context.name
    const model = accessory.context.sensorType
    const [type, characteristic] = sensorModelToType(model)
    if (!characteristic)
      throw new Error(`Unrecognized sensor ${accessory.context.accID}`)

    // Always reachable
    accessory.reachable = true

    // Setup HomeKit accessory information
    accessory
      .getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, MANUFACTURER)
      .setCharacteristic(Characteristic.Model, model)
      .setCharacteristic(Characteristic.SerialNumber, id)

    // Setup event listeners

    accessory.on('identify', (paired, callback) => {
      this.log(`${name} identify requested, paired=${paired}`)
      callback()
    })

    const service = accessory.getService(type)

    service
      .getCharacteristic(characteristic)
      .on('get', callback => callback(null, accessory.context.state))

    service
      .getCharacteristic(Characteristic.StatusLowBattery)
      .on('get', callback => callback(null, accessory.context.batteryLow))
  }

  addAccessory(accessory, type, model) {
    const id = accessory.context.accID
    const name = accessory.context.name
    this.accessories[id] = accessory

    // Setup HomeKit service
    accessory.addService(type, name)

    // Register new accessory in HomeKit
    this.api.registerPlatformAccessories(PLUGIN_ID, PLUGIN_NAME, [accessory])
  }

  setPartitionState(accessory, partition) {
    const id = accessory.context.accID
    const state = getPartitionState(partition.attributes.state)
    const desiredState = getPartitionState(partition.attributes.desiredState)
    const statusFault = Boolean(partition.attributes.needsClearIssuesPrompt)

    if (state !== accessory.context.state) {
      this.log(
        `Updating partition ${id}, state=${state}, prev=${
          accessory.context.state
        }`
      )

      accessory.context.state = state
      accessory
        .getService(Service.SecuritySystem)
        .getCharacteristic(Characteristic.SecuritySystemCurrentState)
        .updateValue(state)
    }

    if (desiredState !== accessory.context.desiredState) {
      this.log(
        `Updating partition ${id}, desiredState=${desiredState}, prev=${
          accessory.context.desiredState
        }`
      )

      accessory.context.desiredState = desiredState
      accessory
        .getService(Service.SecuritySystem)
        .getCharacteristic(Characteristic.SecuritySystemTargetState)
        .updateValue(desiredState)
    }

    if (statusFault !== accessory.context.statusFault) {
      this.log(
        `Updating partition ${id}, statusFault=${statusFault}, prev=${
          accessory.context.statusFault
        }`
      )

      accessory.context.statusFault = statusFault
      accessory
        .getService(Service.SecuritySystem)
        .getCharacteristic(Characteristic.StatusFault)
        .updateValue(statusFault)
    }
  }

  setSensorState(accessory, sensor) {
    const id = accessory.context.accID
    const state = getSensorState(sensor)
    const batteryLow = Boolean(
      sensor.attributes.lowBattery || sensor.attributes.criticalBattery
    )
    const [type, characteristic, model] = getSensorType(sensor)

    if (state !== accessory.context.state) {
      this.log(
        `Updating sensor ${id}, state=${state}, prev=${accessory.context.state}`
      )

      accessory.context.state = state
      accessory
        .getService(type)
        .getCharacteristic(characteristic)
        .updateValue(state)
    }

    if (batteryLow !== accessory.context.batteryLow) {
      this.log(
        `Updating sensor ${id}, batteryLow=${batteryLow}, prev=${
          accessory.context.batteryLow
        }`
      )

      accessory.context.batteryLow = batteryLow
      accessory
        .getService(type)
        .getCharacteristic(Characteristic.StatusLowBattery)
        .updateValue(batteryLow)
    }
  }

  removeAccessory(accessory) {
    if (!accessory) return

    const id = accessory.context.accID
    this.log(`${accessory.context.name} (${id}) removed from HomeBridge.`)
    this.api.unregisterPlatformAccessories(PLUGIN_ID, PLUGIN_NAME, [accessory])
    delete this.accessories[id]
  }

  removeAccessories() {
    this.accessories.forEach(id => this.removeAccessory(this.accessories[id]))
  }

  changePartitionState(accessory, value, callback) {
    const id = accessory.context.accID
    let method
    const opts = {}

    switch (value) {
      case Characteristic.SecuritySystemTargetState.STAY_ARM:
        method = frontpoint.armStay
        opts.noEntryDelay = this.armingModes.stay.noEntryDelay;
        opts.silentArming = this.armingModes.stay.silentArming;
        break
      case Characteristic.SecuritySystemTargetState.NIGHT_ARM:
        method = frontpoint.armStay
        opts.noEntryDelay = this.armingModes.night.noEntryDelay;
        opts.silentArming = this.armingModes.night.silentArming;
        break
      case Characteristic.SecuritySystemTargetState.AWAY_ARM:
        method = frontpoint.armAway
        opts.noEntryDelay = this.armingModes.away.noEntryDelay;
        opts.silentArming = this.armingModes.away.silentArming;
        break
      case Characteristic.SecuritySystemTargetState.DISARM:
        method = frontpoint.disarm
        break
      default:
        const msg = `Can't set SecuritySystem to unknown value ${value}`
        this.log(msg)
        return callback(new Error(msg))
    }

    this.log(`changePartitionState(${accessory.context.accID}, ${value})`)
    accessory.context.desiredState = value

    this.login()
      .then(res => method(id, res, opts)) // Usually 20-30 seconds
      .then(res => res.data)
      .then(partition => this.setPartitionState(accessory, partition))
      .then(_ => callback())
      .catch(err => {
        this.log(`Error: Failed to change partition state: ${err.stack}`)
        this.refreshDevices()
        callback(err)
      })
  }
}

function fetchStateForAllSystems(res) {
  return Promise.all(res.systems.map(id => frontpoint.getCurrentState(id, res)))
}

function getPartitionState(state) {
  switch (state) {
    case frontpoint.SYSTEM_STATES.ARMED_STAY:
      return Characteristic.SecuritySystemCurrentState.STAY_ARM
    case frontpoint.SYSTEM_STATES.ARMED_AWAY:
      return Characteristic.SecuritySystemCurrentState.AWAY_ARM
    case frontpoint.SYSTEM_STATES.ARMED_NIGHT:
      return Characteristic.SecuritySystemCurrentState.NIGHT_ARM
    case frontpoint.SYSTEM_STATES.UNKNOWN:
    case frontpoint.SYSTEM_STATES.DISARMED:
    default:
      return Characteristic.SecuritySystemCurrentState.DISARMED
  }
}

function getSensorState(sensor) {
  switch (sensor.attributes.state) {
    case frontpoint.SENSOR_STATES.OPEN:
      return Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    case frontpoint.SENSOR_STATES.CLOSED:
      return Characteristic.ContactSensorState.CONTACT_DETECTED
    case frontpoint.SENSOR_STATES.ACTIVE:
      return Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
    case frontpoint.SENSOR_STATES.IDLE:
      return Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED
    case frontpoint.SENSOR_STATES.WET:
      return Characteristic.LeakDetected.LEAK_DETECTED
    case frontpoint.SENSOR_STATES.DRY:
      return Characteristic.LeakDetected.LEAK_NOT_DETECTED
    default:
      return undefined
  }
}

function getSensorType(sensor) {
  const state = sensor.attributes.state

  switch (state) {
    case frontpoint.SENSOR_STATES.CLOSED:
    case frontpoint.SENSOR_STATES.OPEN:
      return [
        Service.ContactSensor,
        Characteristic.ContactSensorState,
        'Contact Sensor'
      ]
    case frontpoint.SENSOR_STATES.IDLE:
    case frontpoint.SENSOR_STATES.ACTIVE:
      return [
        Service.OccupancySensor,
        Characteristic.OccupancyDetected,
        'Occupancy Sensor'
      ]
    case frontpoint.SENSOR_STATES.DRY:
    case frontpoint.SENSOR_STATES.WET:
      return [Service.LeakSensor, Characteristic.LeakDetected, 'Leak Sensor']
    default:
      return [undefined, undefined, undefined]
  }
}

function sensorModelToType(model) {
  switch (model) {
    case 'Contact Sensor':
      return [Service.ContactSensor, Characteristic.ContactSensorState]
    case 'Occupancy Sensor':
      return [Service.OccupancySensor, Characteristic.OccupancyDetected]
    case 'Leak Sensor':
      return [Service.LeakSensor, Characteristic.LeakDetected]
    default:
      return [undefined, undefined]
  }
}
