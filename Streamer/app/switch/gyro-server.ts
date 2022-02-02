const dgram = require('dgram');
const crc = require('crc');
const long = require('long');

class GyroServer
{
	private readonly server = null;
	private readonly maxProtocolVer = 1001;
	private readonly MessageType = {
		DSUC_VersionReq: 0x100000,
		DSUS_VersionRsp: 0x100000,
		DSUC_ListPorts: 0x100001,
		DSUS_PortInfo: 0x100001,
		DSUC_PadDataReq: 0x100002,
		DSUS_PadDataRsp: 0x100002
	};
	private readonly serverID = 0 + Math.floor(Math.random() * 4294967295);

	private connectedClient = null;
	private lastRequestAt = 0;
	private phoneIsConnected = false;
	private packetCounter = 0;
	private clientTimeoutLimit = 5000;
	
	constructor(opt = null) {
		this.server = dgram.createSocket('udp4');
		this.error(`CemuHook Server ID: ${this.serverID}`);

		this.server.on('error', err => {
			this.error(`CemuHook: server error:\n${err.stack}`);
			this.server.close();
		});

		this.server.on('listening', () => {
			const address = this.server.address();
			this.error(
				`CemuHook: Listening at ${address.address}:${address.port}`
			);
		});

		this.server.on('message', (data, rinfo) => {
			if (!(
				data[0] === this.char('D') &&
				data[1] === this.char('S') &&
				data[2] === this.char('U') &&
				data[3] === this.char('C')
			)) return;

			let index = 4;

			let protocolVer = data.readUInt16LE(index);
			index += 2;

			let packetSize = data.readUInt16LE(index);
			index += 2;

			let receivedCrc = data.readUInt32LE(index);
			data[index++] = 0;
			data[index++] = 0;
			data[index++] = 0;
			data[index++] = 0;

			/* let computedCrc = */ crc.crc32(data);
			/* let clientId = */ data.readUInt32LE(index);
			index += 4;
			let msgType = data.readUInt32LE(index);
			index += 4;

			if (msgType == this.MessageType.DSUC_VersionReq) {
				this.error('Version request ignored.');
			} else if (msgType == this.MessageType.DSUC_ListPorts) {
				// log('List ports request.');
				let numOfPadRequests = data.readInt32LE(index);
				index += 4;
				for (let i = 0; i < numOfPadRequests; i++) {
					let requestIndex = data[index + i];
					if (requestIndex !== 0) continue;
					let outBuffer = Buffer.alloc(16);
					outBuffer.writeUInt32LE(this.MessageType.DSUS_PortInfo, 0);
					let outIndex = 4;
					outBuffer[outIndex++] = 0x00; // pad id
					// outBuffer[outIndex++] = phoneIsActive ? 0x02 : 00; // state (connected or disconnected)
					outBuffer[outIndex++] = 0x02; // state (connected)
					outBuffer[outIndex++] = 0x03; // model (generic)
					outBuffer[outIndex++] = 0x01; // connection type (usb)
					// mac address
					for (let j = 0; j < 5; j++) {
						outBuffer[outIndex++] = 0;
					}
					outBuffer[outIndex++] = 0xff; // 00:00:00:00:00:FF
					// outBuffer[outIndex++] = 0x00; // battery (none)
					outBuffer[outIndex++] = 0xef; // battery (charged)
					outBuffer[outIndex++] = 0; // dunno (probably 'is active')
					this.SendPacket(rinfo, outBuffer);
				}
			} else if (msgType == this.MessageType.DSUC_PadDataReq) {
				let flags = data[index++];
				let idToRRegister = data[index++];
				let macToRegister: string[] | string = ['', '', '', '', '', ''];
				for (let i = 0; i < macToRegister.length; i++, index++) {
					macToRegister[i] = `${data[index] < 15 ? '0' : ''}${data[index].toString(
						16
					)}`;
				}
				macToRegister = macToRegister.join(':');

				// log(`Pad data request (${flags}, ${idToRRegister}, ${macToRegister})`);

				// There is only one controller, so
				// @ts-ignore
				if (flags == 0 || (idToRRegister == 0 && flags & (0x01 !== 0)) || (macToRegister == '00:00:00:00:00:ff' && flags & (0x02 !== 0))
				) {
					this.connectedClient = rinfo;
					this.lastRequestAt = Date.now();
				}
			}
		});
		this.server.bind(26760);
	}

