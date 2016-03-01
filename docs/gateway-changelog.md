SwarmGateway Changelog
======================

Version 1.2
-----------

- Re-architect the `gateway` software. This allows for other packet sources
(e.g. CC2538/802.15.4) to be easily added.
- Change SSH prompt.
- Add `ble-nearby` support for discovering which devices are near
this gateway and not a different one.
- Add support for local logging.
- Begin to add support for Edison based gateway.

Version 1.1
-----------

- Add SSDP discovery support.
- Change name to `swarmgateway`.
- Update `noble` to restart scanning automatically.
- Add BLE MAC address scanning.
- Add support for publishing to emoncms.
- Add MQTT topics for each device.
- Add mDNS-SD for MQTT.
- Turn off LEDs at boot.


Version 1
---------

- Initial release
