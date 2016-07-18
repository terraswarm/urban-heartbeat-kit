BeagleBone Black Setup for Gateway
==================================

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Remaining Setup](#remaining-setup)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

This is the setup directions for creating a gateway out of a
BeagleBone Black. These steps were originally designed for the
Urban Heartbeat Workshop (January 13, 2016).

1. Download a new
[Debian image](http://elinux.org/Beagleboard:BeagleBoneBlack_Debian#Jessie_Snapshot_console)
for the BBB. I used:

        microSD/Standalone: (console) (BeagleBone/BeagleBone Black/BeagleBone Green)
        wget https://rcn-ee.com/rootfs/bb.org/testing/2016-01-03/console/bone-debian-8.2-console-armhf-2016-01-03-2gb.img.xz
        sha256sum: 0e50b5e436a10626f2880f9cd70ddb7688f0875f24801a5f538e7417e2971238

2. Write the image to an SD card. I use
[Win32 Disk Imager](http://sourceforge.net/projects/win32diskimager/).

3. Plug the SD card into a BBB and boot the BBB.

4. SSH to the BBB with `username: debian` and `password: temppwd`.

5. Install some useful packages.

        sudo apt-get update
        sudo apt-get install vim git lsb-release tcpdump pkg-config libnl-3-dev libnl-genl-3-dev libc-ares-dev libwrap0-dev cmake zlib1g-dev libssl-dev uuid-dev screen curl bluetooth bluez bluez-hcidump libbluetooth-dev libudev-dev libusb-1.0-0 libusb-1.0-0-dev python-dev python-pip ntp libavahi-compat-libdnssd-dev



7. Change the `debian` account password.

        passwd



9. Upgrade the kernel. First, run `uname -a` if the kernel is 4.4.0 or greater, skip this step.

        sudo /opt/scripts/tools/update_kernel.sh --beta --bone-channel

10. Now we have to setup the device tree overlay to let Linux know that the the radios exist.
The GAP overlay and others are setup in a repository also maintained by RCN.

        git clone https://github.com/lab11/bb.org-overlays
        cd bb.org-overlays
        ./dtc-overlay.sh
        ./install.sh

    That puts the compiled overlay in the correct place, now we need to tell the BBB to use it at boot.

        sudo vim /boot/uEnv.txt
        # Edit that line that looks like this to include the reference to GAP
        cape_enable=bone_capemgr.enable_partno=BB-GAP

11. Install the wpan-tools to configure all of the 15.4 devices.

        wget http://wpan.cakelab.org/releases/wpan-tools-0.5.tar.gz
        tar xf wpan-tools-0.5.tar.gz
        cd wpan-tools-0.5
        ./configure
        make
        sudo make install

12. Make a static directory for SD Cards to mount to


        Make folder for sdcard to mount to
        
                mkdir /media/sdcard

        Edit the fstab to add an additional line

                sudo vim /etc/fstab
                # Edit the file to add an additional line as follows
                /dev/sdcard     /media/sdcard   auto    auto,rw,async,user,nofail    0       0
        
        Add a udev rule to create a symlink for the sdcard

                sudo cp ~/gateway/udev/60-sdcard.rules /etc/udev/rules.d/

13. Set up Wifi (Tested with the Edimax EW-7811Un)
	
		Edit the network interfaces configuration file(wpa-enterprise, MWireless specific)

				sudo vim /etc/network/interfaces
				#edit the wifi section be as follows
				auto wlan0
				iface wlan0 inet dhcp
				wireless-mode Managed
				wpa-ssid your_ssid 
				wpa-ap-scan 1
				wpa-proto RSN WPA
				wpa-pairwise CCMP TKIP
				wpa-group CCMP TKIP
				wpa-key-mgmt WPA-EAP
				wpa-eap PEAP
				wpa-identity your_identity
				wpa-password your_password
				wpa-phase1 fast_provisioning=1
				wpa-pac-file /etc/network/mwireless.crt

		Download the cert file and place it in /etc/network/

				curl -O http://www.incommon.org/certificates/repository/sha384%20Intermediate%20cert.txt
				mv sha384%20Intermediate%20cert.txt /etc/network/mwireless.crt

		Edit the udev rules to make sure that the network interface is always wlan0

				sudo vim /etc/udev/rules.d/70-persistent-net.rules
				#delete all lines that are assigning names wlan*
				#insert the following line in their place
				#this might be unstable with multiple devices plugged in
				SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{dev_id}=="0x0", ATTR{type}=="1", KERNEL=="wlan*", NAME="wlan0"

Remaining Setup
---------------

See the
[shared instructions](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/gateway-setup-scratch-common.md).