	public sendMotionData(gyro, accelerometer, motionTimestamp = null) {
		accelerometer = accelerometer || {};
		motionTimestamp = motionTimestamp || Date.now() * 1000;
		motionTimestamp = long.fromNumber(motionTimestamp, true);
		let client = this.connectedClient;
		if (client === null || Date.now() - this.lastRequestAt > this.clientTimeoutLimit)
			return;

		let outBuffer = Buffer.alloc(100);
		let outIndex = this.BeginPacket(outBuffer);
		outBuffer.writeUInt32LE(this.MessageType.DSUS_PadDataRsp, outIndex);
		outIndex += 4;

		outBuffer[outIndex++] = 0x00; // pad id
		outBuffer[outIndex++] = 0x02; // state (connected)
		outBuffer[outIndex++] = 0x02; // model (generic)
		outBuffer[outIndex++] = 0x01; // connection type (usb)

		// mac address
		for (let i = 0; i < 5; i++) {
			outBuffer[outIndex++] = 0x00;
		}
		outBuffer[outIndex++] = 0xff; // 00:00:00:00:00:FF

		outBuffer[outIndex++] = 0xef; // battery (charged)
		outBuffer[outIndex++] = 0x01; // is active (true)

		outBuffer.writeUInt32LE(this.packetCounter++, outIndex);
		outIndex += 4;

		outBuffer[outIndex] = 0x00; // left, down, right, up, options, R3, L3, share
		outBuffer[++outIndex] = 0x00; // square, cross, circle, triangle, r1, l1, r2, l2
		outBuffer[++outIndex] = 0x00; // PS
		outBuffer[++outIndex] = 0x00; // Touch

		outBuffer[++outIndex] = 0x00; // position left x
		outBuffer[++outIndex] = 0x00; // position left y
		outBuffer[++outIndex] = 0x00; // position right x
		outBuffer[++outIndex] = 0x00; // position right y

		outBuffer[++outIndex] = 0x00; // dpad left
		outBuffer[++outIndex] = 0x00; // dpad down
		outBuffer[++outIndex] = 0x00; // dpad right
		outBuffer[++outIndex] = 0x00; // dpad up

		outBuffer[++outIndex] = 0x00; // square
		outBuffer[++outIndex] = 0x00; // cross
		outBuffer[++outIndex] = 0x00; // circle
		outBuffer[++outIndex] = 0x00; // triange

		outBuffer[++outIndex] = 0x00; // r1
		outBuffer[++outIndex] = 0x00; // l1

		outBuffer[++outIndex] = 0x00; // r2
		outBuffer[++outIndex] = 0x00; // l2

		outIndex++;

		outBuffer[outIndex++] = 0x00; // track pad first is active (false)
		outBuffer[outIndex++] = 0x00; // track pad first id
		outBuffer.writeUInt16LE(0x0000, outIndex); // trackpad first x
		outIndex += 2;
		outBuffer.writeUInt16LE(0x0000, outIndex); // trackpad first y
		outIndex += 2;

		outBuffer[outIndex++] = 0x00; // track pad second is active (false)
		outBuffer[outIndex++] = 0x00; // track pad second id
		outBuffer.writeUInt16LE(0x0000, outIndex); // trackpad second x
		outIndex += 2;
		outBuffer.writeUInt16LE(0x0000, outIndex); // trackpad second y
		outIndex += 2;

		outBuffer.writeUInt32LE(motionTimestamp.getLowBitsUnsigned(), outIndex);
		outIndex += 4;
		outBuffer.writeUInt32LE(motionTimestamp.getHighBitsUnsigned(), outIndex);
		outIndex += 4;

		outBuffer.writeFloatLE(accelerometer.x || 0, outIndex);
		outIndex += 4;
		outBuffer.writeFloatLE(accelerometer.y || 0, outIndex);
		outIndex += 4;
		outBuffer.writeFloatLE(accelerometer.z || 0, outIndex);
		outIndex += 4;

		outBuffer.writeFloatLE(gyro.x, outIndex);
		outIndex += 4;
		outBuffer.writeFloatLE(gyro.y, outIndex);
		outIndex += 4;
		outBuffer.writeFloatLE(gyro.z, outIndex);
		outIndex += 4;

		this.FinishPacket(outBuffer);
		this.server.send(
			outBuffer,
			0,
			outBuffer.length,
			client.port,
			client.address,
			(error, bytes) => {
				if (error) {
					this.error('CemuHook: Send packet error');
					this.error(error.message);
				} else if (bytes !== outBuffer.length) {
					this.error(
						`CemuHook: failed to completely send all of buffer. Sent: ${bytes}. Buffer length: ${outBuffer.length}`
					);
				}
			}
		);
	}

	private error(msg) {
		console.error(msg);
	};

	private char(a) {
		return a.charCodeAt(0);
	}

	private BeginPacket(data, dlen = null) {
		let index = 0;
		data[index++] = this.char('D');
		data[index++] = this.char('S');
		data[index++] = this.char('U');
		data[index++] = this.char('S');

		data.writeUInt16LE(this.maxProtocolVer, index);
		index += 2;

		data.writeUInt16LE(dlen || data.length - 16, index);
		index += 2;

		data.writeUInt32LE(0, index);
		index += 4;

		data.writeUInt32LE(this.serverID, index);
		index += 4;

		return index;
	}

	private FinishPacket(data) {
		data.writeUInt32LE(crc.crc32(data), 8, true);
	}

	private SendPacket(client, data) {
		let buffer = Buffer.alloc(16);
		let index = this.BeginPacket(buffer, data.length);
		// buffer.fill(data,index);
		buffer = Buffer.concat([buffer, data]);
		this.FinishPacket(buffer);
		this.server.send(
			buffer,
			0,
			buffer.length,
			client.port,
			client.address,
			(error, bytes) => {
				if (error) {
					this.error('CemuHook: Send packet error');
					this.error(error.message);
				} else if (bytes !== buffer.length) {
					this.error(
						`CemuHook: failed to completely send all of buffer. Sent: ${bytes}. Buffer length: ${buffer.length}`
					);
				}
			}
		);
	}
}

export default new GyroServer();
