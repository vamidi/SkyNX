import { ChildProcessWithoutNullStreams } from 'child_process';
import ControllerHandler from './switch-controller-handler';

const { spawn } = require("child_process");
const Struct = require('struct');

const net = require('net');
const hidStreamClient = new net.Socket();

const defaultPackageSize = 640;

declare type Protocol = 'udp' | 'rtp';
declare type SampleRate = '16000' | '22050' | '24000' | '44100' | '48000';
declare type Encoding = 'NVENC' | 'AMDVCE' | 'QSV' | 'CPU';
declare type Fps = 30 | 60;

interface IConfig {
	ip: string,
	videoPort: number,
	audioPort: number,
	packageSize: number,
	method: Protocol;
	sampleRate: SampleRate,
	bitRate: string,
	fps: Fps,
	quality: number,
	limitFPS: boolean,
	encoding: Encoding,
	screenWidth: number,
	screenHeight: number,
	[key:string]: any;
}

function parseInputStruct(buff) {
	const input = Struct()
		.word32Ule('HeldKeys1')
		.word32Sle('LJoyX1')
		.word32Sle('LJoyY1')
		.word32Sle('RJoyX1')
		.word32Sle('RJoyY1')
		.word32Ule('HeldKeys2')
		.word32Sle('LJoyX2')
		.word32Sle('LJoyY2')
		.word32Sle('RJoyX2')
		.word32Sle('RJoyY2')
		.word32Ule('HeldKeys3')
		.word32Sle('LJoyX3')
		.word32Sle('LJoyY3')
		.word32Sle('RJoyX3')
		.word32Sle('RJoyY3')
		.word32Ule('HeldKeys4')
		.word32Sle('LJoyX4')
		.word32Sle('LJoyY4')
		.word32Sle('RJoyX4')
		.word32Sle('RJoyY4')
		.word32Ule('HeldKeys5')
		.word32Sle('LJoyX5')
		.word32Sle('LJoyY5')
		.word32Sle('RJoyX5')
		.word32Sle('RJoyY5')
		.word32Ule('HeldKeys6')
		.word32Sle('LJoyX6')
		.word32Sle('LJoyY6')
		.word32Sle('RJoyX6')
		.word32Sle('RJoyY6')
		.word32Ule('HeldKeys7')
		.word32Sle('LJoyX7')
		.word32Sle('LJoyY7')
		.word32Sle('RJoyX7')
		.word32Sle('RJoyY7')
		.word32Ule('HeldKeys8')
		.word32Sle('LJoyX8')
		.word32Sle('LJoyY8')
		.word32Sle('RJoyX8')
		.word32Sle('RJoyY8')
		.word32Ule('touchX1')
		.word32Ule('touchY1')
		.word32Ule('touchX2')
		.word32Ule('touchY2')
		.floatle('accelX')
		.floatle('accelY')
		.floatle('accelZ')
		.floatle('gyroX')
		.floatle('gyroY')
		.floatle('gyroZ')
		.word32Ule('controllerCount')
		.word32Ule('frameRate')
	input._setBuff(buff);
	return input;
};

class SwitchServer {
	public ffmpegProcess: ChildProcessWithoutNullStreams = null;
	public ffmpegAudioProcess: ChildProcessWithoutNullStreams = null;

	private ip: string = "0.0.0.0";
	private port: number = 2223;

	private streamingConfig: IConfig = {
		ip: "0.0.0.0",
		videoPort: 2222,
		audioPort: 2224,
		packageSize: 1316, // normally 640
		method: "rtp",
		sampleRate: "24000", // normally 16000
		bitRate: "320k",
		fps: 60,
		quality: 5,
		limitFPS: false,
		encoding: 'CPU',
		screenWidth: 1280,
		screenHeight: 720,
	}

	private readonly audioConfig: string[] = [];

	private usingVideo: boolean = true;
	private usingAudio: boolean = true;

	private fpsPrintTimer = 0;
	private hidDataBuffer = "";

