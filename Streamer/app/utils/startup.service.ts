import { ipcMain } from 'electron';
import { IBase } from './utils';

const AutoLaunch = require('auto-launch');

export const autoLauncher = new AutoLaunch({
	name: 'SkyNX',
	path: __dirname.replace("resources\\app\\", "") + '\\SkyNXStreamer.exe',
});

class StartupService implements IBase {

	public initialize(/* opt?: any */): void
	{
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
	}
}

export const startupService = new StartupService();
export default startupService;

