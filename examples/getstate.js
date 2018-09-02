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
      console.log(Object.keys(nodeADC.SYSTEM_STATES)[parseInt(res.partitions[0].attributes.state)])
    })
    .catch(err => {
      console.error(err)
    })
}
