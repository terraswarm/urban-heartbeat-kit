'''
This script reads advertisements collected by the BleGateway and
broadcasted as UDP packets on the local LAN. It then publishes them
to a GDP log.
'''

import json
import socket
import uuid

import gdp

LOG_NAME_BASE = 'org.terraswarm.gatewayv1'

print('Get MAC address')
mac = hex(uuid.getnode())[2:14]
log_name = '{}.{}'.format(LOG_NAME_BASE, mac)

print('Initialize GDP')
gdp.gdp_init()

print('Connect to a GDP log')
gcl_name = gdp.GDP_NAME(log_name)
log = gdp.GDP_GCL(gcl_name, gdp.GDP_MODE_RA)

print('Create socket for receiving BLE data')
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# Make sure multiple clients can use the broadcast
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(('255.255.255.255', 3002))

print('Loop to receive packets')
while True:
	message = s.recvfrom(1024)
	data = message[0]
	adv_obj = json.loads(data)

	print('Appending {} to the log.'.format(adv_obj))
	log.append({'data': data})
