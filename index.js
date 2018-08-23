/* jshint asi: true, node: true, laxbreak: true, laxcomma: true, undef: true, unused: true */
"use strict";

// dependencies
var _           = require('lodash'),
    util        = require('util'),
    mechanize   = require('mechanize');

// collect commandline args
// production
var cliargs = process.argv.slice(2); // 0 is node, 1 is command, 2 is arguments
// development
// var cliargs = ['username','password','status'];
if (cliargs.length > 0) {
  var username  = cliargs[0],
      password  = cliargs[1],
      operation = cliargs[2];
} else {
  console.log("Missing username and password");
  return;
}

// setup
var panel_id,
    logged_in   = false,
    state       = 'UNKNOWN',
    browser     = mechanize.newAgent();

function _login() {

  if (logged_in === false) {

    // get login page state used for logging in

    browser.get({uri: 'https://www.alarm.com/login.aspx'}, function (err, page) {

      var content = page.body;

      var viewstate = content.match(/name="__VIEWSTATE".*?value="([^"]*)"/);
      if (viewstate != null) {
        viewstate = viewstate[1];
      }
      console.log("VIEWSTATE is "+viewstate);

      var viewstategenerator = content.match(/name="__VIEWSTATEGENERATOR".*?value="([^"]*)"/);
      if (viewstategenerator != null) {
        viewstategenerator = viewstategenerator[1];
      }
      console.log("VIEWSTATEGENERATOR is "+viewstategenerator);

      var eventval = content.match(/name="__EVENTVALIDATION".*?value="([^"]*)"/);
      if (eventval != null) {
        eventval = eventval[1];
      }
      console.log("EVENTVALIDATION is "+eventval);

      logged_in = null;

      // attempt login

      var requestData = {
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
                        };
      requestData = Object.keys(requestData).map(function(key) {
        return key + '=' + encodeURIComponent(requestData[key]);
      }).join('&');
      console.log(requestData);

      var form = {
        page: {uri: 'https://www.alarm.com/web/Default.aspx'},
        enctype: 'application/x-www-form-urlencoded',
        requestData: function () {
          return requestData;
        }
      };

      browser.postForm('https://www.alarm.com/web/Default.aspx', form, {}, {}, function (err, page) {

        console.log('SUCCESS LOGGED IN!');
        logged_in = true;
        console.log(page);

      });

    });

  }

}

_login();