	public constructor()
	{
		this.audioConfig = ["-y", "-re", "-f", "dshow", "-i", 'audio=virtual-audio-capturer', "-f", "s16le", "-ar", this.streamingConfig.sampleRate, "-ac", "2", "-c:a", "pcm_s16le",
			`${this.streamingConfig.method}://${this.streamingConfig.ip}:${this.streamingConfig.port}?pkt_size=${this.streamingConfig.packageSize}`
		];

		hidStreamClient.on('error', (ex) => {
			if (ex) {
				console.log("Could not connect to Switch. Connection timed out...");
				setTimeout(this.connect, 1000);
			}
		});

		hidStreamClient.on('connect', () => {
			hidStreamClient.setNoDelay(true);
			console.log('Connected to Switch!');
			if (this.usingVideo) this.startVideoProcess();
			if (this.usingAudio) this.startAudioProcess();
		});

		hidStreamClient.on('data', (chunk: number) => {
			const screenDimension: [number, number] = [this.streamingConfig.screenWidth, this.streamingConfig.screenHeight];
			this.hidDataBuffer += chunk.toString(16);
			let completeData = "";
			if (this.hidDataBuffer.includes("ffffffffffffffff") && this.hidDataBuffer.includes("ffffffffffffff7")) {
				completeData = this.hidDataBuffer.split("ffffffffffffffff")[1].split("ffffffffffffff7")[0];
				this.hidDataBuffer = "";
				if (completeData.length != 416) {
					console.log("Incorrect data length: " + completeData.length + " - " + completeData);
					return
				}
			} else {
				return;
			}
			const data = Buffer.from(completeData, 'hex');
			const hid = parseInputStruct(data);

			const controllerCount = hid.get("controllerCount");
			ControllerHandler.setPlayerCount(hid, controllerCount);

			this.fpsPrintTimer++;
			if (this.fpsPrintTimer == 10) {
				console.log("switchFps=" + hid.get("frameRate"))
				this.fpsPrintTimer = 0;
			}
			let playerNumber;
			for (let i in ControllerHandler.ControllerIds) {
				playerNumber = parseInt(i) + 1;
				ControllerHandler.handleControllerInput(hid, ControllerHandler.ControllerIds[i], playerNumber);
			}

			ControllerHandler.handleMouseInputToggling(hid, 1);
			ControllerHandler.handleMouse(hid, 1, screenDimension);
			ControllerHandler.handleTouchInput(hid, screenDimension);
			ControllerHandler.handleGyroAndAccel(hid);
		});
		hidStreamClient.on('end', function () {
			console.log('hidStreamClient Disconnected.');
			ControllerHandler.disconnect();
			if (this.usingVideo) {
				this.ffmpegProcess.kill();
			}
			if (this.usingAudio) {
				this.ffmpegAudioProcess.kill();
			}
			setTimeout(this.connect, 1000);
		});
	}

	public destroy()
	{
		this.stopAudioProcess();
		this.stopVideoProcess()
	}

	public connect()
	{
		hidStreamClient.connect({
			host: this.ip,
			port: this.port,
		});
	}

	private startAudioProcess()
	{
		this.ffmpegAudioProcess = spawn("./lib/ffmpeg.exe", this.audioConfig, { detached: false });
		this.ffmpegAudioProcess.stdout.on("data", (data) => this.log(data));
		this.ffmpegAudioProcess.stderr.on('data', (data) => this.log(data, true));
		this.ffmpegAudioProcess.on('close', (code) => this.log(`AudioProcess process exited with code ${code}`));
	}

