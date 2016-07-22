Gateway Software Optional Setup
===============================

These instructions detail installation of optional modules for the swarm-gateway.
They should be compatible with all gateway platforms running Debian.


Install SSH Keys
----------------

Each user that will regularly log in to the device should run

        ssh-copy-id debian@<gateway IP address>


Push to Emoncms
---------------

[Emoncms](https://emoncms.org/) is a back end for energy data.

1. Copy [emoncms.conf](https://github.com/lab11/gateway/tree/master/software/gateway-mqtt-emoncms) file to `/etc/swarm-gateway/`

    For umich users, the config can be copied from shed

        sudo scp <user@computer>:~/shed/projects/gateway/emoncms.conf /etc/swarm-gateway/

2. Enable service

        sudo cp ~/gateway/systemd/gateway-mqtt-emoncms.service /etc/systemd/system/
        sudo systemctl enable gateway-mqtt-emoncms
        sudo systemctl start gateway-mqtt-emoncms


Push to InfluxDB
----------------

[InfluxDB](https://influxdata.com/) is a database for time-series data.

1. Copy [influxdb.conf](https://github.com/lab11/gateway/blob/master/software/gateway-mqtt-influxdb/README.md) file to `/etc/swarm-gateway/`

    For umich users, the config can be copied from shed

        sudo scp <user@computer>:~/shed/projects/gateway/influxdb.conf /etc/swarm-gateway/

2. Enable service

        sudo cp ~/gateway/systemd/gateway-mqtt-influxdb.service /etc/systemd/system/
        sudo systemctl enable gateway-mqtt-influxdb
        sudo systemctl start gateway-mqtt-influxdb


Push to SD Card
---------------

Assumes proper instructions have already been followed to automatically mount an SD card.

1. Copy [log.conf](https://github.com/lab11/gateway/blob/master/software/gateway-mqtt-log/README.md) file to `/etc/swarm-gateway/`

    For umich users, the config can be copied from shed

        sudo scp <user@computer>:~/shed/projects/gateway/log.conf /etc/swarm-gateway/

2. Enable service

        sudo cp ~/gateway/systemd/gateway-mqtt-log.service /etc/systemd/system/
        sudo systemctl enable gateway-mqtt-log
        sudo systemctl start gateway-mqtt-log


Install Gateway Monitoring
--------------------------

Use [sensu](https://sensuapp.org/) for monitoring gateways and devices.

1. Install sensu.

        wget https://sensuapp.org/install.sh
        sudo bash install.sh

    Yes, install the Sensu Core software repository

    No, do not install the Sensu Enterprise software repository

        sudo apt update
        sudo apt install sensu
        rm install.sh
        
3. Setup systemd for sensu

        sudo rm /etc/init.d/sensu-client
        cd /etc/systemd/system
        sudo wget https://raw.githubusercontent.com/sensu/sensu-build/master/sensu_configs/systemd/sensu-client.service
        sudo systemctl enable sensu-client.service

3. Get the gateway scripts dependencies

        cd gateway-tools/gateway
        npm install

4. Then create `/etc/sensu/conf.d/client.json`. Make sure the proper client name and address for the specific gateway.

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

Install Device Monitoring
-------------------------

Use [sensu](https://sensuapp.org/) for monitoring gateways and devices.


1. Copy [sensu.conf](https://github.com/lab11/gateway/blob/master/software/gateway-mqtt-sensu/README.md) file to `/etc/swarm-gateway/`

    For umich users, the config can be copied from shed

        sudo scp <user@computer>:~/shed/projects/gateway/sensu.conf /etc/swarm-gateway/

2. Enable service

        sudo cp ~/gateway/systemd/gateway-mqtt-sensu.service /etc/systemd/system/
        sudo systemctl enable gateway-mqtt-sensu
        sudo systemctl start gateway-mqtt-sensu

MWireless Setup with NetworkManager
-----------------------------------

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

3. Edit the config file `/etc/NetworkManager/system-connections/MWireless`
   to include the following sections:

        [wifi-security]
        auth-alg=open
        key-mgmt=wpa-eap
        
        [802-1x]
        eap=peap;
        identity=<username>
        password=<password>
        phase2-auth=mschapv2
        phase2-ca-cert=/etc/NetworkManager/mwireless.crt
        
    Make sure to fill in `username` and `password`.
    
3. Reload config and activate connection

        sudo nmcli con reload
        sudo nmcli con up MWireless


Set up dynamic DNS
------------------

1. Set up the gateways

  On the gateway, you'll need to copy the keys (**both** the `.key` and `.private`) to `/etc/swarm-gateway/ddns/`.

  Install dependencies
  
      sudo pip3 install dnspython3
      sudo apt install dnsutils

  Install `ddns` updates as a cron job (`cp gateway/cron/ddns /etc/cron.hourly`)
    - FIXME: Some configuration options are hardcoded into this script currently, you'll need to update them

  You can test that everythings working with `sudo run-parts /etc/cron.hourly`


Install Node-RED
----------------

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


Collect Monjolo data (Beaglebone Black with GAP only)
-----------------------------------------------------

Collect data from [Monjolo](https://github.com/lab11/monjolo) sensors over 802.15.4.

1. Enable service

        sudo cp ~/gateway/systemd/ieee802154-monjolo-gateway.service /etc/systemd/system/
        sudo systemctl enable ieee802154-monjolo-gateway
        sudo systemctl start ieee802154-monjolo-gateway


Collect Triumvi Data (Intel Edison only)
----------------------------------------

1. Install `mraa`:

        git clone https://github.com/intel-iot-devkit/mraa.git
        mkdir mraa/build && cd $_
        cmake .. -DBUILDSWIGNODE=OFF
        make
        sudo make install

3. Add library file to `/etc/profile`

        sudo vim /etc/profile

    Add the lines

        LD_LIBRARY_PATH=/usr/local/lib
        export LD_LIBRARY_PATH

    Save and exit. Then run

        sudo ldconfig


2. Install paho-mqtt python package (may already be done)

        sudo apt install python-pip
        sudo pip install paho-mqtt

3. Enable cc2538-triumvi-gateway

        sudo cp gateway/systemd/cc2538-triumvi-gateway.service /etc/systemd/system/
        sudo systemctl enable cc2538-triumvi-gateway


Push PowerBlade data to SQL
---------------------------

[SQL](https://en.wikipedia.org/wiki/SQL) is a classic relational database. Amazon web services can host it.

1. Check out the PowerBlade repo for the service

        git clone https://github.com/lab11/powerblade.git

2. Install node packages

        cd ~/powerblade/software/gateway/gateway-mqtt-sql/
        ln -s ~/gateway/software/node_modules .
        npm install mysql

3. Copy the `powerblade-sql.conf` and `powerblade-aws.conf` files to `/etc/swarm-gateway/`

    For umich users, the config can be copied from shed

        sudo scp <user@computer>:~/shed/projects/powerblade/powerblade_deployment/powerblade-*.conf /etc/swarm-gateway/

4. Enable service

        sudo cp ~/powerblade/software/gateway/gateway-mqtt-sql.service /etc/systemd/system/
        sudo systemctl enable gateway-mqtt-sql
        sudo systemctl start gateway-mqtt-sql


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


