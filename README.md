Urban Heartbeat Kit
===================

Information about the preliminary gateway kit for the Urban Heartbeat workshop
(2016/01/13).

BleGateway
----------

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

### Gateway Hardware

- [Setup a BeagleBone Black to be a gateway](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/BBB-for-gateway.md)
- [Use the BBB gateway](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/BBB-for-gateway-usage.md)

