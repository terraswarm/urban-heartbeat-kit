Setup Gateway BBB from Pre-built Image
=====================================

Rather than starting from a raw image and running all of the
steps to get the gateway running on a new BBB, a BBB can be flashed
directly with a pre-built image we have made.

1. Download the image.
    [urban-hearbeat-kit_1.0.0](http://nuclear.eecs.umich.edu/public/urban-heartbeat-kit_1.0.0.zip)

2. Unzip.

3. Load the image onto a 8 GB or larger micro SD card. I typically use
[Win32 Disk Imager](http://sourceforge.net/projects/win32diskimager/).

4. Plug the SD card into the BeagleBone Black.

5. Hold the "Boot Button" (pictured below) on the BBB
and apply power. Keep holding the button until the blue
lights come on.

    ![Boot Button](https://learn.adafruit.com/system/assets/assets/000/008/680/medium800/beaglebone_BeagleBoneBlack.jpeg?1396870310)

6. The blue lights will pulse back and forth while the onboard
eMMC is being flashed.

7. When the lights turn solid on the flashing is complete. Shortly
after the device will power itself off and the lights will go off.
Unplug power and the SD card and then re-power the BBB. It should
be all set!