	private startVideoProcess()
	{
		if (this.streamingConfig.limitFPS) {
			this.streamingConfig.fps = 30;
		}

		let ffmpegVideoArgs: string[];
		switch(this.streamingConfig.encoding)
		{
			case 'NVENC':
				ffmpegVideoArgs = [
					"-probesize", "50M", "-hwaccel", "auto", "-f", "gdigrab", "-framerate", this.streamingConfig.fps.toString(), "-video_size", this.streamingConfig.screenWidth + "x" + this.streamingConfig.screenHeight, "-offset_x", "0", "-offset_y", "0", "-draw_mouse", "1", "-i", "desktop", "-c:v", "h264_nvenc", "-gpu", "0", "-rc", "cbr_ld_hq", "-zerolatency", "1", "-f", "h264", "-vf", "scale=1280x720", "-pix_fmt", "yuv420p", "-profile:v", "baseline", "-cq:v", "19", "-g", "999999", "-b:v", this.streamingConfig.quality + "M", "-minrate", this.streamingConfig.quality - 3 + "M", "-maxrate", this.streamingConfig.quality + "M", "-bufsize", (this.streamingConfig.quality / (this.streamingConfig.fps / 4)) + "M", `tcp://${this.streamingConfig.ip}:${this.streamingConfig.videoPort}`
				];
				console.log("Using Nvidia Encoding");
				break;
			case 'AMDVCE':
				ffmpegVideoArgs = ["-probesize", "50M", "-hwaccel", "auto", "-f", "gdigrab", "-framerate", this.streamingConfig.fps.toString(), "-video_size", this.streamingConfig.screenWidth + "x" + this.streamingConfig.screenHeight, "-offset_x", "0", "-offset_y", "0", "-draw_mouse", "1", "-i", "desktop", "-f", "h264", "-c:v", "h264_amf", "-usage", "1", "-rc", "cbr", "-vf", "scale=1280x720", "-pix_fmt", "yuv420p", "-b:v", this.streamingConfig.quality + "M", "-minrate", this.streamingConfig.quality - 3 + "M", "-maxrate", this.streamingConfig.quality + "M", "-bufsize", (this.streamingConfig.quality / (this.streamingConfig.fps / 4)) + "M", `tcp://${this.streamingConfig.ip}:${this.streamingConfig.videoPort}`];
				console.log("Using AMD Video Coding Engine");
				break;
			case 'QSV':
				ffmpegVideoArgs = ["-probesize", "50M", "-hwaccel", "auto", "-f", "gdigrab", "-framerate", this.streamingConfig.fps.toString(), "-video_size", this.streamingConfig.screenWidth + "x" + this.streamingConfig.screenHeight, "-offset_x", "0", "-offset_y", "0", "-draw_mouse", "1", "-i", "desktop", "-f", "h264", "-c:v", "h264_qsv", "-preset", "faster", "-profile", "baseline", "-vf", "scale=1280x720", "-pix_fmt", "yuv420p", "-b:v", this.streamingConfig.quality + "M", "-minrate", this.streamingConfig.quality - 3 + "M", "-maxrate", this.streamingConfig.quality + "M", "-bufsize", (this.streamingConfig.quality / (this.streamingConfig.fps / 4)) + "M", `tcp://${this.streamingConfig.ip}:${this.streamingConfig.videoPort}`];
				console.log("Using Intel QSV Encoding");
				break;
			case 'CPU':
			default:
				ffmpegVideoArgs = ["-probesize", "50M", "-hwaccel", "auto", "-f", "gdigrab", "-framerate", this.streamingConfig.fps.toString(), "-video_size", this.streamingConfig.screenWidth + "x" + this.streamingConfig.screenHeight, "-offset_x", "0", "-offset_y", "0", "-draw_mouse", "1", "-i", "desktop", "-f", "h264", "-vf", "scale=1280x720", "-preset", "ultrafast", "-tune", "zerolatency", "-pix_fmt", "yuv420p", "-profile:v", "baseline", "-x264-params", "nal-hrd=cbr", "-b:v", this.streamingConfig.quality + "M", "-minrate", this.streamingConfig.quality - 3 + "M", "-maxrate", this.streamingConfig.quality + "M", "-bufsize", (this.streamingConfig.quality / 2) + "M", `tcp://${this.streamingConfig.ip}:${this.streamingConfig.videoPort}`];
				console.log("Using CPU Encoding");
				break;
		}

		this.ffmpegProcess = spawn("./lib/ffmpeg.exe", ffmpegVideoArgs, { detached: false });
		this.ffmpegProcess.stdout.on("data", (data) => this.log(data));
		this.ffmpegProcess.stderr.on('data', (data) => this.log(data, true));
		this.ffmpegProcess.on('close', (code) => this.log(`VideoProcess process exited with code ${code}`));
	}

	private stopAudioProcess()
	{
		// unsubscribe
		this.ffmpegAudioProcess.stdout.off("data", (data) => this.log(data));
		this.ffmpegAudioProcess.stderr.off('data', (data) => this.log(data, true));
		this.ffmpegAudioProcess.off('close', (code) => this.log(`AudioProcess process exited with code ${code}`));
	}

	private stopVideoProcess()
	{
		this.ffmpegProcess.stdout.on("data", (data) => this.log(data));
		this.ffmpegProcess.stderr.on('data', (data) => this.log(data, true));
		this.ffmpegProcess.on('close', (code) => this.log(`VideoProcess process exited with code ${code}`));
	}

	private log(data, isError: boolean = false)
	{
		if(isError) console.error(data);
		else console.log(data);
	}
}

export default new SwitchServer();