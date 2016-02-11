Gateway Software Setup
======================

These instructions should be shared between gateway platforms running Debian.


Software Setup
--------------


1. Change hostname. Edit `/etc/hostname` and make it:

        swarmgateway
        
2. Add swarmgateway to hosts:

        sudo vim /etc/hosts
          127.0.1.1    swarmgateway

1. Install MQTT:

        wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key
        sudo apt-key add mosquitto-repo.gpg.key
        cd /etc/apt/sources.list.d/
        sudo wget http://repo.mosquitto.org/debian/mosquitto-jessie.list
        sudo apt-get update
        sudo apt-get install mosquitto

11. Setup config for mosquitto:

        sudo sh -c 'echo "log_dest none\nlog_type error\nconnection_messages false" > /etc/mosquitto/conf.d/swarmgateway.conf'

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
            Highlight "en_US.UTF-8 UTF-8" from list, press space and then enter
            Select "en_US.UTF-8" and hit enter

18. Add user to dialout (for serial permissions)

        sudo usermod -a -G dialout debian

18. Make sure we can do IPv6 mDNS lookups.

        sudo sed -i "s/mdns4_minimal/mdns_minimal/g" /etc/nsswitch.conf

19. Make sure avahi mDNS lookup works.

    Edison:
    
        sudo sed -i "s/allow-interfaces=eth0/#allow-interfaces=eth0/g" /etc/avahi/avahi-daemon.conf

19. Fix the SSH banner. Change the contents of `/etc/issue.net` to:

        
          ****************
          * SwarmGateway *
          ****************
        
        Created at the University of Michigan
        
    And on the Edison:
    
        sudo sed -i "s\#Banner /etc/issue.net\Banner /etc/issue.net\g" /etc/ssh/sshd_config

19. Clean up home directory

        rm -rf /home/debian/*

20. Clone gateway github repository

        git clone https://github.com/lab11/gateway.git
        git clone https://github.com/terraswarm/urban-heartbeat-kit.git

21. Install gateway dependencies.

        pushd gateway/software/adv-gateway-ip && npm i && popd
        pushd gateway/software/ble-address-sniffer-mqtt && npm i && popd
        pushd gateway/software/ble-gateway-mqtt && npm i && popd
        pushd gateway/software/gateway-mqtt-emoncms && npm i && popd
        pushd gateway/software/gateway-mqtt-topics && npm i && popd
        pushd gateway/software/gateway-publish && npm i && popd
        pushd gateway/software/gateway-server && npm i && popd
        pushd urban-heartbeat-kit/examples && npm i && popd
        pushd urban-heartbeat-kit/discover/gateway-ssdp && npm i && popd

22. Setup ble-gateway to start on boot.

        sudo cp gateway/systemd/* /etc/systemd/system/
        sudo cp urban-heartbeat-kit/systemd/* /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl disable lighttpd
        sudo systemctl enable ble-address-sniffer-mqtt
        sudo systemctl enable ble-gateway-mqtt
        sudo systemctl enable adv-gateway-ip
        sudo systemctl enable adv-gateway-ssdp
        sudo systemctl enable gateway-*

23. For the Edison, we also want to capture 15.4 packets
from the CC2538.

    Edison:

        git clone https://github.com/lab11/IntelEdisonGateway.git
        sudo cp IntelEdisonGateway/Triumvi/systemd/* /etc/systemd/system
        sudo systemctl enable cc2538-gateway-mqtt

23. Configure LEDs at boot:

    BBB:

        sudo sed -i "14i # Turn off the annoying blinking LEDs.\n/home/debian/urban-heartbeat-kit/scripts/bbb_leds_configure.sh\n" /etc/rc.local



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




