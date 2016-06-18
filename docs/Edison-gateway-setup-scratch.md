<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Intel Edison Gateway Setup from Scratch](#intel-edison-gateway-setup-from-scratch)
  - [Remaining Setup](#remaining-setup)
  - [Copying image](#copying-image)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Intel Edison Gateway Setup from Scratch
=======================================

1. Download the latest version of [Jubilinux](http://www.robinkirkman.com/jubilinux/).

2. Extract Jubilinux.

        mkdir jubilinux
        mv jubilinux.zip jubilinux
        cd jubilinux
        unzip jubilinux.zip

3. This step is hard and takes hours. Compile edison/yocto
(following [these](https://github.com/LGSInnovations/Edison-Ethernet/blob/master/guides/customize-yocto-kernel.md)
directions. Make sure to both enable the USB Ethernet chip (as specified in those directions)
and make a module of `device drivers/gpio/pca953x` (gpio extender) so it doesn't
burn half of the Edison's CPU.

4. Make sure to put the `/edison-src/out/current/build/tmp/work/edison-poky-linux/linux-yocto/3.10.17-r0/package/lib/modules`
folder into the `.ext4` file (`/lib/modules/` folder).

3. Flash jubilinux to the Edison. Plug the Gateway into your computer with
the right micro USB connected (the one inbetween the two other USB headers
on the board. Make sure the switch near the USB headers is flipped to the left.

        cd jubilinux
        sudo ./flashall.sh

    You may need to keep the edison from booting to the kernel. To do this,
    Immediately after powering it start connecting to the serial port.
    You need to catch it early enough so that you see
    `*** Ready to receive application ***`. That will sit there for a bit,
    when the next thing prints, hit any key (perhaps `f`) to keep it from
    booting any further. Then type `run do_flash`. Now the edison
    is ready for you to run `flashall.sh`.


4. Plug in a micro USB cable to the left micro USB port. Connect to
the edison over UART with something like:

        miniterm.py /dev/ttyUSB0 115200

4. Login with

        user: edison
        pass: edison

4. Become root. Password is `edison`.

        su

5. Connect to Wi-Fi.

        ifconfig wlan0 up
        iwconfig wlan0 essid "4908airwaves"
        dhclient wlan0
        
    Note: I couldn't get Ethernet to work for this particular kernel version.
    The kernel module compiled by LGSInnovations didn't match the kernel
    included with jubilinux.

6. Install sudo.

        apt install sudo

7. Create "debian" user to match the BBB.

        adduser debian

7. Allow `debian` to sudo:

        usermod -a -G sudo debian
        # exit su with ctrl+d

8. Get rid of edison user.

        passwd -l edison

8. Install dependencies

        apt install vim bluetooth bluez libbluetooth-dev libudev-dev libavahi-compat-libdnssd-dev


Triumvi Setup
-------------

9. Install `mraa`:

        git clone https://github.com/intel-iot-devkit/mraa.git
        mkdir mraa/build && cd $_
        cmake .. -DBUILDSWIGNODE=OFF
        make
        sudo make install

Remaining Setup
---------------

See the
[shared instructions](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/gateway-setup-scratch-common.md).




Build your own kernel
---------------------

Based on instructions [here](https://github.com/LGSInnovations/Edison-Ethernet/blob/master/guides/customize-yocto-kernel.md).

1. Download and extract the file that looks like `edison-src-ww25.5-15.tgz` from the left side of
[Intel's page](https://downloadcenter.intel.com/download/25028/Intel-Edison-Board-Software-Package).
You may need to look around for the latest version. I dunno.

2. `make setup`

4. If you have gcc 5.1 (or presumable later), you need to apply 
[this](https://github.com/cloudius-systems/osv/blob/07e2d9032dbb3f4f2b0d0133e0eccd5be05dd05d/modules/ncurses/ncurses-5.9-gcc-5.patch)
patch to the ncurses module.

        patch -p1 < ./path/to/that/patch.patch

3. This one takes a while:

        cd out/linux64
        source poky/oe-init-build-env
        bitbake edison-image



Copying image
-------------

Found some good instructions
[here](https://communities.intel.com/message/258584#258584)


1. Get the good image off of the Edison.

        #after inserting SD card
        sudo mkdir /mnt/sd
        sudo mount /dev/mmcblk1p1 /mnt/sd
        dd bs=4M if=/dev/mmcblk0p7 /mnt/sd/swarm-gateway-edison-1.4.0.boot
        dd bs=4M if=/dev/mmcblk0p8 /mnt/sd/swarm-gateway-edison-1.4.0.root
        dd bs=4M if=/dev/mmcblk0p10 /mnt/sd/swarm-gateway-edison-1.4.0.home
        
2. Use the dfu-util to flash it on a new edison.

    1. Download ubilinux
    2. Edit flashall.sh to have:
    
            echo "Flashing rootfs, (it can take up to 10 minutes... Please be patient)"
	          flash-command --alt rootfs -D "${ESC_BASE_DIR}/swarm-gateway-edison-1.4.0.root"

	          echo "Flashing home directory, (it can take up to 10 minutes... Please be patient)"
	          flash-command --alt home -D "${ESC_BASE_DIR}/swarm-gateway-edison-1.4.0.home" -R

3. Plug in gateway. Both micro USB connected. Switch towards the micro USB.
Reboot gateway. Right after "*** Ready to receive application ***", wait for
"Hit any key to stop autoboot:" and hit a key. At the prompt, enter "run do_flash".

4. Then on your computer.

        sudo ./flashall.sh
