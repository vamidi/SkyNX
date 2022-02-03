import { ipcMain } from 'electron';

const AutoLaunch = require('auto-launch');

export const autoLauncher = new AutoLaunch({
	name: 'SkyNX',
	path: __dirname.replace("resources\\app\\", "") + '\\SkyNXStreamer.exe',
});

ipcMain.on('autoStartupOn', (event, fullMessage) => {
	if (!autoLauncher.isEnabled) {
		autoLauncher.enable();
	}
});
ipcMain.on('autoStartupOff', (event, fullMessage) => {
	if (autoLauncher.isEnabled) {
		autoLauncher.disable();
	}
});

