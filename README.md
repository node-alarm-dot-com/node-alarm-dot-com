# node-alarm-dot-com
An interface module written in node.js to arm and disarm [Alarm.com](https://alarm.com/) security systems.


# Installation

    % sudo npm install -g node-alarm-dot-com

# Usage

#### Command Line

    % nodeADC <username> <password> <command>

#### As a Node.js Module

    var nodeADC = require('node-alarm-dot-com');

    nodeADC('username', 'password', 'disarm', function(state) {
       console.log(state);
    });
    
    // should output: DISARM


# Acknowledgements
Many thanks to:

 - [Schwark Satyavolu](https://github.com/schwark), original author of [pyalarmcom](https://github.com/schwark/pyalarmcom)
 - [Bryan Bartow](https://github.com/bryan-bartow), original author of [homebridge-alarm.com](https://github.com/bryan-bartow/homebridge-alarm.com)
