#!/usr/bin/env node

var url = require('url');

var colors = require('colors');
var debug = require('debug')('find-my-gateway');
var ebs = require('eddystone-beacon-scanner/lib/eddystone-beacon-scanner');
var mdns = require('mdns');
var ssdp = require('node-ssdp');
var pad = require('pad');

/*******************************************************************************
 * Helper functions
 ******************************************************************************/

function display_header () {
	var header = pad('Device', 20).bold +
	             pad('IPv4 Address', 17).bold +
	             pad('IPv6 Address', 41).bold +
	             pad('MAC Address', 19).bold +
	             pad('Discovered Using', 18).bold;
	console.log(header);
}

function display_beaglebone (ipv4_addr, ipv6_addr, mac_address, service) {
	var out = pad('BeagleBone', 20) +
	          pad(ipv4_addr, 17) +
	          pad(ipv6_addr, 41) +
	          pad(mac_address, 19) +
	          pad(service, 21);
	console.log(out);
}

function count_dots_in_string (str) {
	return (str.match(/\./g)||[]).length;
}

/*******************************************************************************
 * mDNS
 ******************************************************************************/

// Setup custom sequence to fix resolve errors
var sequence = [
	mdns.rst.DNSServiceResolve()
];
if ('DNSServiceGetAddrInfo' in mdns.dns_sd) {
	// I believe this means we are on Mac OS X
	sequence.push(rst.DNSServiceGetAddrInfo());
} else {
	// Linux, split up IPv4 and IPv6 lookup
	sequence.push(mdns.rst.getaddrinfo({families: [4]}));
	sequence.push(mdns.rst.getaddrinfo({families: [6]}));
}
var mDNSbrowser = mdns.createBrowser(mdns.tcp('workstation'), {resolverSequence: sequence});

function handle_mdns_service (service) {
	if (service.name.startsWith('beaglebone')) {
		// Found a BeagleBone on MDNS
		var mac = '';
		var ipv4 = '';
		var ipv6 = '';

		// Get the MAC address of the discovered BBB
		var mac_search = /\[(.*?)\]/g.exec(service.name);
		if (mac_search) {
			mac = mac_search[1];
		}

		// Pull out addresses
		for (var i=0; i<service.addresses.length; i++) {
			if (service.addresses[i].indexOf('.') > -1 && ipv4 == '') {
				ipv4 = service.addresses[i];
			} else if (service.addresses[i].indexOf(':') > -1 && ipv6 == '') {
				ipv6 = service.addresses[i];
			}
		}

		// Print what we found
		display_beaglebone(ipv4, ipv6, mac, 'mDNS');
	}
}

mDNSbrowser.on('serviceUp', handle_mdns_service);

mDNSbrowser.on('error', function (err, service) {
	debug(err);

	// Likely this is an error with looking up IPv6 addresses.
	// We still want to display the ipv4 address though.
	handle_mdns_service(service);
});


/*******************************************************************************
 * BLE Eddystone
 ******************************************************************************/

// Re-write parseBeacon in eddystone discovery so we can get the device name back
var oldParseBeacon = ebs.prototype.parseBeacon;
ebs.prototype.parseBeacon = function (peripheral) {
	var beacon = oldParseBeacon.apply(this, arguments);
	beacon.advertisement = peripheral.advertisement;
	return beacon;
}

var EddystoneBeaconScanner = new ebs();

EddystoneBeaconScanner.on('found', function(beacon) {
	if (beacon.type == 'url' && beacon.advertisement.localName == 'beaglebone') {
		var parsed_url = url.parse(beacon.url);
		var ip = parsed_url.host;
		// Do a quick sanity check
		if (ip.length >= 7 && ip.length <= 15 && count_dots_in_string(ip) == 3) {
			display_beaglebone(ip, '', '', 'BLE Eddystone')
		}
	}
});


/*******************************************************************************
 * SSDP
 ******************************************************************************/

var CUSTOM_GATEWAY_URN = 'urn:TerraSwarm:gateway:1';

var ssdpClient = new ssdp.Client();
ssdpClient.on('response', function (headers, statusCode, rinfo) {
	if (headers.ST == CUSTOM_GATEWAY_URN) {
		var ipv4 = '';
		var ipv6 = '';

		if (rinfo.family == 'IPv4') {
			ipv4 = rinfo.address;
		} else if (rinfo.family == 'IPv6') {
			ipv6 = rinfo.address;
		}
		display_beaglebone(ipv4, ipv6, '', 'SSDP/UPnP');
	}
});


/*******************************************************************************
 * Start
 ******************************************************************************/

console.log('Searching for BeagleBones...\n');
display_header();

mDNSbrowser.start();
EddystoneBeaconScanner.startScanning();
ssdpClient.search(CUSTOM_GATEWAY_URN);
