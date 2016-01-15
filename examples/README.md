BleGateway Usage Examples
=========================

This folder contains sample code for retreiving data from the gateway
in both [Node.js](https://nodejs.org/en/) and [Python](https://www.python.org/).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Initial Setup](#initial-setup)
- [Node.js](#nodejs)
- [Python](#python)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Initial Setup
-------------

Clone this repo to get the example scripts.

    git clone https://github.com/terraswarm/urban-heartbeat-kit.git
    cd urban-heartbeat-kit/examples

Node.js
-------

Install the needed dependencies:

    npm install

- **node-broadcast.js**: Run this to receive broadcast UDP packets.
Make sure you are on the same LAN as the gateway.
- **node-mqtt.js**: Receive packets from the MQTT broker. Make sure
to update the `HOST` variable to point at the gateway running the MQTT service.
- **node-websocket.js**: Connect to a WebSockets server and
receive packets from the connection. Make sure to update the `HOST` variable.


Python
------

There are examples for both Python2 and Python3. The Py2 versions either use
single-threaded examples or the flavor-of-the-week underlying async engine.
The Py3 examples are all based on the built-in
[asyncio](https://docs.python.org/3/library/asyncio.html) module. **To use the
Py3 versions, make sure you have Python 3.5+.**

Each file will print out its dependencies and how to install them.

- **python-broadcast.py**: Make sure you are on the same LAN.
- **python-mqtt.py**: Update the `HOST` variable.
- **python-websocket.py**: Update the `HOST` variable.
- **python2-gdp.py**: Will publish the gateway data to a GDP log.

