/*

Display all discovered devices in a table.

Setup:
  npm i cli-table cli-clear

Run:
  node node-broadcast-table.js

*/

var Table = require('cli-table');
var clear = require('cli-clear');

var dgram = require('dgram');


//
// Setup connection to broadcast UDP packets from the gateway
//
var PORT = 3002;
var client = dgram.createSocket({type: 'udp4', reuseAddr: true, reusePort: true});
client.on('listening', function () {
    client.setBroadcast(true);
});


//
// Global resources for re-creating tables
//
// The list of table headings grow as more devices are discovered
var table_headings = ['id'];
var table_heading_widths = [14];

// Keep track of the order we found devices
var device_order = [];

// Keep track of the most recent data packets
var data = {};

function create_row (device_data) {
	var row = [];

	for (var i=0; i<table_headings.length; i++) {
		var heading = table_headings[i];

		if (heading in device_data) {
			row.push(device_data[heading]);
		} else {
			row.push('');
		}
	}

	return row;
}

function create_rows () {
	var rows = [];

	for (var i=0; i<device_order.length; i++) {
		var device_id = device_order[i];
		rows.push(create_row(data[device_id]));
	}

	return rows;
}


// On each message, print to the terminal
client.on('message', function (message, remote) {
	var adv_out = JSON.parse(message.toString());

	var device_id = adv_out.id;

	// Check if we've seen this device before, and if not, update
	// our state with things we learned from this new device.
	if (device_order.indexOf(device_id) == -1) {
		device_order.push(device_id);
		data[device_id] = {};

		for (field in adv_out) {
			if (table_headings.indexOf(field) == -1) {
				table_headings.push(field);
				table_heading_widths.push(field.length+2);
			}
		}
	}

	// Update with the new just arrived packet
	data[device_id] = adv_out;
    
    // Actually create the table and display it
	var table = new Table({
		head: table_headings,
		colWidths: table_heading_widths
	});

	var rows = create_rows();
	for (var i=0; i<rows.length; i++) {
		table.push(rows[i]);
	}

	clear();
	console.log(table.toString());
});


// Get UDP messages
client.bind(PORT);
