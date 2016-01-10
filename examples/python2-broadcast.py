import json
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# Make sure multiple clients can use the broadcast
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(('255.255.255.255', 3002))
while True:
	message = s.recvfrom(1024)
	adv_obj = json.loads(message[0])
	print(adv_obj)
