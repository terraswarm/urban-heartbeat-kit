<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [SwarmGateway Changelog](#swarmgateway-changelog)
  - [Version 1.2](#version-12)
  - [Version 1.1](#version-11)
  - [Version 1](#version-1)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

SwarmGateway Changelog
======================

Version 2.0.0
------------

- "Upgrade" to kernel 3.10.98.
- Remove clloader from edison/arduino support.
- Add support for LE910 cellular radio with NetworkManager.
- Add support for flashing the CC2538 at boot.
- Massive upgrade to commissioning.
  - Now support `first-install.sh` script that runs once after flashing.
- Support for reverse SSH connection.
- Complete build script that sets up the entire image.
- U-boot upgraded to 2017-05.

**Known Issues**
- Triumvi rebroadcast to BLE does not seem to work at the same time as
`ble-gateway-mqtt`. This used to work, and there are instructions for
getting it to work, but it doesn't seem to work right now.
- Wifi does not connect automatically until `nmcli con up id MWireless`
is run at least once. Once this has been done, then it seems to connect
at boot.

Version 1.3
-----------

- Upgrade BBB Linux kernel to 3.5.0.
- Upgrade `node` to 5.8.0.
- Add GATD publisher.
- `ble-nearby` fixes.
- Moved `gateway-ssdp` to gateway repo.
- Add email watchdog.
- Add 15.4 Monjolo receiver.

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
