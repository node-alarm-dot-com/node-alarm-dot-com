const nodeADC = require('..')

main()

function main() {
  const yargs = require('yargs')
    .usage('Usage: $0 [options]')
    .option('u', {
      alias: 'username',
      default: process.env.USERNAME,
      defaultDescription: 'USERNAME environment variable',
      describe: 'Username',
      type: 'string'
    })
    .option('p', {
      alias: 'password',
      default: process.env.PASSWORD,
      defaultDescription: 'PASSWORD environment variable',
      describe: 'Password',
      type: 'string'
    })
    .help('h')
    .alias('h', 'help')
    .version(false)

  const username = yargs.argv.username
  const password = yargs.argv.password
  if (!username || !password) {
    console.error(`Error: username and password are required`)
    yargs.showHelp()
    return process.exit(1)
  }

  nodeADC
    .login(username, password)
    .then(res => nodeADC.getCurrentState(res.systems[0], res))
    .then(res => {
      res.partitions.forEach((p, i) => {
        const name = `${res.attributes.description}${i ? ' ' + i : ''}`
        const msgs = [getStateString(p)]
        if (p.criticalBattery) msgs.push('Battery Critical')
        else if (p.lowBattery) msgs.push('Battery Low')
        if (p.needsClearIssuesPrompt) msgs.push('System Fault')

        console.log(
          '\x1b[36m%s\x1b[0m%s',
          '[Security System]',
          ` ${name}, ${msgs.join(', ')}`
        )
      })

      res.sensors.forEach(s => {
        const name = s.attributes.description
        const msgs = [s.attributes.stateText]
        if (s.criticalBattery) msgs.push('Battery Critical')
        else if (s.lowBattery) msgs.push('Battery Low')

        console.log(
          '\x1b[36m%s\x1b[0m%s',
          '[Sensor]',
          ` ${name}, ${msgs.join(', ')}`
        )
      })
    })
    .catch(err => {
      console.error(err)
    })
}

function getStateString(partition) {
  const current = partition.attributes.state
  const target = partition.attributes.desiredState

  if (current === target) {
    switch (current) {
      case nodeADC.SYSTEM_STATES.DISARMED:
        return 'Disarmed'
      case nodeADC.SYSTEM_STATES.ARMED_AWAY:
        return 'Armed Away'
      case nodeADC.SYSTEM_STATES.ARMED_STAY:
        return 'Armed Stay'
      default:
        return `UNKNOWN (${current})`
    }
  } else {
    switch (current) {
      case nodeADC.SYSTEM_STATES.DISARMED:
        switch (target) {
          case nodeADC.SYSTEM_STATES.ARMED_AWAY:
            return 'Arming Away'
          case nodeADC.SYSTEM_STATES.ARMED_STAY:
            return 'Arming Stay'
          default:
            return `UNKNOWN (Disarmed -> ${target})`
        }
        break
      case nodeADC.SYSTEM_STATES.ARMED_AWAY:
      case nodeADC.SYSTEM_STATES.ARMED_STAY:
        switch (current) {
          case nodeADC.SYSTEM_STATES.DISARMED:
            return 'Disarming'
          case nodeADC.SYSTEM_STATES.ARMED_AWAY:
            return 'Arming Away'
          case nodeADC.SYSTEM_STATES.ARMED_STAY:
            return 'Arming Stay'
          default:
            return `UNKNOWN (${current} -> ${target})`
        }
        break
      default:
        return `UNKNOWN (${current} -> ${target})`
    }
  }
}
