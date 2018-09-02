const frontpoint = require('..')

main()

function main() {
  let command
  let authOpts

  const yargs = require('yargs')
    .usage('Usage: $0 [options] <command>')
    .command({
      command: 'stay',
      desc: 'Arm the default system in stay mode',
      handler: argv => (command = 'armStay')
    })
    .command({
      command: 'away',
      desc: 'Arm the default system in away mode',
      handler: argv => (command = 'armAway')
    })
    .command({
      command: 'disarm',
      desc: 'Disarm the default system',
      handler: argv => (command = 'disarm')
    })
    .demandCommand(1, 1, 'You must specify a command (stay/away/disarm)')
    .option('u', {
      alias: 'username',
      default: process.env.FRONTPOINT_USERNAME,
      defaultDescription: 'FRONTPOINT_USERNAME environment variable',
      describe: 'FrontPoint username',
      type: 'string'
    })
    .option('p', {
      alias: 'password',
      default: process.env.FRONTPOINT_PASSWORD,
      defaultDescription: 'FRONTPOINT_PASSWORD environment variable',
      describe: 'FrontPoint password',
      type: 'string'
    })
    .option('n', {
      alias: 'noEntryDelay',
      default: false,
      describe: 'Disable the 30-second entry delay',
      type: 'boolean'
    })
    .option('s', {
      alias: 'silentArming',
      default: false,
      describe: 'Disable audible beeps and double the exit delay',
      type: 'boolean'
    })
    .help('h')
    .alias('h', 'help')
    .version(false)

  const username = yargs.argv.username
  const password = yargs.argv.password
  if (!username || !password) {
    console.error(`Error: FrontPoint username and password are required`)
    yargs.showHelp()
    return process.exit(1)
  }

  console.log('Authenticating...')

  frontpoint
    .login(username, password)
    .then(res => {
      authOpts = res
      return frontpoint.getCurrentState(res.systems[0], authOpts)
    })
    .then(res => {
      if (!res.partitions.length)
        return console.error('No security system partitions found')

      const partition = res.partitions[0]
      if (res.partitions.length > 1)
        console.warn(`Warning: multiple partitions found`)

      const msg =
        command === 'armStay'
          ? 'Arming (stay)'
          : command === 'armAway' ? 'Arming (away)' : 'Disarming'
      console.log(`${msg} ${partition.attributes.description}...`)

      const opts = {
        noEntryDelay: yargs.argv.noEntryDelay,
        silentArming: yargs.argv.silentArming
      }
      const method = frontpoint[command]

      method(partition.id, authOpts, opts).then(res => {
        console.log('Success')
      })
    })
    .catch(err => {
      console.error(err)
    })
}
