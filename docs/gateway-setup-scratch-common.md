<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Gateway Software Setup](#gateway-software-setup)
  - [Software Setup](#software-setup)
  - [Version Bump Changes](#version-bump-changes)
  - [Optional Features](#optional-features)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Gateway Software Setup
======================

These instructions should be shared between gateway platforms running Debian.



Software Setup
--------------

1. Disable root SSH.

        sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
        
8. Add `sbin` to the path. Not sure why this isn't the default.

        sudo sed -i 's\/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games\/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games:/sbin\g' /etc/profile

1. Change hostname.

        sudo sh -c 'echo "swarmgateway" > /etc/hostname'
        
2. Add swarmgateway to hosts:

        sudo sh -c 'echo "127.0.1.1    swarmgateway" >> /etc/hosts'

3. Replace the `rc.local` file:

    Edison:
  
        sudo cp gateway/startup/edison/rc.local.edison /etc/rc.local

3. Remove some crap from Intel or Jubilinux that we don't want or have
replaced:

    Edison:
  
        sudo rm -r /usr/local/sbin
        sudo rm -r /opt/edison
        sudo rm /etc/init.d/galileod.sh
        sudo sed -i "s/uvcvideo/#uvcvideo/g" /etc/modules-load.d/modules.conf

3. If using a QMI supported cell radio (like LE910):

    Edison:
    
        # Need a newer version than what is in the jessie repository
        # DO NOT USE 1.18. It did not work. 1.16 is known to work.
        wget http://www.freedesktop.org/software/libqmi/libqmi-1.16.0.tar.xz
        tar xf libqmi-1.16.0.tar.xz
        cd libqmi-1.16.0
        ./configure --enable-mbim-qmux
        make
        sudo make install
        
        # Make it so that we can find the shared library:
        sudo sh -c 'echo "/usr/local/lib" > /etc/ld.so.conf.d/libqmi-glib.conf'
        sudo ldconfig
    
    - Then create the config file `/etc/qmi-network.conf`:
    
            APN=
            
        The value will be filled in at boot.
    
    - Then setup NetworkManager to manage the connection:
    
            sudo nmcli con edit type gsm con-name LE910
              set connection.autoconnect false
              set gsm.apn unknown
              save
              q
              
        Again the APN value will be filled in by set_apn.sh script.

3. Make sure we get some valid nameservers. The LE910 setup stuff
seems to overwrite nameservers with some useless ones.

    Edison:
    
        sudo apt install resolvconf
        sudo sh -c 'echo "nameserver 8.8.8.8\nnameserver 8.8.4.4" > /etc/resolvconf/resolv.conf.d/base'
        sudo resolvconf -u

1. Install MQTT:

        wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key
        sudo apt-key add mosquitto-repo.gpg.key
        sudo wget -P /etc/apt/sources.list.d/ http://repo.mosquitto.org/debian/mosquitto-jessie.list
        sudo apt update
        sudo apt install mosquitto

    **Important:** on BeagleBone gateways, a different version of libwebsockets must be installed

        sudo apt-get install libwebsockets3=1.2.2-1

11. Setup config for mosquitto:

        sudo sh -c 'echo "log_dest none\nlog_type error\nconnection_messages false\n\nlistener 9001\nprotocol websockets\n\nlistener 1883\nprotocol mqtt" > /etc/mosquitto/conf.d/swarmgateway.conf'

13. Setup a mDNS entry for MQTT so it can be discovered. Create
`/etc/avahi/services/mqtt.service` and add:

        <?xml version="1.0" standalone='no'?>
        <!DOCTYPE service-group SYSTEM "avahi-service.dtd">
        <service-group>
          <name>MQTT Broker</name>
          <service>
            <type>_mqtt._tcp</type>
            <port>1883</port>
          </service>
        </service-group>

13. (Optional) Install Python 3.5.

        wget https://www.python.org/ftp/python/3.5.1/Python-3.5.1.tgz
        tar xf Python-3.5.1.tgz
        cd Python-3.5.1
        ./configure
        make
        sudo make install

14. Install some Python dependencies.

        sudo apt-get install python-pip python3-pip
        sudo pip install paho-mqtt
        sudo pip install websocket
        sudo pip3.5 install hbmqtt
        sudo pip3.5 install websockets

13. Install Node.js.

        curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
        sudo apt install -y nodejs

14. Enable Node privileged access to BLE so it doesn't need sudo.

        sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

17. (Optional) Get rid of locale warnings

        sudo apt-get install locales
        sudo locale-gen en_us.UTF-8
        sudo dpkg-reconfigure locales
            Highlight "en_US.UTF-8 UTF-8" from list, press space and then enter
            Select "en_US.UTF-8" and hit enter

18. Add user to dialout (for serial permissions)

        sudo usermod -a -G dialout debian

18. Make sure we can do IPv6 mDNS lookups.

        sudo sed -i "s/mdns4_minimal/mdns_minimal/g" /etc/nsswitch.conf

19. Make sure avahi mDNS lookup works.

    Edison:
    
        sudo sed -i "s/allow-interfaces=eth0/#allow-interfaces=eth0/g" /etc/avahi/avahi-daemon.conf

19. Fix the SSH banner. Change the contents of `/etc/issue.net` to (fill in the `x`):

        
          *********************
          * SwarmGateway v1.x *
          *********************
        
        Created at the University of Michigan
        
    And on the Edison:
    
        sudo sed -i "s\#Banner /etc/issue.net\Banner /etc/issue.net\g" /etc/ssh/sshd_config

19. Fix the `PS1` to display some useful information (version, IP, MAC) about the current gateway

        v1.x XXX.XXX.XXX.XXX :XX ~$

    Edit `~/.bashrc`:

        Add Line 41:

        39 case "$TERM" in
        40     xterm-color) color_prompt=yes;;
        41     xterm-256color) color_prompt=yes;;
        42 esac

        Replaces lines 61 and 63, fixing the 'v1.x' with current version in each line:

        60 if [ "$color_prompt" = yes ]; then
        61     PS1="\[$(tput setaf 4)\]v1.x \[$(tput setaf 3)\]$(ip route get 1 | cut -d' ' -f8) :$(cat /sys/class/net/eth0/address | cut -d':' -f6)\[$(tput sgr0)\] \w$ "
        62 else
        63     PS1="v1.x $(ip route get 1 | cut -d' ' -f8) :$(cat /sys/class/net/eth0/address | cut -d':' -f6) \w$ "
        64 fi
                       |line 63 x         |line 61 x

19. Clean up home directory

        rm -rf /home/debian/*

20. Clone gateway github repository

        git clone https://github.com/lab11/gateway.git
        git clone https://github.com/lab11/gateway-tools.git

21. Install gateway dependencies.

        cd gateway/software
        mkdir node_modules
        for i in * ; do if [[ -d $i ]] && [[ $i != "node_modules" ]]; then cd $i; ln -s ../node_modules .; npm i; cd ../; fi; done

22. Setup ble-gateway to start on boot.

        sudo cp gateway/systemd/* /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl disable lighttpd
        sudo systemctl enable adv-gateway-ip
        sudo systemctl enable app-runner
        sudo systemctl enable ble-gateway-mqtt
        sudo systemctl enable gateway-server
        sudo systemctl enable gateway-ssdp

23. Configure `app-runner`.

        mkdir ~/gateway-tools/apps-enabled
        sudo mkdir /etc/swarm-gateway
        sudo sh -c 'echo "app_dir = /home/debian/gateway-tools/apps-enabled" > /etc/swarm-gateway/app-runner.conf'

23. Configure LEDs at boot:

    BBB:

        sudo sed -i "14i # Turn off the annoying blinking LEDs.\n/home/debian/urban-heartbeat-kit/scripts/bbb_leds_configure.sh\n" /etc/rc.local

24. If we want an SD card, make sure it is mounted at boot.

        sudo mkdir /media/sdcard
        sudo chown debian:debian /media/sdcard

    BBB:
See Beaglebone Black specific instructions [here](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/BBB-gateway-setup-from-scratch.md)

    Edison:
    
        sudo sh -c "echo '/dev/mmcblk1p1      /media/sdcard auto  defaults,nofail     1   1\n' >> /etc/fstab"


25. Set the base `/etc/network/interfaces` file. Should look something like:

        auto lo
        iface lo inet loopback

        auto eth0
        iface eth0 inet dhcp
          hwaddress ether c0:98:e5:c0:00:16

        auto wlan0
        iface wlan0 inet dhcp


Version Bump Changes
--------------------

1. Fix the SSH banner. Line 3 of `/etc/issue.net`
1. Fix the `PS1` prompt. Lines 61 and 63 of `~/.bashrc`

Optional Features
-----------------

See the [optional instructions](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/gateway-setup-optional-common.md).

