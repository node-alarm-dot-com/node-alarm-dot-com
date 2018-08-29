#!/usr/bin/env node

/* jshint asi: true, node: true, laxbreak: true, laxcomma: true, undef: true, unused: true */
"use strict";

// dependencies
var needle      = require('needle'),
// defaults
    logging     = false,
    loggedin    = false,
    panelid     = null,
    state       = 'UNKNOWN',
    jar         = {};

// set needle HTTP client defaults
needle.defaults({
  user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36'
});

// helper function to merge two objects together
// used for merging/adding cookies to the session
function merge(obj1,obj2){
    var objout = {};
    for (var attrname in obj1) { objout[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { objout[attrname] = obj2[attrname]; }
    return objout;
}

// method for logging in
function _login(username, password, operation, callback) {

  if (!loggedin) {

    needle.get('https://www.alarm.com/login.aspx', {cookies: jar}, function(err, resp, body) {

      if (!err) {

        // store cookies from page in the cookie jar
        jar = resp.cookies;

        // collect automatically populated hidden input fields required for login form session
        var viewstate = body.match(/name="__VIEWSTATE".*?value="([^"]*)"/);
        if (viewstate != null) {
          viewstate = viewstate[1];
        } // console.log("VIEWSTATE = "+viewstate);
        var viewstategenerator = body.match(/name="__VIEWSTATEGENERATOR".*?value="([^"]*)"/);
        if (viewstategenerator != null) {
          viewstategenerator = viewstategenerator[1];
        } // console.log("VIEWSTATEGENERATOR = "+viewstategenerator);
        var eventval = body.match(/name="__EVENTVALIDATION".*?value="([^"]*)"/);
        if (eventval != null) {
          eventval = eventval[1];
        } // console.log("EVENTVALIDATION = "+eventval);

        // attempt clean login
        loggedin = null;

        // submit login form
        needle.post('https://www.alarm.com/web/Default.aspx', {
            '__VIEWSTATE': viewstate,
            '__EVENTVALIDATION': eventval,
            '__VIEWSTATEGENERATOR': viewstategenerator,
            'IsFromNewSite': '1',
            'JavaScriptTest': '1',
            'ctl00$ContentPlaceHolder1$loginform$hidLoginID': '',
            'ctl00$ContentPlaceHolder1$loginform$txtUserName': username,
            'ctl00$ContentPlaceHolder1$loginform$txtPassword': password,
            'ctl00$ContentPlaceHolder1$loginform$signInButton': 'Logging In...',
            'ctl00$bottom_footer3$ucCLS_ZIP$txtZip': 'Zip Code'
          }, {cookies: jar}, function(err, resp, body) {

            if (!err) {

              // console.log(resp.headers.location);

              jar = merge(jar, resp.cookies);
              // console.log('SESSION COOKIES: '+JSON.stringify(jar, null, 4));

              // follow redirect
              needle.get('https://www.alarm.com/web/DetermineLandingPage.aspx', {cookies: jar}, function(err, resp, body) {

                if (!err) {

                  // console.log(resp.headers.location);

                  loggedin = true;
                  // console.log('Logged in!');

                  jar = merge(jar, resp.cookies);
                  // console.log('ajaxkey: '+jar.afg);
                  // console.log('SESSION COOKIES: '+JSON.stringify(jar, null, 4));

                  _get_panel(operation, function(result) {
                    
                    callback && callback(result);

                  });


                }
                else {
                  console.error('There was an error with redirecting to dashboard:');
                  console.error(err);
                }

              });

            }
            else {
              console.error('There was an error with loggin in:');
              console.error(err);
            }

          });
      }
      else {
        console.error('There was an error with connecting to the website:');
        console.error(err);
      }
      

    });

  }

}

