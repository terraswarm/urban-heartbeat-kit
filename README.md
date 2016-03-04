Urban Heartbeat Kit
===================

Information about the preliminary gateway kit for the Urban Heartbeat workshop
(2016/01/13).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Gateway](#gateway)
  - [Hardware](#hardware)
  - [Software](#software)
    - [BleGateway](#blegateway)
    - [Local Server View](#local-server-view)
    - [GDP Client](#gdp-client)
    - [BLE Nearby](#ble-nearby)
    - [EmonCMS](#emoncms)
    - [Local Logging](#local-logging)
    - [BLE Advertisement Sniffing](#ble-advertisement-sniffing)
  - [Interacting with the BBB](#interacting-with-the-bbb)
- [Sensors](#sensors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Gateway
----------

<p align="center">
  <img src="https://raw.githubusercontent.com/terraswarm/urban-heartbeat-kit/master/media/gateway.jpg" alt="Gateway" width="50%;">
</p>

### Hardware

The gateway hardware is listed
[here](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/urban-heartbeat-kit-hardware.md).

The gateway in the kit is pre-configured. If you want to commission a new
BeagleBone Black, there are two options:
 * [from image](docs/BBB-gateway-setup-image.md)
 * [from scratch](docs/BBB-gateway-setup-from-scratch.md)


### Software

Some gateway-specific software is pre-loaded on the BBB.


#### BleGateway

<img src="https://raw.githubusercontent.com/terraswarm/urban-heartbeat-kit/master/media/ble_gateway_diagram.jpg" width="70%">

The [BleGateway](https://github.com/lab11/gateway/tree/master/software/ble-gateway)
provides a general way to collect data from BLE devices.
It's organized as a core gateway service that receives device-specific BLE packets
from nearby devices,
parses those packets with a device-provided parser, and
publishes the formatted data packets over various protocols.

Example listeners for subscribing to packets are in the
[examples](https://github.com/terraswarm/urban-heartbeat-kit/tree/master/examples)
folder.

#### Local Server View

Each gateway is running a simple webserver on port 80 that displays
the current status of the gateway and some information about the
devices it currently can see.

#### GDP Client

The gateway comes with the C client and Python bindings installed for using
[GDP](https://swarmlab.eecs.berkeley.edu/projects/4814/global-data-plane). There is also an
[example publisher script](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/examples/python2-gdp.py).

#### BLE Nearby

This service discovers nearby gateways using their BLE advertisements, and creates a network
of nearby gateways and the devices they can see. The system then uses packet reception rates
and RSSI to determine which devices are nearest to which gateways. It then publishes
a list of IDs that are nearest to that gateway on MQTT topic named `ble-nearby`.

#### EmonCMS

[EmonCMS](https://emoncms.org/) is a web backend tool for aggregating power data. While it is designed for power
related data, it can handle any numerical timeseries data. The gateway can post data to an EmonCMS server. See
the usage doc for how to configure that service.

#### Local Logging

The gateway can log all received packets to local storage. All packets are stored in JSON format and compressed.
See the usage doc for enabling local logging.

#### BLE Advertisement Sniffing

Each gateway is sniffing for not only data packets it knows how to parse,
but additionally all BLE advertisement IDs. Each ID and the RSSI for the packet
is provided on the `ble-advertisements` MQTT topic.








### Interacting with the BBB

[Use the BBB gateway](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/BBB-for-gateway-usage.md)


Sensors
-------

1. **[PowerBlade](https://github.com/lab11/powerblade)**: A 1 inch by 1 inch power meter. Advertises
power readings every second over BLE.

    <img src="https://raw.githubusercontent.com/lab11/powerblade/master/images/powerblade.png" alt="PowerBlade" width="30%;">



1. **[BLEES](https://github.com/lab11/blees)**: A 1 inch round environment sensor. Advertises
temperature, humidity, light, pressure, and vibration each second.

    <img src="https://raw.githubusercontent.com/lab11/blees/master/media/blees.png" alt="BLEES" width="25%;">

1. **[Blink](https://github.com/lab11/blees/tree/master/hardware/blink/rev_a)**: A 1 inch round PIR based motion sensor. Advertises
whether the sensor is currently detecting motion, whether it has detected motion since the last tranmsmitted packet,
and whether it has detected motion in the last minute.
