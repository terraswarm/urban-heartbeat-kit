BeagleBone Black Setup for Gateway
==================================

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
        sudo apt-get install vim git lsb-release tcpdump pkg-config libnl-3-dev libnl-genl-3-dev libc-ares-dev libwrap0-dev cmake zlib1g-dev libssl-dev uuid-dev screen curl bluetooth bluez bluez-hcidump libbluetooth-dev libudev-dev libusb-1.0-0 libusb-1.0-0-dev python-dev python-pip ntp

6. Disable root SSH.

        sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config

7. Change the `debian` account password.

        passwd

7. Add `sbin` to the path. Not sure why this isn't the default.

        sudo sed -i 's\/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games\/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games:/sbin\g' /etc/profile

8. Upgrade the kernel

        sudo /opt/scripts/tools/update_kernel.sh --beta --bone-channel

9. Now we have to setup the device tree overlay to let Linux know that the the radios exist.
The GAP overlay and others are setup in a repository also maintained by RCN.

        git clone https://github.com/lab11/bb.org-overlays
        cd bb.org-overlays
        ./dtc-overlay.sh
        ./install.sh

    That puts the compiled overlay in the correct place, now we need to tell the BBB to use it at boot.

        sudo vim /boot/uEnv.txt
        # Edit that line that looks like this to include the reference to GAP
        cape_enable=bone_capemgr.enable_partno=BB-GAP

10. Install the wpan-tools to configure all of the 15.4 devices.

        wget http://wpan.cakelab.org/releases/wpan-tools-0.5.tar.gz
        tar xf wpan-tools-0.5.tar.gz
        cd wpan-tools-0.5
        ./configure
        make
        sudo make install

11. Install libwebsockets for MQTT.

        wget http://git.warmcat.com/cgi-bin/cgit/libwebsockets/snapshot/libwebsockets-1.5-chrome47-firefox41.tar.gz
        tar xf libwebsockets-1.5-chrome47-firefox41.tar.gz
        cd libwebsockets-1.5-chrome47-firefox41
        mkdir build
        cd build
        cmake ..
        make
        sudo make install

12. Install MQTT.

        wget http://mosquitto.org/files/source/mosquitto-1.4.5.tar.gz
        tar xf mosquitto-1.4.5.tar.gz
        cd mosquitto-1.4.5
        sed -i s/WITH_WEBSOCKETS:=no/WITH_WEBSOCKETS:=yes/g config.mk
        make
        sudo make install
        sudo ldconfig
        sudo cp service/upstart/mosquitto.conf /etc/init/
        sudo cp /etc/mosquitto/mosquitto.conf.example /etc/mosquitto/mosquitto.conf
        sudo sed -i 's/#listener/listener 9001\nprotocol websockets/g' /etc/mosquitto/mosquitto.conf
        sudo sed -i 's/#port 1883/listener 1883/g' /etc/mosquitto/mosquitto.conf

12. Setup MQTT. Create `/etc/systemd/system/mosquitto.service` with the following contents:

        [Unit]
        Description=Mosquitto MQTT Broker daemon
        ConditionPathExists=/etc/mosquitto/mosquitto.conf
        Requires=network.target

        [Service]
        Type=simple
        User=mosquitto
        ExecStartPre=/bin/rm -f /var/run/mosquitto.pid
        ExecStart=/usr/local/sbin/mosquitto -v -c /etc/mosquitto/mosquitto.conf
        ExecReload=/bin/kill -HUP $MAINPID
        PIDFile=/var/run/mosquitto.pid
        Restart=on-failure

        [Install]
        WantedBy=multi-user.target
        
    Then:
    
        sudo useradd mosquitto
        sudo systemctl daemon-reload
        sudo systemctl enable mosquitto

13. Install Python 3.5.

        wget https://www.python.org/ftp/python/3.5.1/Python-3.5.1.tgz
        tar xf Python-3.5.1.tgz
        cd Python-3.5.1
        ./configure
        make sudo make install

14. Install some Python dependencies.

        sudo pip install paho-mqtt
        sudo pip install websocket
        sudo pip3.5 install hbmqtt
        sudo pip3.5 install websockets

13. Install Node.js.

        curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
        sudo apt-get install -y nodejs

14. Enable Node privileged access to BLE so it doesn't need sudo.

        sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

17. Get rid of locale warnings

        sudo apt-get install locales
        sudo locale-gen en_us.UTF-8
        sudo dpkg-reconfigure locales
            Select "en_US.UTF-8 UTF-8" from list and hit enter
            Select "en_US.UTF-8" and hit enter

18. Add user to dialout (for serial permissions)

        usermod -a -G dialout debian

19. Clean up home directory

        rm -rf /home/debian/*

20. Clone gateway github repository

        git clone https://github.com/lab11/gateway.git
        git clone https://github.com/terraswarm/urban-heartbeat-kit.git

21. Install gateway dependencies.

        pushd gateway/software/ble-gateway-publish && npm i && popd
        pushd gateway/software/ble-gateway-server && npm i && popd
        pushd gateway/software/adv-gateway-ip && npm i && popd
        pushd urban-heartbeat-kit/examples && npm i && popd

22. Setup ble-gateway to start on boot.

        sudo cp gateway/systemd/* /etc/systemd/system/
        sudo cp urban-heartbeat-kit/systemd/* /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl disable lighttpd
        sudo systemctl enable ble-gateway-publish
        sudo systemctl enable ble-gateway-server
        sudo systemctl enable adv-gateway-ip
        sudo systemctl enable gateway-gdp-publish


Optional: Install Node-RED
--------------------------

2. Install Node-RED.

        sudo npm install -g --unsafe-perm  node-red
    
    At this point, Node-RED is installed and ready to run. However,
    we want to run Node-RED as a system service so that it starts
    on boot and restarts automatically after encountering issues.

5. Install BBB-specific Node-RED libraries. (GPIO pin access, etc.)

        mkdir -p ~/.node-red
        cd ~/.node-red
        npm install node-red-node-beaglebone

7. Configure Node-RED to run as a service. Create the file 
`/etc/systemd/system/node-red.service` with the following contents:

        [Unit]
        Description=Node-RED

        [Service]
        ExecStart=/usr/bin/node-red-pi --max-old-space-size=128 --userDir /home/debian/.node-red
        Restart=always
        StandardOutput=syslog
        StandardError=syslog
        SyslogIdentifier=node-red
        User=debian

        [Install]
        WantedBy=multi-user.target

    Then:

        sudo systemctl daemon-reload
        sudo systemctl enable node-red

6. Start the Node-RED service.

        sudo systemctl start node-red

    Test that Node-RED is running by navigating to `http://<Beaglebone IP>:1880`. 
    
9. You can password-protect your Node-RED instance, add HTTPS support,
and make other configuration changes by modifying
`/home/debian/.node-red/settings.js` and restarting the service with
`sudo systemctl restart node-red`. 


Audio
-----

1. Install the microphone tools.

        sudo apt-get install alsa-utils


GDP
---

1. Get the source repo.

        git clone https://repo.eecs.berkeley.edu/git/projects/swarmlab/gdp.git
    
2. Prep the system.

        cd gdp
        ./adm/gdp-setup.sh

3. Build the client sources.

        ./deb-pkg/package-client.sh 0.3-1
        ./lang/python/deb-pkg/package.sh 0.3-1

4. Install the client.

        sudo dpkg -i gdp-client_0.3-1_armhf.deb
        sudo dpkg -i python-gdp_0.3-1_all.deb
        sudo apt-get -f install


