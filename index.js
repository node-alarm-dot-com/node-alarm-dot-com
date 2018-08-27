/* jshint asi: true, node: true, laxbreak: true, laxcomma: true, undef: true, unused: true */
"use strict";

// dependencies & defaults
var _           = require('lodash'),
    util        = require('util'),
    promise     = require('promise'),
    needle      = require('needle'),

    // cliargs     = process.argv.slice(2); // 0 is node, 1 is command, 2 is arguments
    cliargs     = ['username','password','status'],
    logged_in   = false,
    panel_id    = null,
    state       = 'UNKNOWN',
    jar         = {};

// parse CLI arguments
if (cliargs.length > 0) {
  var username  = cliargs[0],
      password  = cliargs[1],
      operation = cliargs[2];
} else {
  console.log("Missing username and password");
  return;
}

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
function _login(callback) {

  if (!logged_in) {

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
        logged_in = null;

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

                  jar = merge(jar, resp.cookies);
                  // console.log('SESSION COOKIES: '+JSON.stringify(jar, null, 4));

                  console.log('Logged in!');
                  logged_in = true;
                  _get_panel();

                }
                else {
                  console.log('Could not redirect to dashboard:');
                  console.log(err);
                }

              });

            }
            else {
              console.log('Could not login to login form:');
              console.log(err);
            }

          });
      }
      else {
        console.log('Could not connect to website:');
        console.log(err);
      }
      

    });

  }

}

// method to get panel id for account
function _get_panel() {

  if (!panel_id) {

    api_call('GET', 'systems/availableSystemItems');
    // console.log(result);

  }

  return panel_id;

}

// method for making calls to the alarm.com pseudo API
function api_call(apiMethod='GET', apiEndpoint, apiBody='') {

  // store ajax key
  var ajaxkey = null;
  ajaxkey = jar.afg;
  console.log('ajaxkey: '+ajaxkey);

  var result = null;
  needle.request(apiMethod, 'https://www.alarm.com/web/api/'+apiEndpoint, apiBody, {
      cookies: jar,
      json: true,
      headers: {
        'ajaxrequestuniquekey': ajaxkey,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/json; charset=UTF-8'
      }
    }, function(err, resp, body) {
      if (!err) {
        console.log('api_call body: '+JSON.stringify(body, null, 4));
        result = body;
      }
      else {
        console.log('Could not access api endpoint:');
        console.log(err);
        // result = null;
      }
    })
  return result;

}

_login();