// method to get panel id for account
function _get_panel(operation, callback) {

  if (!panelid) {

    // get user id, used for getting the panel id
    api_call('GET', 'systems/availableSystemItems', null, function(result) {
      
      // console.log('api_call body: '+JSON.stringify(result, null, 4));
      // console.log('userid: '+result.value[0].id);
      var userid = result.value[0].id

      // get panel id, used in sending the command to the panel
      api_call('GET', 'systems/systems/'+userid, null, function(result) {

        // console.log('api_call body: '+JSON.stringify(result, null, 4));
        // console.log('panelid: '+result.value.partitions[0].id);
        panelid = result.value.partitions[0].id;

        command(operation, null, null, null, function(result) {
          callback && callback(result);
        });

      });

    });

  }

}

function command(operation, forcebypass=false, noentrydelay=false, silentarming=false, callback) {

  var apimethod,
      apibody,
      states      = ['UNKNOWN', 'DISARM', 'ARMSTAY', 'ARMAWAY'],
      operations  = {'ARMSTAY': '/armStay', 'ARMAWAY': '/armAway', 'DISARM': '/disarm', 'STATUS': ''},
      operation   = operation.toUpperCase(),
      apiendpoint = 'devices/partitions/'+panelid+operations[operation];

  // console.log('Running command: '+operation);

  if (operation === 'STATUS') {
    apimethod = 'GET';
    apibody   = '';
  }
  else {
    apimethod = 'POST';
    apibody   = '{"forceBypass":'+String(forcebypass).toLowerCase()+',"noEntryDelay":'+String(noentrydelay).toLowerCase()+',"silentArming":'+String(silentarming).toLowerCase()+',"statePollOnly":false}';
  }

  // console.log(apimethod);
  // console.log(apiendpoint);
  // console.log(apibody);

  // run command operation to the panel (arm, disarm, get status) and output the resulting status
  api_call(apimethod, apiendpoint, apibody, function(result) {

    // console.log('api_call body: '+JSON.stringify(result, null, 4));
    // console.log('current state: '+result.value.state);
    state = states[result.value.state];
    if (logging === true) {
      var output = {};
      output.current_status = state;
      console.log(JSON.stringify(output));
    }
    callback && callback(state);

  });

}

// method for making calls to the alarm.com HTTP API
function api_call(apimethod='GET', apiendpoint, apibody='', callback) {

  // store ajax key
  var ajaxkey = null;
  ajaxkey = jar.afg;

  var result = null;
  needle.request(apimethod, 'https://www.alarm.com/web/api/'+apiendpoint, apibody, {
      cookies: jar,
      json: true,
      headers: {
        'ajaxrequestuniquekey': ajaxkey,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/json; charset=UTF-8'
      }
    }, function(err, resp, body) {
      if (!err) {
        callback && callback(body);
      }
      else {
        console.error('There was an error with the api_call:');
        console.error('apimethod: '+apimethod);
        console.error('apiendpoint: https://www.alarm.com/web/api/'+apiendpoint);
        console.error('apibody: '+apibody);
        console.error(err);
      }
    })

}



// the module is run on the command line
if (require.main == module) {

  logging = true;

  // get command line arguments
  var cliargs = process.argv.slice(2); // 0 is node, 1 is command, 2 is arguments
  // var cliargs = ['username', 'password', 'status'],

  // parse CLI arguments
  if (cliargs.length > 0) {

    var username  = cliargs[0],
        password  = cliargs[1],
        operation = cliargs[2];

    if (String(operation).toLowerCase() != 'status' &&
        String(operation).toLowerCase() != 'armaway' &&
        String(operation).toLowerCase() != 'armstay' &&
        String(operation).toLowerCase() != 'disarm') {

      console.error("Unknown or missing command (E.g., status, armaway, armstay, disarm).");
      return;

    }
    else {
      _login(username, password, operation);
    }

  }
  else {

    console.error("Missing username and password.");
    return;

  }
  
}
// the module is run as a required module, e.g., require('node-alarm-dot-com')
else {

  module.exports = function(username, password, operation, callback) {

    return _login(username, password, operation, callback);

  };

}





