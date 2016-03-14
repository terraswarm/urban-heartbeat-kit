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

<img src="https://raw.githubusercontent.com/terraswarm/urban-heartbeat-kit/master/media/gateway.jpg" alt="Gateway" width="25%;" align="right">
<img src="https://raw.githubusercontent.com/terraswarm/urban-heartbeat-kit/master/media/gateway_edison_824x1000.jpg" alt="Gateway Edison" width="25%;" align="right">



### Hardware

The hardware in the kit is listed
[here](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/urban-heartbeat-kit-hardware.md).
The two gateway hardware platforms are [GAP](https://github.com/lab11/gap) and
an [Edison based version](https://github.com/lab11/IntelEdisonGateway).

The gateway in the kit is pre-configured. If you want to commission a new
BeagleBone Black, there are two options:
 * [from image](docs/BBB-gateway-setup-image.md)
 * [from scratch](docs/BBB-gateway-setup-from-scratch.md)


### Software

Some gateway-specific software is pre-loaded on the gateway.
The gateway software stack is described [here](https://github.com/lab11/gateway).



### Interacting with the Urban Heartbeat Kit

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

     <img src="https://raw.githubusercontent.com/lab11/blees/master/media/blink_large_1000x790.jpg" alt="BLEES" width="25%;">


