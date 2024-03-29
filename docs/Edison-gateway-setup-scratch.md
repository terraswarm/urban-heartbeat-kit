<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Intel Edison Gateway Setup from Scratch](#intel-edison-gateway-setup-from-scratch)
  - [Remaining Setup](#remaining-setup)
  - [Copying image](#copying-image)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Intel Edison Gateway Setup from Scratch
=======================================

1. Get the jubilinux `edison-linux-helper`:

        git clone https://github.com/jubilinux/edison-linux-helper.git
	
2. Get jubilinux image inside of the repo:

        cd edison-linux-helper
        wget http://www.jubilinux.org/dist/jubilinux-v0.1.1.zip
        unzip jubilinux-v0.1.1.zip

3. Add a patch to the patches folder so that it gets applied.

        cd patches
        wget https://raw.githubusercontent.com/lab11/gateway/c38d090fb699b01a4f2bba36a60741714db95442/buildroot/external/board/lab11/edison_v3-3.10.98/patches/linux/linux-0001-edison-spi-yesheng.patch
        cd ..

4. Select the correct kernel modules

        make menuconfig

    - Enable `Device Drivers/Network device support/USB Network Adapters/SMSC LAN95XX based USB 2.0 10/100 ethernet devices`
    - Enable `Device Drivers/Network device support/USB Network Adapters/QMI WWAN driver for Qualcomm MSM based 3G and LTE modems`
    - Enable `Device Drivers/USB support/USB Serial Converter support/USB driver for GSM and CDMA modems`
    - Enable `Device Drivers/USB support/USB Serial Converter support/USB FTDI Single Port Serial Driver`
    - Make `Device Drivers/GPIO Support/PCA953x, PCA955x, PCA957x, TCA64xx, and MAX7310 I/O ports` "M" for module.
    - Disable `Device Drivers/Sound card support`
    
5. Build the kernel:

        make

6. Patch up jubilinux with the new kernel and modules:

        make collected
        sudo ./dfu-image-install.sh `pwd`/jubilinux

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

7. Allow `debian` to sudo and read log files:

        usermod -a -G sudo debian
        usermod -a -G adm debian

8. Get rid of edison user.

        passwd -l edison
        sudo rm -rf /home/edison

8. Install dependencies

        apt install vim bluetooth bluez libbluetooth-dev libudev-dev libavahi-compat-libdnssd-dev



Remaining Setup
---------------

See the
[shared instructions](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/gateway-setup-scratch-common.md).



Copying image
-------------

Found some OK instructions
[here](https://communities.intel.com/message/258584#258584) and
[here](https://github.com/jubilinux/jubilinux/issues/2#issuecomment-292555366).

1. Make sure there is an SD card in the gateway.

2. Run the save edison script:

        /home/debian/gateway/edison/save_edison_image.sh <version> <flags>
	
    For example:
        
        /home/debian/gateway/edison/save_edison_image.sh 1.88.0 edison_v3-umich

3 . To flash, use this: https://github.com/lab11/gateway/tree/master/edison/v3
