import { Injectable } from '@angular/core';
import { Encoding, IClientSetting, IClientTypes, MouseControl } from '../interfaces/client.interface';
import { ElectronService } from './electron/electron.service';
import { UtilsService } from './utils.service';

const CLIENT_SETTINGS_PATH: string = 'src/assets/data/settings.json';

@Injectable({ providedIn: 'root' })
export class ClientService
{
	private running: boolean = false;
	private clientSettings: IClientSetting = {
		debug: false,
		accentColor: {
			r: 50,
			g: 50,
			b: 50,
			a: 0.9
		},
		rainbowEnabled: true,
		devToolsOnStartup: true,
		ip: "0.0.0.0",
		quality: 5,
		disableVideo: false,
		disableAudio: false,
		abSwap: false,
		xySwap: false,
		limitFPS: false,
		autoChangeResolution: true,
		encoding: Encoding.CPU,
		mouseControl: MouseControl.ANALOG,
		firstInstall: false,
		autoStartup: false,
	};

	public constructor(private electronService: ElectronService)
	{
		if (this.electronService.isElectron) {
			console.log(process.env);
			console.log('Run in electron');
			console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
			console.log('NodeJS childProcess', this.electronService.childProcess);

			// enable the logger.

		} else {
			console.log('Run in browser');
		}

		this.load().then((data) => this.clientSettings = data);
	}

	public get(key: keyof IClientSetting): IClientTypes
	{
		return this.clientSettings[key];
	}

	public set(key: keyof IClientSetting, value: IClientTypes)
	{
		if(this.clientSettings.hasOwnProperty(key))
		{
			(this.clientSettings as any)[key] = value;
			this.save();
			return true;
		}

		return false;
	}

	public connect()
	{
		if(this.running) return;
		this.electronService.ipcRenderer.send('connect', <IClientSetting>{
			ip: this.clientSettings.ip,
			quality: this.clientSettings.quality,
			disableVideo: this.clientSettings.disableVideo,
			disableAudio: this.clientSettings.disableAudio,
			abSwap: this.clientSettings.abSwap,
			xySwap: this.clientSettings.xySwap,
			encoding: this.clientSettings.encoding,
			limitFPS: this.clientSettings.limitFPS,
			mouseControl: this.clientSettings.mouseControl
		});

		this.running = true;
	}

	public restart()
	{
		if(!this.running) return;

		this.electronService.ipcRenderer.send('restart', <IClientSetting>{
			ip: this.clientSettings.ip,
			quality: this.clientSettings.quality,
			disableVideo: this.clientSettings.disableVideo,
			disableAudio: this.clientSettings.disableAudio,
			abSwap: this.clientSettings.abSwap,
			xySwap: this.clientSettings.xySwap,
			encoding: this.clientSettings.encoding,
			limitFPS: this.clientSettings.limitFPS,
			mouseControl: this.clientSettings.mouseControl
		});
	}

	private load(): Promise<IClientSetting> {
		if (!this.electronService.isElectron) {
			return UtilsService.httpGet('./assets/data/settings.json', {})
				.then(response => response.json());
		}
		const contents = this.electronService.getFile(CLIENT_SETTINGS_PATH).toString('utf-8');
		return Promise.resolve(JSON.parse(contents));
	}

	private save() {
		if (!this.electronService.isElectron)
			// TODO make post request to save the data
			return;

		const contents = JSON.stringify(this.clientSettings, null, "\t");
		const service = this.electronService;
		service.fs.mkdir(service.path.dirname(CLIENT_SETTINGS_PATH), { recursive: true }, (err) => {
			if (err) throw err;
			service.fs.writeFile(CLIENT_SETTINGS_PATH, contents, function (err) {
				if (err) throw err;
			});
		});
	}
}
