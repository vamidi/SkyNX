import { ipcMain } from 'electron';
import { IBase, log } from './utils';

const elevate = require('windows-elevate');

const installMsg: string = 'Driver installed!';
const installMsgError: (error: string) => string = (error: string) => 'driver install error: ' + error;

const unInstallMsg: string = 'Driver installed!';
const unInstallMsgError: (error: string) => string = (error: string) => 'driver uninstall error: ' + error;

function onResponse(msg: string, errorMsg: string, error) {
	if (error !== null) {
		log(errorMsg);
	} else {
		log(msg);
	}
}

class InstallationService implements IBase
{
	initialize(/* opt? */) {
		// Register events
		ipcMain.on('installScpVBus', (_/*, arg */) => {
			log('Installing ScpVBus driver..');
			return;


			const df = __dirname + '\\NxStreamingService\\lib\\';

			elevate.exec(df + 'devcon.exe', ['install', df + 'ScpVBus.inf', 'Root\\ScpVBus'],
				(error) => onResponse(installMsg, installMsgError(error), error),
			);
		});
		ipcMain.on('unInstallScpVBus', (_/*, arg */) => {
			log('Un-Installing ScpVBus driver..');
			return;

			const df = __dirname + '\\NxStreamingService\\lib\\';
			elevate.exec(df + 'devcon.exe', ['remove', 'Root\\ScpVBus'],
				(error) => onResponse(unInstallMsg, unInstallMsgError(error), error),
				function (error, stdout, stderr) {
					if (error !== null) {
						log('driver uninstall error: ' + error);
					} else {
						log('Driver un-installed!');
					}
				});

		});

		ipcMain.on('installAudioDriver', (_/*, arg */) => {
			log('Installing audio driver..');
			return;

			const df = __dirname + '\\NxStreamingService\\lib\\';
			elevate.exec('regsvr32', [df + 'audio_sniffer.dll'],
				(error) => onResponse(installMsg, installMsgError(error), error),
			);
		});
		ipcMain.on('unInstallAudioDriver', (_/*, arg */) => {
			log('Un-Installing audio driver..');
			return;

			const df = __dirname + '\\NxStreamingService\\lib\\';
			elevate.exec('regsvr32', ['/u', df + 'audio_sniffer.dll'],
				(error) => onResponse(unInstallMsg, unInstallMsgError(error), error),
			);
		});
	}
}

export const installationService = new InstallationService();
export default installationService;