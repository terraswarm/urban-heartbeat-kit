Find My Gateway!
================

This node.js scripts help with discovering nearby gateways.
It searches using mDNS, SSDP, and BLE/Eddystone to find the
IP address of nearby gateways.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Install
-------

1. Install [node.js](https://nodejs.org/en/download/). If you are cool with
running a downloaded shell script as root you can do this on Ubuntu:

        curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
        sudo apt-get install -y nodejs

2. On Linux, make sure you have other dependencies installed:

        sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev avahi-daemon libavahi-compat-libdnssd-dev

    Also setup node.js so it can look for BLE packets without being root:

        sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

3. Setup the dependencies for the script:

        cd urban-heartbeat-kit/discover/find-my-gateway
        npm install


Usage
-----

You should be able to scan for all nearby gateways:

    ./find-my-gateway.js
