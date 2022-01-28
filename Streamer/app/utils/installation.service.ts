import { ipcMain } from 'electron';
import { log } from './utils';

const elevate = require('windows-elevate');

const installMsg: string = 'Driver installed!';
const installMsgError: (error: string) => string = (error: string) => 'driver install error: ' + error

const unInstallMsg: string = 'Driver installed!';
const unInstallMsgError: (error: string) => string = (error: string) => 'driver uninstall error: ' + error

// Register events
ipcMain.on('installScpVBus', (event, arg) => {
	log('Installing ScpVBus driver..');
	return;


	const df = __dirname + '\\NxStreamingService\\lib\\';

	elevate.exec(df + 'devcon.exe', ['install', df + 'ScpVBus.inf', 'Root\\ScpVBus'],
		(error) => onResponse(installMsg, installMsgError(error), error),
	);
});
ipcMain.on('unInstallScpVBus', (event, arg) => {
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

ipcMain.on('installAudioDriver', (event, arg) => {
	log('Installing audio driver..');
	return;

	const df = __dirname + '\\NxStreamingService\\lib\\';
	elevate.exec('regsvr32', [df + 'audio_sniffer.dll'],
		(error) => onResponse(installMsg, installMsgError(error), error),
	);
});
ipcMain.on('unInstallAudioDriver', (event, arg) => {
	log('Un-Installing audio driver..');
	return;

	const df = __dirname + '\\NxStreamingService\\lib\\';
	elevate.exec('regsvr32', ['/u', df + 'audio_sniffer.dll'],
		(error) => onResponse(unInstallMsg, unInstallMsgError(error), error),
	);
});

function onResponse(msg: string, errorMsg: string, error) {
	if (error !== null) {
		log(errorMsg);
	} else {
		log(msg);
	}
}