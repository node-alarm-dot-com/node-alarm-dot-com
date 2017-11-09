const frontpoint = require('frontpoint')

const PLUGIN_ID = 'homebridge-frontpoint'
const PLUGIN_NAME = 'FrontPoint'
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
    this.config = config || { platform: 'FrontPoint' }
    this.debug = this.config.debug || false

    if (!this.config.username)
      throw new Error('FrontPoint: Missing required username in config')
    if (!this.config.password)
      throw new Error('FrontPoint: Missing required password in config')

    this.config.refreshSeconds = this.config.refreshSeconds || DEFAULT_REFRESH_S

    this.accessories = {}
    this.authOpts = { expires: +new Date() - 1 }

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
          `Received ${res.partitions.length} partitions(s) and ${res.sensors
            .length} sensor(s) from FrontPoint`
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
        this.log(`UNHANDLED ERROR: ${err}`)
      })

    // Start a timer to periodically refresh status
    this.timerID = setInterval(
      () => this.refreshDevices(),
      this.config.refreshSeconds * 1000
    )
  }

  configureAccessory(accessory) {
    this.log(
      `Loaded from cache: ${accessory.context.name} (${accessory.context
        .accID})`
    )

    const existing = this.accessories[accessory.context.accID]
    if (existing) this.removeAccessory(existing)

    this.accessories[accessory.context.accID] = accessory
  }

  // Internal methods //////////////////////////////////////////////////////////

  login() {
    // Cache expiration check
    const now = +new Date()
    if (this.authOpts.expires > now) return Promise.resolve(this.authOpts)

    return frontpoint
      .login(this.config.username, this.config.password)
      .then(authOpts => {
        // Cache login response and estimated expiration time
        authOpts.expires = +new Date() + AUTH_TIMEOUT_MS
        this.authOpts = authOpts

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
            if (accessory) return this.addPartition(partition)

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
      statusFault: null
    }

    this.log(`Adding partition ${name} (id=${id}, uuid=${uuid})`)
    this.addAccessory(accessory, Service.SecuritySystem, 'Security Panel')

    accessory
      .getService(Service.SecuritySystem)
      .getCharacteristic(Characteristic.SecuritySystemCurrentState)
      .on('get', callback => callback(null, accessory.context.state))
      .getCharacteristic(Characteristic.SecuritySystemTargetState)
      .on('get', callback => callback(null, accessory.context.desiredState))
      .on('set', (value, callback) =>
        this.changePartitionState(accessory, value, callback)
      )
      .getCharacteristic(Characteristic.StatusFault)
      .on('get', callback => callback(null, accessory.context.statusFault))

    // Set the initial partition state
    this.setPartitionState(accessory, partition)
  }

  addSensor(sensor) {
    const id = sensor.id
    let accessory = this.accessories[id]
    if (accessory) this.removeAccessory(accessory)

    const name = sensor.attributes.description
    const uuid = UUIDGen.generate(id)
    accessory = new Accessory(name, uuid)

    accessory.context = {
      accID: id,
      name: name,
      state: null,
      batteryLow: false
    }

    const [type, characteristic, model] = getSensorType(sensor)
    if (type === undefined) {
      this.log(`Warning: Sensor with unknown state ${sensor.attributes.state}`)
      return
    }

    this.log(`Adding ${model} "${name}" (id=${id}, uuid=${uuid})`)
    this.addAccessory(accessory, type, model)

    accessory
      .getService(type)
      .getCharacteristic(characteristic)
      .on('get', callback => callback(null, accessory.context.state))
      .getCharacteristic(Characteristic.StatusActive)
      .on('get', callback => callback(null, true))
      .getCharacteristic(Characteristic.StatusLowBattery)
      .on('get', callback => callback(null, accessory.context.batteryLow))

    // Set the initial sensor state
    this.setSensorState(accessory, sensor)
  }

  addAccessory(accessory, type, model) {
    const id = accessory.context.accID
    const name = accessory.context.name
    this.accessories[id] = accessory

    // Setup HomeKit service
    accessory.addService(type, name)

    // New accessory is always reachable
    accessory.reachable = true
    accessory.updateReachability(true)

    // Setup HomeKit accessory information
    accessory
      .getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, 'FrontPoint')
      .setCharacteristic(Characteristic.Model, model)
      .setCharacteristic(Characteristic.SerialNumber, id)

    // Setup event listeners

    accessory.on('identify', (paired, callback) => {
      this.log(`${name} identify requested, paired=${paired}`)
      callback()
    })

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
        `Updating partition ${id}, state=${state}, prev=${accessory.context
          .state}`
      )

      accessory.context.state = state
      accessory
        .getService(Service.SecuritySystem)
        .getCharacteristic(Characteristic.SecuritySystemCurrentState)
        .getValue()
    }

    if (desiredState !== accessory.context.desiredState) {
      this.log(
        `Updating partition ${id}, desiredState=${desiredState}, prev=${accessory
          .context.desiredState}`
      )

      accessory.context.desiredState = desiredState
      accessory
        .getService(Service.SecuritySystem)
        .getCharacteristic(Characteristic.SecuritySystemDesiredState)
        .getValue()
    }

    if (statusFault !== accessory.context.statusFault) {
      this.log(
        `Updating partition ${id}, statusFault=${statusFault}, prev=${accessory
          .context.statusFault}`
      )

      accessory.context.statusFault = statusFault
      accessory
        .getService(Service.SecuritySystem)
        .getCharacteristic(Characteristic.StatusFault)
        .getValue()
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
        .getValue()
    }

    if (batteryLow !== accessory.context.batteryLow) {
      this.log(
        `Updating sensor ${id}, batteryLow=${batteryLow}, prev=${accessory
          .context.batteryLow}`
      )

      accessory.context.batteryLow = batteryLow
      accessory
        .getService(type)
        .getCharacteristic(Characteristic.StatusLowBattery)
        .getValue()
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

    switch (value) {
      case Characteristic.SecuritySystemTargetState.STAY_ARM:
      case Characteristic.SecuritySystemTargetState.NIGHT_ARM:
        method = frontpoint.armStay
      case Characteristic.SecuritySystemTargetState.AWAY_ARM:
        method = frontpoint.armAway
      case Characteristic.SecuritySystemTargetState.DISARM:
        method = frontpoint.disarm
      default:
        const msg = `Can't set SecuritySystem to unknown value ${value}`
        return callback(new Error(msg))
    }

    this.log(`changePartitionState(${accessory.context.accID}, ${value})`)
    accessory.context.desiredState = value

    this.login()
      .then(res => method(id, res))
      .then(partition => this.setPartitionState(accessory, partition))
      .catch(err => {
        this.log(`Error: Failed to change partition state: ${err}`)
        this.refreshDevices()
      })

    // Return immediately after desiredState is set, don't wait 20-30s for the
    // arm or disarm to complete
    callback()
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
    case frontpoint.SENSOR_STATES.ACTIVATED:
      return true
    case frontpoint.SENSOR_STATES.DEACTIVATED:
      return false
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
