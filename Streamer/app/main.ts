import { app, BrowserWindow, screen, ipcMain } from 'electron';

import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';

import { setDimension, startStreamer, stopStreamer } from './utils';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
	serve = args.some(val => val === '--serve');
const windowStateKeeper = require('electron-window-state');

function createWindow(): BrowserWindow {
	app.commandLine.appendSwitch('high-dpi-support', 'true');

	const size = screen.getPrimaryDisplay().workAreaSize;
	let mainWindowState = windowStateKeeper({
		defaultWidth: 500,
		defaultHeight: 400
	});

	// Create the browser window.
	win = new BrowserWindow({
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: serve ? size.width : 500,
		height: serve ? size.height : 320,
		webPreferences: {
			nodeIntegration: true,
			allowRunningInsecureContent: (serve),
			contextIsolation: false,  // false if you want to run e2e test with Spectron
		},
		transparent: !serve,
		resizable: serve,
		frame: serve
	});

	mainWindowState.manage(win);
	win.setMenu(null);

	if (serve) {
		win.webContents.openDevTools();
		require('electron-reload')(__dirname, {
			electron: require(path.join(__dirname, '/../node_modules/electron'))
		});
		win.loadURL('http://localhost:4200');
	} else {
		// Path when running electron executable
		let pathIndex = './index.html';

		if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
			// Path when running electron in local folder
			pathIndex = '../dist/index.html';
		}

		win.loadURL(url.format({
			pathname: path.join(__dirname, pathIndex),
			protocol: 'file:',
			slashes: true
		}));
	}

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store window
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});

	return win;
}

try {
	const usingUI = true;
	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	// Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
	app.on('ready', () => {
		if(usingUI) setTimeout(createWindow, 400);

		const primaryDisplay = screen.getPrimaryDisplay();
		/*
		setDimension(
			primaryDisplay.bounds.width * primaryDisplay.scaleFactor,
			primaryDisplay.bounds.height * primaryDisplay.scaleFactor
		);
		*/
	});

	// Quit when all windows are closed.
	app.on('window-all-closed', () => {
		// stopStreamer();

		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	app.on('activate', () => {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (win === null) {
			createWindow();
		}
	});

} catch (e) {
	// Catch Error
	// throw e;
}

// Register events
ipcMain.on('connect', (event, arg) => {
	console.log('connected');
	// clientSender = event.sender;
	startStreamer(arg);
});

ipcMain.on('consoleCommand', (event, fullMessage) => {
	const args = fullMessage.split(" ");
	const command = args.shift().toLowerCase();
	// TODO Will add later
});