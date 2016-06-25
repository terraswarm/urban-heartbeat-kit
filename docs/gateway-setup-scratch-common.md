<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Gateway Software Setup](#gateway-software-setup)
  - [Optional: Enterprise Wireless Setup with NetworkManager](#enterprise-networkmanager)
  - [Software Setup](#software-setup)
  - [Optional: Install Node-RED](#optional-install-node-red)
  - [Audio](#audio)
  - [GDP](#gdp)

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

1. Install MQTT:

        wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key
        sudo apt-key add mosquitto-repo.gpg.key
        sudo wget -P /etc/apt/sources.list.d/ http://repo.mosquitto.org/debian/mosquitto-jessie.list
        sudo apt update
        sudo apt install mosquitto

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

13. (Optional) Install Python 3.5.

        wget https://www.python.org/ftp/python/3.5.1/Python-3.5.1.tgz
        tar xf Python-3.5.1.tgz
        cd Python-3.5.1
        ./configure
        make sudo make install

14. (Optional) Install some Python dependencies.

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

19. Clean up home directory

        rm -rf /home/debian/*

20. Clone gateway github repository

        git clone https://github.com/lab11/gateway.git
        git clone https://github.com/lab11/gateway-tools.git
        git clone https://github.com/terraswarm/urban-heartbeat-kit.git

21. Install gateway dependencies.

        cd gateway/software
        mkdir node_modules
        for i in * ; do if [[ -d $i ]] && [[ $i != "node_modules" ]]; then cd $i; ln -s ../node_modules .; npm i; cd ../; fi; done

22. Setup ble-gateway to start on boot.

        sudo cp gateway/systemd/* /etc/systemd/system/
        sudo cp urban-heartbeat-kit/systemd/* /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl disable lighttpd
        sudo systemctl enable adv-gateway-ip
        sudo systemctl enable app-runner
        sudo systemctl enable ble-address-sniffer-mqtt
        sudo systemctl enable ble-gateway-mqtt
        sudo systemctl enable gateway-mqtt-topics
        sudo systemctl enable gateway-server
        sudo systemctl enable gateway-ssdp

23. Configure `app-runner`.

        mkdir ~/gateway-tools/apps-enabled
        sudo mkdir /etc/swarm-gateway
        sudo sh -c 'echo "app_dir = /home/debian/gateway-tools/apps-enabled" > /etc/swarm-gateway/app-runner.conf'

23. For the Edison, we also want to capture 15.4 packets
from the CC2538.

    Edison:

        git clone https://github.com/lab11/IntelEdisonGateway.git
        sudo cp IntelEdisonGateway/Triumvi/systemd/* /etc/systemd/system
        sudo systemctl enable cc2538-gateway-mqtt

23. Configure LEDs at boot:

    BBB:

        sudo sed -i "14i # Turn off the annoying blinking LEDs.\n/home/debian/urban-heartbeat-kit/scripts/bbb_leds_configure.sh\n" /etc/rc.local

24. If we want an SD card, make sure it is mounted at boot.

        sudo mkdir /media/sdcard
        sudo chown debian:debian /media/sdcard

    BBB:
See Beaglebone Black specific instructions [here](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/BBB-gateway-setup-from-scratch.md)

    Edison:
    
        sudo sh -c "echo '/dev/mmcblk1p1      /media/sdcard auto  defaults     1   1\n' >> /etc/fstab"


25. Set the base `/etc/network/interfaces` file. Should look something like:

        auto lo
        iface lo inet loopback

        auto eth0
        iface eth0 inet dhcp
          hwaddress ether c0:98:e5:c0:00:16

        auto wlan0
        iface wlan0 inet dhcp


Install Monitoring
------------------

Use sensu for monitoring gateways and devices.

1. Install sensu.

        wget https://sensuapp.org/install.sh
        sudo bash install.sh
        sudo apt update
        sudo apt install sensu
        
3. Setup systemd for sensu

        sudo rm /etc/init.d/sensu-client
        cd /etc/systemd/system
        sudo wget https://raw.githubusercontent.com/sensu/sensu-build/master/sensu_configs/systemd/sensu-client.service
        sudo systemctl enable sensu-client.service

3. Get the gateway scripts dependencies

        cd gateway-tools/gateway
        npm install

4. Then need `/etc/sensu/conf.d/client.json`.

     ```
    {
      "rabbitmq": {
        "host": "<host>",
        "port": 5672,
        "vhost": "/sensu",
        "user": "<sensu>",
        "password": "<password>"
      },
      "client": {
        "name": "<gateway-macaddr>",
        "address": "192.168.1.2",
        "subscriptions": [
          "swarm-gateway"
        ]
      }
    }
    ```


Optional: MWireless Setup with NetworkManager
---------------------------------------------

This configuration works for MWireless (University of Michigan), and should work
for others with minor modifications.

If switching from using ifupdown (using `/etc/network/interfaces`), make sure to comment
out or delete your wireless interface from `/etc/network/interfaces` before
configuring NetworkManager.

1. Install NetworkManager.

        sudo apt install network-manager

1. For MWireless:

        curl -O http://www.incommon.org/certificates/repository/sha384%20Intermediate%20cert.txt
        sudo mv sha384%20Intermediate%20cert.txt /etc/NetworkManager/mwireless.crt

2. Use nmcli to generate a config file for your network:

        sudo nmcli con edit type wifi con-name MWireless
        set wifi.ssid MWireless
        save
        q

    Where `ssid` is the ssid of yo. Making this the same as the `ssid` is a good
    choice.ur network, and `connection-id` is an arbitrary
    name for the connection

3. Edit the config file `/etc/NetworkManager/system-connections/<connection-id>`
   to include the following sections:

        [wifi-security]
        auth-alg=open
        key-mgmt=wpa-eap
        
        [802-1x]
        eap=peap;
        identity=<username>
        password=<password>
        phase2-auth=mschapv2
        phase2-ca-cert=/etc/NetworkManager/<certificate-name>
        
    Make sure to fill in `username`, `password`, `certificate-name`.
    
3. Reload config and activate connection

        sudo nmcli con reload
        # might be a good idea to reboot
        sudo nmcli con up <connection-id>




Optional: Set up dynamic DNS
----------------------------

You will need to set up dynamic DNS support on a DNS server that you
have access to to support ddns. **Be careful with trailing `.`s throughout**

1. Generate keys

        $ dnssec-keygen -a HMAC-SHA512 -b 512 -n HOST swarmgateway.device.lab11.eecs.umich.edu.
        $ ls
        Kswarmgateway.device.lab11.eecs.umich.edu.+165+08430.key 
        Kswarmgateway.device.lab11.eecs.umich.edu.+165+08430.private 

2. Configure DNS server

  These configurations are for BIND9.

  Set up a key file (with restrctive permissions) for bind to read from:

      $ cat /etc/bind/ddns-keys-lab11.conf 
      key "swarmgateway.device.lab11.eecs.umich.edu." {
      algorithm HMAC-SHA512;
      secret "<-- PASTE THE SECRET FROM YOUR .key FILE HERE -->";
      };

  Updated your `named` file to include a new zone:

      include "/etc/bind/ddns-keys-lab11.conf";
      zone "device.lab11.eecs.umich.edu" IN {
              type master;
              file "/var/lib/bind/db.device.lab11.eecs.umich.edu";
              update-policy {
                      grant swarmgateway.device.lab11.eecs.umich.edu. wildcard *.device.lab11.eecs.umich.edu. A AAAA TXT;
              };
              notify no;
      };

  And create a database file:

      $ cat /var/lib/bind/db.device.lab11.eecs.umich.edu
      $ORIGIN .
      $TTL 30	; 30 seconds
      device.lab11.eecs.umich.edu IN SOA eecsdns.eecs.umich.edu. helpeecs.umich.edu. (
      				2016062002 ; serial
      				120        ; refresh (2 minutes)
      				120        ; retry (2 minutes)
      				2419200    ; expire (4 weeks)
      				120        ; minimum (2 minutes)
      				)
      			NS	dns.eecs.umich.edu.
      			NS	csedns.eecs.umich.edu.
      			NS	eecsdns.eecs.umich.edu.

  Some gotcha's:
     * Whitespace is very significant throughout configurations. Vim did a good job of highlighting errors for me.
     * Use the configuration check utilities from bind to verify your work
        - `named-checkconf`
        - `named-checkzone device.lab11.eecs.umich.edu /var/lib/bind/db.device.lab11.eecs.umich.edu`
     * The bind server must be able to write to the database file AND be able to create new files in the same directory as the database file. See the next point.
     * AppArmor / SELinux will stop things from working out-of-the-box on most installs, see http://askubuntu.com/questions/172030/how-to-allow-bind-in-app-armor
        - Note you may want to change that AppArmor example to allow for any file in the directory (`/*`) or subdirectories (`/**`)

3. Set up the gateways

  On the gateway, you'll need to copy the keys (**both** the `.key` and `.private`) to `/etc/swarm-gateway/ddns/`.

  Install `ddns` updates as a cron job (`cp gateway/cron/ddns /etc/cron.hourly`)
    - FIXME: Some configuration options are hardcoded into this script currently, you'll need to update them

  You can test that everythings working with `sudo run-parts /etc/cron.hourly`


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




