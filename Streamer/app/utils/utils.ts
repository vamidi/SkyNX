import { ipcMain, screen } from 'electron';
import IpcMainEvent = Electron.WebContents;

const { exec } = require('child_process');
const AU = require('ansi_up');

const ansi_up = new AU.default;

export enum Encoding {
    CPU,
    NVENC,
    AMDVCE,
    QSV
}

export enum MouseControl {
    ANALOG,
    GYRO
}

export declare type IClientTypes = null | boolean | {
    r: number,
    g: number,
    b: number,
    a: number,
} | Encoding | MouseControl | number | string;

export interface IClientSetting
{
    debug: boolean,
    accentColor: {
        r: number,
        g: number,
        b: number,
        a: number,
    },
    rainbowEnabled: boolean,
    devToolsOnStartup: boolean,
    ip: string,
    quality: number,
    disableVideo: boolean,
    disableAudio: boolean,
    abSwap: boolean,
    xySwap: boolean,
    limitFPS: boolean,
    autoChangeResolution: boolean,
    encoding: Encoding,
    mouseControl: MouseControl,
    firstInstall: boolean,
    autoStartup: boolean,
}

const args = process.argv.slice(1);
export const serve = args.some(val => val === '--serve');

export function getBounds(): [number, number]
{
    const mainScreen = screen.getPrimaryDisplay();
    const captureW = mainScreen.bounds.width * screen.getPrimaryDisplay().scaleFactor;
    const captureH = mainScreen.bounds.height * screen.getPrimaryDisplay().scaleFactor;
    return [captureW, captureH];
}

let htmlLoggingSender: IpcMainEvent = null;
export function log(str): void {
    console.log(str);
    if (htmlLoggingSender) {
        htmlLoggingSender.send('log', ansi_up.ansi_to_html(str.replace("  ", "\xa0")) + "<br>");
    }
}

ipcMain.on('registerForHTMLLogging', (event, arg) => {
    htmlLoggingSender = event.sender
});

//
ipcMain.on('donate', (event, fullMessage) => {
    const url = 'https://www.buymeacoffee.com/vamidicreations';
    const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    exec(start + ' ' + url);
});