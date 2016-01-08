Urban Heartbeat Kit
===================

Information about the preliminary gateway kit for the Urban Heartbeat workshop
(2016/01/13).

Gateway
----------

![Gateway](https://raw.githubusercontent.com/terraswarm/urban-heartbeat-kit/master/media/gateway.jpg)

### Hardware

The gateway is composed of:

- A [Beaglebone Black](http://beagleboard.org/BLACK)
- A [BBB power supply](http://www.newark.com/adafruit-industries/276/ac-dc-converter-external-plug/dp/53W5823)
- A [GAP](https://github.com/lab11/gap) cape
- A [USB Hub](http://www.newark.com/iogear/guh285w6/hub-4-port-usb-2-0/dp/74R2322)
- A [BLE dongle](http://www.amazon.com/gp/product/B007Q45EF4)
- A [WiFi dongle](http://www.amazon.com/Edimax-EW-7811Un-150Mbps-Raspberry-Supports/dp/B003MTTJOY)
- A [Microphone dongle](http://www.amazon.com/Super-Microphone-Adapter-Driver-Notebook/dp/B00M3UJ42A)

[Setup a BeagleBone Black to be a gateway](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/BBB-for-gateway.md)

### Software

#### BleGateway

The [BleGateway](https://github.com/lab11/gateway/tree/master/software/ble-gateway)
provides a general way to collect data from BLE devices.
It's organized as a core gateway service that publishes formatted data packets
from service adapters that make the packets available over various protocols.

```
                                       +--------+
                                       |        |
                                       |  Web   |
                             +-------> | Server |
                             |         |        |
                             |         +--------+
                             |
                             |          +------+
                             |          |      |  MQTT topic "ble-gateway-advertisements"
                +---------+  +--------> | MQTT | +--------------------------------------->
    BLE         |         |  |          |      |
 Advertisement  |   Ble   +--+          +------+
+-+    +------> | Gateway |  |
|D+----+        |         |  |       +-----------+
+-+             +---------+  |       |           |  WebSocket Port 3001
                             +-----> | WebSocket | +------------------->
                             |       |  Server   |
                             |       |           |
                             |       +-----------+
                             |
                             |       +-----------+
                             |       |           |  UDP port 3002
                             +-----> |    UDP    | +------------->
                                     | Broadcast |
                                     |           |
                                     +-----------+
```

Example listeners for subscribing to packets are in the
[examples](https://github.com/terraswarm/urban-heartbeat-kit/tree/master/examples)
folder.

### Interacting with the BBB

[Use the BBB gateway](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/BBB-for-gateway-usage.md)


Sensors
-------

1. **[PowerBlade](https://github.com/lab11/powerblade)**: A 1 inch2 power meter. Advertises
power readings every second over BLE.
1. **[BLEES](https://github.com/lab11/blees)**: A 1 inch round environment sensor. Advertises
temperature, humidity, light, pressure, and vibration each second.


