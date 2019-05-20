const nodeADC = require('node-alarm-dot-com')

const PLUGIN_ID = 'homebridge-node-alarm-dot-com'
const PLUGIN_NAME = 'Alarmdotcom'
const MANUFACTURER = 'Alarm.com'
const AUTH_TIMEOUT_MINS = 10 // default for session authentication refresh
const POLL_TIMEOUT_SECS = 60 // default for device state polling
const LOG_LEVEL = 3  // default for log entries: 0 = NONE, 1 = ERROR, 2 = WARN, 3 = NOTICE, 4 = VERBOSE

let Accessory, Service, Characteristic, UUIDGen

module.exports = function(homebridge) {
  Accessory = homebridge.platformAccessory
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  UUIDGen = homebridge.hap.uuid

  homebridge.registerPlatform(PLUGIN_ID, PLUGIN_NAME, ADCPlatform, true)
}

class ADCPlatform {
  constructor(log, config, api) {
    this.log = log
    this.config = config || { platform: PLUGIN_NAME }
    this.debug = this.config.debug || false
    this.config.logLevel = this.config.logLevel || LOG_LEVEL
    this.ignoredDevices = this.config.ignoredDevices || []

    if (!this.config.username)
      throw new Error('Alarm.com: Missing required username in config')
    if (!this.config.password)
      throw new Error('Alarm.com: Missing required password in config')

    this.config.authTimeoutMinutes = this.config.authTimeoutMinutes || AUTH_TIMEOUT_MINS
    this.config.pollTimeoutSeconds = this.config.pollTimeoutSeconds || POLL_TIMEOUT_SECS

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

  // HomeBridge Method Overrides ///////////////////////////////////////////////

  didFinishLaunching() {
    this.listDevices()
      .then(res => {
        if (this.config.logLevel > 2)
          this.log(
            `Received ${res.partitions.length} partitions(s) and ${
              res.sensors.length
            } sensor(s) from Alarm.com`
          )

        res.partitions.forEach(p => {
          this.addPartition(p)
          if (this.config.logLevel > 2)
            this.log(`Added partition ${p.attributes.description} (${p.id})`)
        })

        res.sensors.forEach(s => {
          // if the sensor id is not in the ignore list in the homebridge config
          if (!this.ignoredDevices.includes(s.id)) {
            this.addSensor(s)
            if (this.config.logLevel > 2)
              this.log(`Added sensor ${s.attributes.description} (${s.id})`)
          }
          else {
            if (this.config.logLevel > 2)
              this.log(`Ignored sensor ${s.attributes.description} (${s.id})`)
          }
        })
      })
      .catch(err => {
        if (this.config.logLevel > 0)
          this.log(`UNHANDLED ERROR: ${err.stack}`)
      })

    // Start a timer to periodically refresh status
    this.timerID = setInterval(
      () => this.refreshDevices(),
      this.config.pollTimeoutSeconds * 1000
    )
  }

  configureAccessory(accessory) {
    if (this.config.logLevel > 2)
      this.log(`Loaded from cache: ${accessory.context.name} (${accessory.context.accID})`)

    const existing = this.accessories[accessory.context.accID]
    if (existing)
      this.removeAccessory(existing)

    if (accessory.context.partitionType) {
      this.setupPartition(accessory)
    } else if (accessory.context.sensorType) {
      this.setupSensor(accessory)
    } else {
      if (this.config.logLevel > 1)
        this.log(`Unrecognized accessory ${accessory.context.accID}`)
    }

    this.accessories[accessory.context.accID] = accessory
  }

  // Internal Methods //////////////////////////////////////////////////////////

  login() {
    // Cache expiration check
    const now = +new Date()
    if (this.authOpts.expires > now)
      return Promise.resolve(this.authOpts)

    if (this.config.logLevel > 2)
      this.log(`Logging into Alarm.com as ${this.config.username}`)

    return nodeADC
      .login(this.config.username, this.config.password)
      .then(authOpts => {
        // Cache login response and estimated expiration time
        authOpts.expires = +new Date() + 1000 * 60 * this.config.authTimeoutMinutes
        this.authOpts = authOpts

        if (this.config.logLevel > 2)
          this.log(`Logged into Alarm.com as ${this.config.username}`)

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
            if (!accessory)
              return this.addPartition(partition)

            this.setPartitionState(accessory, partition)
          })

          system.sensors.forEach(sensor => {
            const accessory = this.accessories[sensor.id]
            if (!accessory)
              return this.addSensor(sensor)

            this.setSensorState(accessory, sensor)
          })
        })
      })
      .catch(err => this.log(err))
  }

  // Partition Mothods /////////////////////////////////////////////////////////

  addPartition(partition) {
    const id = partition.id
    let accessory = this.accessories[id]
    if (accessory)
      this.removeAccessory(accessory)

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

    if (this.config.logLevel > 2)
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
      if (this.config.logLevel > 3)
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

  setPartitionState(accessory, partition) {
    const id = accessory.context.accID
    const name = accessory.context.name
    const state = getPartitionState(partition.attributes.state)
    const desiredState = getPartitionState(partition.attributes.desiredState)
    const statusFault = Boolean(partition.attributes.needsClearIssuesPrompt)

    if (state !== accessory.context.state) {
      if (this.config.logLevel > 2)
        this.log(
          `Updating partition ${name} (${id}), state=${state}, prev=${
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
      if (this.config.logLevel > 2)
        this.log(
          `Updating partition ${name} (${id}), desiredState=${desiredState}, prev=${
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
      if (this.config.logLevel > 2)
        this.log(
          `Updating partition ${name} (${id}), statusFault=${statusFault}, prev=${
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

  changePartitionState(accessory, value, callback) {
    const id = accessory.context.accID
    let method
    const opts = {}

    switch (value) {
      case Characteristic.SecuritySystemTargetState.STAY_ARM:
        method = nodeADC.armStay
        opts.noEntryDelay = this.armingModes.stay.noEntryDelay;
        opts.silentArming = this.armingModes.stay.silentArming;
        break
      case Characteristic.SecuritySystemTargetState.NIGHT_ARM:
        method = nodeADC.armStay
        opts.noEntryDelay = this.armingModes.night.noEntryDelay;
        opts.silentArming = this.armingModes.night.silentArming;
        break
      case Characteristic.SecuritySystemTargetState.AWAY_ARM:
        method = nodeADC.armAway
        opts.noEntryDelay = this.armingModes.away.noEntryDelay;
        opts.silentArming = this.armingModes.away.silentArming;
        break
      case Characteristic.SecuritySystemTargetState.DISARM:
        method = nodeADC.disarm
        break
      default:
        const msg = `Can't set SecuritySystem to unknown value ${value}`
        if (this.config.logLevel > 1)
          this.log(msg)
        return callback(new Error(msg))
    }

    if (this.config.logLevel > 2)
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

  // Sensor Methods ////////////////////////////////////////////////////////////

  addSensor(sensor) {
    const id = sensor.id
    let accessory = this.accessories[id]
    // in an ideal world, homebridge shouldn't be restarted too often
    // so upon starting we clean out the cache of alarm accessories
    if (accessory)
      this.removeAccessory(accessory)

    const [type, characteristic, model] = getSensorType(sensor)
    if (type === undefined) {
      if (this.config.logLevel > 1)
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

    // if the sensor id is not in the ignore list in the homebridge config
    if (!this.ignoredDevices.includes(id)) {
      if (this.config.logLevel > 2)
        this.log(`Adding ${model} "${name}" (id=${id}, uuid=${uuid})`)

      this.addAccessory(accessory, type, model)
      this.setupSensor(accessory)

      // Set the initial sensor state
      this.setSensorState(accessory, sensor)
    }
  }

  setupSensor(accessory) {
    const id = accessory.context.accID
    const name = accessory.context.name
    const model = accessory.context.sensorType
    const [type, characteristic] = sensorModelToType(model)
    if (!characteristic && this.config.logLevel > 1)
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
      if (this.config.logLevel > 2)
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

  setSensorState(accessory, sensor) {
    const id = accessory.context.accID
    const name = accessory.context.name
    const state = getSensorState(sensor)
    const batteryLow = Boolean(
      sensor.attributes.lowBattery || sensor.attributes.criticalBattery
    )
    const [type, characteristic, model] = getSensorType(sensor)

    if (state !== accessory.context.state) {
      if (this.config.logLevel > 2)
        this.log(`Updating sensor ${name} (${id}), state=${state}, prev=${accessory.context.state}`)

      accessory.context.state = state
      accessory
        .getService(type)
        .getCharacteristic(characteristic)
        .updateValue(state)
    }

    if (batteryLow !== accessory.context.batteryLow) {
      if (this.config.logLevel > 2)
        this.log(`Updating sensor ${name} (${id}), batteryLow=${batteryLow}, prev=${accessory.context.batteryLow}`)

      accessory.context.batteryLow = batteryLow
      accessory
        .getService(type)
        .getCharacteristic(Characteristic.StatusLowBattery)
        .updateValue(batteryLow)
    }
  }

  // Accessory Methods /////////////////////////////////////////////////////////

  addAccessory(accessory, type, model) {
    const id = accessory.context.accID
    const name = accessory.context.name
    this.accessories[id] = accessory

    // Setup HomeKit service
    accessory.addService(type, name)

    // Register new accessory in HomeKit
    this.api.registerPlatformAccessories(PLUGIN_ID, PLUGIN_NAME, [accessory])
  }

  removeAccessory(accessory) {
    if (!accessory) return

    const id = accessory.context.accID
    if (this.config.logLevel > 2)
      this.log(`Removing ${accessory.context.name} (${id}) from HomeBridge.`)
    this.api.unregisterPlatformAccessories(PLUGIN_ID, PLUGIN_NAME, [accessory])
    delete this.accessories[id]
  }

  removeAccessories() {
    this.accessories.forEach(id => this.removeAccessory(this.accessories[id]))
  }

}

function fetchStateForAllSystems(res) {
  return Promise.all(res.systems.map(id => nodeADC.getCurrentState(id, res)))
}

function getPartitionState(state) {
  switch (state) {
    case nodeADC.SYSTEM_STATES.ARMED_STAY:
      return Characteristic.SecuritySystemCurrentState.STAY_ARM
    case nodeADC.SYSTEM_STATES.ARMED_AWAY:
      return Characteristic.SecuritySystemCurrentState.AWAY_ARM
    case nodeADC.SYSTEM_STATES.ARMED_NIGHT:
      return Characteristic.SecuritySystemCurrentState.NIGHT_ARM
    case nodeADC.SYSTEM_STATES.UNKNOWN:
    case nodeADC.SYSTEM_STATES.DISARMED:
    default:
      return Characteristic.SecuritySystemCurrentState.DISARMED
  }
}

function getSensorState(sensor) {
  // if (sensor.attributes.description == 'Master Motion')
    // console.log(sensor)
  switch (sensor.attributes.state) {
    case nodeADC.SENSOR_STATES.OPEN:
      return Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    case nodeADC.SENSOR_STATES.CLOSED:
      return Characteristic.ContactSensorState.CONTACT_DETECTED
    case nodeADC.SENSOR_STATES.ACTIVE:
      return Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
    case nodeADC.SENSOR_STATES.IDLE:
      return Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED
    case nodeADC.SENSOR_STATES.WET:
      return Characteristic.LeakDetected.LEAK_DETECTED
    case nodeADC.SENSOR_STATES.DRY:
      return Characteristic.LeakDetected.LEAK_NOT_DETECTED
    default:
      return undefined
  }
}

function getSensorType(sensor) {
  const state = sensor.attributes.state

  switch (state) {
    case nodeADC.SENSOR_STATES.CLOSED:
    case nodeADC.SENSOR_STATES.OPEN:
      return [
        Service.ContactSensor,
        Characteristic.ContactSensorState,
        'Contact Sensor'
      ]
    case nodeADC.SENSOR_STATES.IDLE:
    case nodeADC.SENSOR_STATES.ACTIVE:
      return [
        Service.OccupancySensor,
        Characteristic.OccupancyDetected,
        'Occupancy Sensor'
      ]
    case nodeADC.SENSOR_STATES.DRY:
    case nodeADC.SENSOR_STATES.WET:
      return [
        Service.LeakSensor,
        Characteristic.LeakDetected,
        'Leak Sensor'
      ]
    default:
      return [undefined, undefined, undefined]
  }
}

function sensorModelToType(model) {
  switch (model) {
    case 'Contact Sensor':
      return [
        Service.ContactSensor,
        Characteristic.ContactSensorState
      ]
    case 'Occupancy Sensor':
      return [
        Service.OccupancySensor,
        Characteristic.OccupancyDetected
      ]
    case 'Leak Sensor':
      return [
        Service.LeakSensor,
        Characteristic.LeakDetected
      ]
    default:
      return [undefined, undefined]
  }
}
