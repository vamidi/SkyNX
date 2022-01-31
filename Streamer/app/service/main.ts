// Authour: Dustin Harris
// GitHub: https://github.com/DevL0rd
// License MIT

// const { spawn } = require("child_process");
// const DB = require('./Devlord_modules/DB.js');
// const Struct = require('struct');
// const net = require('net');
const robot = require("robotjs");
const VGen = require("@vamidicreations/vgen-xbox");
const vgen = new VGen();
// const GyroServ = require("./Devlord_modules/GyroServ.js");
let ip = "0.0.0.0"
let quality = 5;
// var hidStreamClient = new net.Socket();
let usingVideo = true;
let usingAudio = true;
let abxySwap = false;
let limitFPS = false;
let encoding = "CPU";
let screenWidth = 1280;
let screenHeight = 720;
let screenScale = 1;
let mouseControl = "ANALOG";

function connect() {
	console.log('Connecting to switch');
	/*hidStreamClient.connect({
		host: ip,
		port: 2223
	});
	 */
}

const args = process.argv;
if (args.length > 1) {
	if (args.includes("/ip") && args[args.indexOf("/ip") + 1]) {
		ip = args[args.indexOf("/ip") + 1];
		console.log('Waiting for connection...');
		if (args.includes("/quality") && args[args.indexOf("/quality") + 1]) {
			quality = +args[args.indexOf("/quality") + 1];
		} else {
			quality = 5;
		}
		if (args.includes("/w") && args[args.indexOf("/w") + 1]) {
			screenWidth = +args[args.indexOf("/w") + 1];
		} else {
			screenWidth = 1280;
		}
		if (args.includes("/h") && args[args.indexOf("/h") + 1]) {
			screenHeight = +args[args.indexOf("/h") + 1];
		} else {
			screenHeight = 720;
		}
		if (args.includes("/s") && args[args.indexOf("/s") + 1]) {
			screenScale = +args[args.indexOf("/s") + 1];
		} else {
			screenScale = 1;
		}
		if (args.includes("/m") && args[args.indexOf("/m") + 1]) {
			mouseControl = args[args.indexOf("/m") + 1];
		} else {
			mouseControl = "ANALOG";
		}
		if (args.includes("/noVideo")) {
			usingVideo = false;
		} else {
			usingVideo = true;
		}
		if (args.includes("/noAudio")) {
			usingAudio = false;
		} else {
			usingAudio = true;
		}
		if (args.includes("/abxySwap")) {
			abxySwap = true;
		} else {
			abxySwap = false;
		}
		if (args.includes("/abxySwap")) {
			abxySwap = true;
		} else {
			abxySwap = false;
		}
		if (args.includes("/limitFPS")) {
			limitFPS = true;
		} else {
			limitFPS = false;
		}
		if (args.includes("/e") && args[args.indexOf("/e") + 1]) {
			encoding = args[args.indexOf("/e") + 1];
		} else {
			encoding = "CPU";
		}
		connect();
	} else {
		console.log('Error: Usage NXStreamer.exe ip 0.0.0.0 q 10 /noVideo /noAudio /abxySwap /e NVCENC');
	}
} else {
	console.log('Error: Usage NXStreamer.exe ip 0.0.0.0 q 10 /noVideo /noAudio /abxySwap /e NVCENC');
}