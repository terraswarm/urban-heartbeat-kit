#!/usr/bin/env bash

# Set 3 of the 4 leds off and the last one blink periodically as a heartbeat
# of sorts.

echo none > /sys/devices/platform/leds/leds/beaglebone\:green\:usr0/trigger
echo none > /sys/devices/platform/leds/leds/beaglebone\:green\:usr1/trigger
echo none > /sys/devices/platform/leds/leds/beaglebone\:green\:usr2/trigger
echo timer > /sys/devices/platform/leds/leds/beaglebone\:green\:usr3/trigger
echo 200 > /sys/devices/platform/leds/leds/beaglebone\:green\:usr3/delay_on
echo 5000 > /sys/devices/platform/leds/leds/beaglebone\:green\:usr3/delay_off
