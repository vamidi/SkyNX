import { ChildProcessWithoutNullStreams } from 'child_process';

const { spawn } = require("child_process");
const net = require('net');
const hidStreamClient = new net.Socket();

const defaultPackageSize = 640;

declare type Protocol = 'udp' | 'rtp';
declare type SampleRate = '16000' | '22050' | '24000' | '44100' | '48000';

interface IConfig {
	ip: string,
	port: number,
	packageSize: number,
	method: Protocol;
	sampleRate: SampleRate,
	bitRate: string,
	[key:string]: any;
}

class SwitchServer {
	public ffmpegProcess = null;
	public ffmpegAudioProcess: ChildProcessWithoutNullStreams = null;

	private controllerIds = [];

	private ip: string = "0.0.0.0";
	private port: number = 2223;


	private streamingConfig: IConfig = {
		ip: "0.0.0.0",
		port: 2224,
		packageSize: 1316, // normally 640
		method: "rtp",
		sampleRate: "24000", // normally 16000
		bitRate: "320k",
	}

	private audioConfig =
		["-y", "-re", "-f", "dshow", "-i", 'audio=virtual-audio-capturer', "-f", "s16le", "-ar", this.streamingConfig.sampleRate, "-ac", "2", "-c:a", "pcm_s16le",
			`${this.streamingConfig.method}://${this.streamingConfig.ip}:${this.streamingConfig.port}?pkt_size=${this.streamingConfig.packageSize}`
		];

	public constructor()
	{
		hidStreamClient.on('error', (ex) => {
			if (ex) {
				console.log("Could not connect to Switch. Connection timed out...");
				setTimeout(this.connect, 1000);
			}
		});
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
		this.ffmpegAudioProcess = spawn(
			"./lib/ffmpeg.exe",
			["-y", "-f", "dshow", "-i", 'audio=virtual-audio-capturer', "-f", "s16le", "-ar", "16000", "-ac", "2", "-c:a", "pcm_s16le", "udp://" + ip + ":2224?pkt_size=640"],
			{ detached: false }
		);
		this.ffmpegAudioProcess.stdout.on("data", data => {
			console.log(`${data}`);
		});
		this.ffmpegAudioProcess.stderr.on('data', (data) => {
			console.error(`${data}`);
		});
		this.ffmpegAudioProcess.on('close', (code) => {
			console.log(`AudioProcess process exited with code ${code}`);
		});

		// unsubscribe
		this.ffmpegAudioProcess.off('data', data => {
			console.log(`${data}`);
		});
	}
}

export const server = new SwitchServer();
export default server;