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

3. Flash jubilinux to the Edison. Plug the Gateway into your computer with
the right micro USB connected (the one inbetween the two other USB headers
on the board. Make sure the switch near the USB headers is flipped to the left.

        cd toFlash
        sudo ./flashall.sh



4. Plug in a micro USB cable to the left micro USB port. Connect to
the edison over UART with something like:

        miniterm.py /dev/ttyUSB0 115200

4. Login with

        user: edison
        pass: edison

5. Change password:

        passwd

6. Become root to install sudo

        su
        apt-get install sudo

7. Create "debian" user to match the BBB.

        adduser debian

7. Allow `debian` to sudo:

        usermod -a -G sudo debian
        # exit su with ctrl+d

8. Install dependencies

        sudo apt-get install vim bluetooth bluez libbluetooth-dev libudev-dev libavahi-compat-libdnssd-dev python-pip

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
