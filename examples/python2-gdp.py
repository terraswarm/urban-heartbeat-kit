'''
This script reads advertisements collected by the BleGateway and
broadcasted as UDP packets on the local LAN. It then publishes them
to a GDP log.
'''

import json
import socket

import gdp

print('Initialize GDP')
gdp.gdp_init()

print('Connect to a GDP log')
gcl_name = gdp.GDP_NAME('edu.berkeley.eecs.???')
log = gdp.GDP_GCL(gcl_name, gdp.GDP_MODE_RA)

print('Create socket for receiving BLE data')
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.bind(('255.255.255.255', 3002))

print('Loop to receive packets')
while True:
	message = s.recvfrom(1024)
	adv_obj = json.loads(message[0])

	print('Appending {} to the log.'.format(adv_obj))
	log.append(adv_obj)
