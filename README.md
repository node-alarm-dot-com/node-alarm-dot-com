# node-alarmdotcom
An [Alarm.com](https://alarm.com/) interface module.

# Installation

    % sudo npm install -g node-alarmdotcom

# Usage

#### Command Line

    % nodeADC <username> <password> <command>

#### As a Node.js Module

    var nodeADC = require('node-alarmdotcom');

    nodeADC('username', 'password', 'disarm', function(state) {
       console.log(state);
    });
    
    // should output: DISARM


# Acknowledgements
Many thanks to:

 - [Schwark Satyavolu](https://github.com/schwark), original author of [pyalarmcom](https://github.com/schwark/pyalarmcom)
 - [Bryan Bartow](https://github.com/bryan-bartow), original author of [homebridge-alarm.com](https://github.com/bryan-bartow/homebridge-alarm.com)
