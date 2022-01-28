import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../@core/services/client.service';
import { Encoding, MouseControl } from '../../@core/interfaces/client.interface';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit
{
	public get Encoding(): Encoding {
		return this.clientService.get('encoding') as Encoding;
	}

	public set Encoding(encoding: Encoding) {
		this.clientService.set('encoding', encoding);
	}

	public get MouseControl(): MouseControl {
		return this.clientService.get('mouseControl') as MouseControl;
	}

	public get MouseControlName(): string {
		return MouseControl[this.MouseControl];
	}

	public set MouseControl(control: MouseControl) {
		this.clientService.set('mouseControl', control);
	}

	public get IP(): string
	{
		return this.clientService.get('ip') as string;
	}

	public set IP(event: any)
	{
		this.clientService.set('ip', +event.target.value);
	}

	public get Quality(): number
	{
		return this.clientService.get('quality') as number;
	}

	public set Quality(event: any)
	{
		this.clientService.set('quality', +event.target.value);
	}

	public get DisableVideo(): boolean
	{
		return this.clientService.get('disableVideo') as boolean;
	}

	public set DisableVideo(event: any)
	{
		this.clientService.set('disableVideo', event.target.checked);
	}

	public get DisableAudio(): boolean
	{
		return this.clientService.get('disableAudio') as boolean;
	}

	public set DisableAudio(event: any)
	{
		this.clientService.set('disableAudio', event.target.checked);
	}

	public get SwapAB(): boolean
	{
		return this.clientService.get('abSwap') as boolean;
	}

	public set SwapAB(event: any)
	{
		this.clientService.set('abSwap', event.target.checked);
	}

	public get SwapXY(): boolean
	{
		return this.clientService.get('xySwap') as boolean;
	}

	public set SwapXY(event: any)
	{
		this.clientService.set('xySwap', event.target.checked);
	}

	public get LimitFPS(): boolean
	{
		return this.clientService.get('limitFPS') as boolean;
	}

	public set LimitFPS(event: any)
	{
		this.clientService.set('limitFPS', event.target.checked);
	}

	constructor(public clientService: ClientService) { }

	ngOnInit(): void { }

	public startStreamer()
	{
		console.log('start the server');
		this.clientService.connect();
	}

	private applyClientSettings() {
		/*
		if (clientSettings.autoChangeResolution) {
			ipcRenderer.send("autoChangeResolutionOn");
		} else {
			ipcRenderer.send("autoChangeResolutionOff")
		}
		if (clientSettings.encoding == "NVENC") {
			$("#encodingDrop").html("Encoding (Nvidia)");
		} else if (clientSettings.encoding == "AMDVCE") {
			$("#encodingDrop").html("Encoding (AMD)")
		} else if (clientSettings.encoding == "QSV") {
			$("#encodingDrop").html("Encoding (Intel)");
		} else {
			$("#encodingDrop").html("Encoding (CPU)");
			clientSettings.encoding = "CPU";
		}
		if (clientSettings.mouseControl == "ANALOG") {
			$("#mouseControlDrop").html("Mouse Control (Analog)");
		} else if (clientSettings.mouseControl == "GYRO") {
			$("#mouseControlDrop").html("Mouse Control (Gyro)");
		} else {
			$("#mouseControlDrop").html("Mouse Control (Analog)");
			clientSettings.mouseControl = "ANALOG";
		}
		if (clientSettings.debug) {
			$("#dev-btn").fadeIn(400);
			$("#rld-btn").fadeIn(400);
		} else {
			$("#dev-btn").fadeOut(400);
			$("#rld-btn").fadeOut(400);
		}
		if (clientSettings.rainbowEnabled) {
			rainbowAccent();
		} else {
			setAccentColor(clientSettings.accentColor.r, clientSettings.accentColor.g, clientSettings.accentColor.b, clientSettings.accentColor.a);
		}
		if (clientSettings.devToolsOnStartup) {
			openDevTools();
		}
		if (!clientSettings.firstInstall) {
			ipcRenderer.send('installScpVBus');
			ipcRenderer.send('installAudioDriver');
			$('#restartModal').modal('show');
			clientSettings.firstInstall = true;
			saveClientSettings();
		}
		if (clientSettings.autoStartStreamer) {
			connect();
		}
		if (clientSettings.autoStartup) {
			ipcRenderer.send('autoStartupOn');
		} else {
			ipcRenderer.send('autoStartupOff');
		}
		 */
	}
}
