import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { ElectronService } from '../services/electron/electron.service';

@Injectable({ providedIn: 'root' })
export class LoggerService implements OnDestroy
{
	private logTimeout: NodeJS.Timeout = null;
	private consoleElementRef: ElementRef = null;
	private statusElementRef: ElementRef = null;
	private fps = "0";
	private encodingFps: string = "0";
	private bitrate: string = "";

	constructor(
		protected electronService: ElectronService
	) {
		electronService.ipcRenderer.on('log', (_, generatedHTML) => this.onLog(generatedHTML));
		electronService.ipcRenderer.send('registerForHTMLLogging');
	}

	public initialize(consoleContainer: ElementRef, statusContainer: ElementRef)
	{
		this.consoleElementRef = consoleContainer;
		this.statusElementRef = statusContainer;
	}

	public ngOnDestroy(): void {

	}

	public consoleCommand(command) {
		this.electronService.ipcRenderer.send('consoleCommand', command);
	}

	private onLog(generatedHTML: string)
	{
		if(this.consoleElementRef)
		{
			this.consoleElementRef.nativeElement.append(generatedHTML);
		}

		if(generatedHTML.includes("fps="))
		{
			this.encodingFps = generatedHTML.includes("fps= ") ? generatedHTML.split("fps= ")[1].split(" ")[0]
				: generatedHTML.split("fps=")[1].split(" ")[0];

			if (generatedHTML.includes("bitrate=")) {
				this.bitrate = generatedHTML.split("bitrate=")[1].split(" ")[0];
			}

			this.statusElementRef.nativeElement.html(`FPS: ${this.fps}     Encoding FPS: ${this.encodingFps}     Bitrate: ${this.bitrate}`);
		}

		if (generatedHTML.includes("switchFps="))
		{
			this.fps = generatedHTML.split("switchFps=")[1].split(" ")[0].replace("<br>", "");

			this.statusElementRef.nativeElement.html(`FPS: ${this.fps}     Encoding FPS: ${this.encodingFps}     Bitrate: ${this.bitrate}`);
		}

		if (generatedHTML.includes("Connection timed out") || generatedHTML.includes("Waiting for connection")) {
			this.statusElementRef.nativeElement.html("Waiting for connection...");
		}

		if (generatedHTML.includes("streamerProcess process exited")) {
			this.statusElementRef.nativeElement.html("Streamer stopped.");
		}

		clearTimeout(this.logTimeout);
		this.logTimeout = setTimeout(() => {
			this.consoleElementRef.nativeElement.animate(
				{ scrollTop: this.consoleElementRef.nativeElement.prop("scrollHeight") },
			300);
		}, 300);
	}
}