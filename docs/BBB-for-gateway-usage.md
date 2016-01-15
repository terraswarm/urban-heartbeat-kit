Using the BeagleBone Black - Gateway Version
============================================

The gateway is configured to accept data from many sensors
and distribute the data to many applications.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Initial Setup](#initial-setup)
- [Find the IP Address of the BBB](#find-the-ip-address-of-the-bbb)
- [Getting Data from BLE Devices On Your Computer](#getting-data-from-ble-devices-on-your-computer)
- [Hacking the Gateway](#hacking-the-gateway)
  - [Configuring Startup](#configuring-startup)
  - [WiFi Interface](#wifi-interface)
  - [802.15.4 Interface](#802154-interface)
  - [Audo/Microphone Support](#audomicrophone-support)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Initial Setup
-------------

To setup the gateway plug the BBB into a ethernet network and then power
it with the included power adapter. The BBB will use DHCP to obtain
an IP address.

Find the IP Address of the BBB
------------------------------

The first step is to find the IP address of the BBB. To help with this,
the BBB is identifying itself on:

- mDNS
- SSDP/UPnP
- BLE/Eddystone

To find it, you have a few options:

1. **Summon app for Android**: Download the
[Summon](https://play.google.com/store/apps/details?id=edu.umich.eecs.lab11.summon)
app or the [Nordic BLE App](https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp)
and look for a device with the name "Beaglebone". Both apps will display the IP address.

2. **Try using the mDNS URL**: If mDNS lookup is working, and you are on the same
network as the BBB, you should be able to view [beaglebone.local](http://beaglebone.local/).

3. **Use the find-my-gatway.js script**: We have a node.js script that searches for the BBB
on all of the protocols. To use:
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
    4. You should be able to scan for all nearby gateways:

            ./find-my-gateway.js

4. **Use the discovery protocols directly**: If you have a tool you like for
any of the discovery protocols, you can use that directly.
    1. **mDNS**: Look for services matching `_workstation._tcp` with the name
    `beaglebone`. On Linux:

            avahi-browse _workstation._tcp
   2. **SSDP/UPnP**: Look for the `urn:TerraSwarm:gateway:1` profile.
   3. **BLE/Eddystone**: Scan for BLE advertisements with device
   name `beaglebone`. The IP address is encoded in them as ASCII.

5. **Use nmap**: Scan for all devices with port 3001 (the websockets port)
open:

        nmap -sV -p3001 --open <any ip address on the BBB network>/24


Getting Data from BLE Devices On Your Computer
----------------------------------------------

Data from BLE devices is collected by the
[BleGateway](https://github.com/lab11/gateway/tree/master/software/ble-gateway)
core application which runs on the BBB by default. Devices which support
this gateway point the gateway to a
device-specific "parser" JavaScript function that converts their BLE
advertisements to key,value JavaScript objects. Those objects are then
passed to subscribed applications.

You can access these packets over a couple protocols once you know
the IP address of the BBB gateway (or if you are on the same
LAN). For code examples, look
[here](https://github.com/terraswarm/urban-heartbeat-kit/tree/master/examples).

- **Quick View**

    To view a very simple UI with the recent data, go to:

        http://<ip address of the BBB>

    This will display all of the devices the gateway has seen and their
    last ten packets.

- **WebSockets**

    To retreive as a websocket stream, connect a websocket client to

        ws://<ip address of the BBB>:3001

    All packets the gateway sees will be sent to each client connected
    via websockets.

    - **Ptolemy**

        To get packets from the gateway to Ptolemy, add a `WebSocketClient`
        accessor with the IP address of the BBB as the `server` field and
        3001 as the `port` field. See an example in the `ptolemy` folder.

- **MQTT**

    To retreive data from a MQTT topic, install MQTT and run:

        mosquitto_sub -h <ip address of the BBB> -t ble-gateway-advertisements

- **UDP Broadcast**

    Packets are sent as JSON encoded strings in UDP packets to the broadcast
    address `255.255.255.255` on port `3002`.

- **Retrieving from GDP**

    If you have the GDP client installed (or you can run this on the BeagleBone
    Black) you can query packets from GDP by reading the correct log. The log
    name is `org.terraswarm.gatewayv1.<MAC address of gateway>`. For example:
    `org.terraswarm.gatewayv1.84eb1898b4a8`.

        gdp-reader -s org.terraswarm.gatewayv1.<BBB MAC address>


Hacking the Gateway
-------------------

The above protocols and the examples in the `examples` folder can also
run directly on the gateway. To connect:

    ssh debian@<ip address of BBB>

See the TerraSwarm wiki for the password.

In the `$HOME` folder is this repository. Running `git pull` in that folder
will update the code to the latest version.

    cd urban-heartbeat-kit
    git pull

### Configuring Startup

Four main services are configured to start at boot:

1. `ble-gateway-publish`: Recieves BLE packets and publishes them on the various protocols.
2. `ble-gateway-server`: Displays the received packets in a web interface.
3. `gateway-gdp-publish`: Publish gateway packets to a GDP log.
4. `adv-gateway-ip`: Broadcast the gateway IP address over BLE/Eddystone.

Each service is running inside of [systemd](http://www.freedesktop.org/wiki/Software/systemd/).
To stop a service:

    sudo systemctl stop <service name>

To restart a service:

    sudo systemctl restart <service name>

To stop a service from running at boot:

    sudo systemctl disable <service name>


### WiFi Interface
Adafruit has instructions for setting up a WiFi connection
[located here](https://learn.adafruit.com/setting-up-wifi-with-beaglebone-black/configuration).
**Do not** perform the kernel upgrade step (first step) since that has already been
run on the Beaglebone gateway.

### 802.15.4 Interface

The [GAP](https://github.com/lab11/gap) cape for the BBB provides two 802.15.4 radios
fully supported by the Linux kernel.

For instructions, see the [GAP Readme](https://github.com/lab11/gap#sniffing-154-packets).

### Audo/Microphone Support

View that the microphone is attached:

    arecord -l

Record an audio sample:

    arecord -D hw:1 -r 44100 -f S16_LE sound.wav
