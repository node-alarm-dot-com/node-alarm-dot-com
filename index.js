const fetch = require('node-fetch')

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'

exports.login = login
exports.getCurrentState = getCurrentState
exports.armStay = armStay
exports.armAway = armAway
exports.disarm = disarm

function login(username, password) {
  let status
  let headers

  return fetch('https://my.frontpointsecurity.com/api/Login/token', {
    method: 'POST',
    body: JSON.stringify({
      Username: username,
      Password: password,
      RememberMe: false
    }),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Referer': 'https://my.frontpointsecurity.com/login',
      'User-Agent': UA
    }
  }).then(res => {
    status = res.status
    headers = res.headers
    return res.json()
  }).then(json => {
    if (status !== 200)
      throw new Error(`Auth failed: ${json.Message || status}`)
    return { body: json, headers: headers.raw() }
  })
}

function getCurrentState() {

}

function armStay() {

}

function armAway() {

}

function disarm() {

}

// Test /////////////////////////////////////

login(process.env.FP_USERNAME, process.env.FP_PASSWORD)
  .then(res => {
    console.dir(res)
  })
  .catch(err => {
    console.error(err)
  })
