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

3. Perform any device-specific configuration
 
	If there are any configuration files to load, if you'd like to assign a
	specific MAC address, or if you'd like to install any special software,
	it's much easier to do that now by mounting the image locally and making
	any changes before flashing.

	To make changes, mount the `.home` and `.root` files. Any home directory changes, such as
	updating repositories are done in the `.home` partition. Any configuration files are edited
	in the `.root` file.
	
	(n.b. https://github.com/alperakcan/fuse-ext2 worked well for mounting
	ext4 images on mac)
	
	When flashing a gateway, edit `etc/network/interfaces` to change the MAC address of the
	device. Example

		auto eth0
		iface eth0 inet dhcp
			hwaddress ether c0:98:e5:c0:00:10

	If using sensu, its configuration file, `etc/sensu/conf.d/client.json`, must be edited with
    	the proper client name and address.

3. Flash jubilinux to the Edison.

	**Before plugging in the gateway** have a terminal window open and ready to
	connect (i.e. `miniterm /dev/tty.u[] 115200`, where `[]` is your cursor ready
	to hit tab). When the edison boots you have a short window to "Hit any key to
	stop autoboot".

	Plug the Gateway into your computer with the right micro USB connected (the one
	inbetween the two other USB headers on the board. Make sure the switch near the
	USB headers is flipped to the left.

	In your serial console, type `run do_flash`:

		Hit any key to stop autoboot:  0
		boot > run do_flash
		Saving Environment to MMC...
		Writing to MMC(0)... done
		GADGET DRIVER: usb_dnl_dfu

	Then, in another terminal:

        cd jubilinux
        sudo ./flashall.sh

	If you get errors, you may have to install drivers in windows
	
		[Intel Driver](https://software.intel.com/en-us/iot/hardware/edison/downloads)
		[D2XX Direct Driver](http://www.ftdichip.com/Drivers/D2XX.htm)
		
	Errors also occur if you have not run the script as root. You can run `sudo dfu-util -l`
	to check that the Edison DFU device has been found.

	This will take a while to run. It will flash several things, and then reboot the board
	
		$ ./flashall.sh
		Using U-Boot target: edison-defaultcdc
		Now waiting for dfu device 8087:0a99
		Please plug and reboot the board
		Flashing IFWI
		Download	[=========================] 100%      4194304 bytes
		Download	[=========================] 100%      4194304 bytes
		Flashing U-Boot
		Download	[=========================] 100%       245760 bytes
		Flashing U-Boot Environment
		Copying data from PC to DFU device
		Flashing U-Boot Environment Backup
		Download	[=========================] 100%        65536 bytes
		Rebooting to apply partition changes
		Now waiting for dfu device 8087:0a99

	Sometimes, the reboot will correctly allow flashall to keep going, sometimes the
	kernel will manage to boot again, in which case you'll have to manually reboot
	the Edison, catch it (any key) and `run do_flash` again. The flash script will
	automatically resume:
	
	(n.b. if you'd left this unattended, your terminal may be full of garbage b/c
	the Edison ups the baudrate of the serial link at some point during bootup.
	Everything is still fine, just reboot and it will reset to 115200.)
	
		Flashing boot partition (kernel)
		Copying data from PC to DFU device
		Flashing rootfs, (it can take up to 10 minutes... Please be patient)
		Download	[=========================] 100%   1610612736 bytes   <---- LOOK CAREFULLY
		Flashing home, (it can take up to 10 minutes... Please be patient)
		Copying data from PC to DFU device
		Rebooting
		U-boot & Kernel System Flash Success...
	
	This step will take a while. Be sure to look carefully at each flash step, as
	it will sometimes fail, but the flash script will print success anyway.

4. Plug in a micro USB cable to the left micro USB port. Connect to
the edison over UART with something like:

        miniterm.py /dev/ttyUSB0 115200

4. Login with

        user: edison
        pass: edison

4. Become root. Password is `edison`.

        su

5. Connect to Wi-Fi or flip the switch and plug in ethernet.

        ifconfig wlan0 up
        iwconfig wlan0 essid "4908airwaves"
        dhclient wlan0
        

6. Install sudo.

        apt install sudo

7. Create "debian" user to match the BBB.

        adduser debian

7. Allow `debian` to sudo:

        usermod -a -G sudo debian

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
        sudo dd bs=4M if=/dev/mmcblk0p7 of=/mnt/sd/swarm-gateway-edison-1.4.0.boot
        sudo dd bs=4M if=/dev/mmcblk0p8 of=/mnt/sd/swarm-gateway-edison-1.4.0.root
        sudo dd bs=4M if=/dev/mmcblk0p10 of=/mnt/sd/swarm-gateway-edison-1.4.0.home
        
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
