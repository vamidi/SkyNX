import { getBounds, IClientSetting, MouseControl, log, serve } from './utils/utils';
import { app, ipcMain, screen } from 'electron';
import { Encoding } from './utils/utils';
import { ChildProcessWithoutNullStreams } from 'child_process';
const { exec, spawn } = require('child_process');

import IpcMainEvent = Electron.WebContents;

export let streamerProcess: ChildProcessWithoutNullStreams = null;

let autoChangeResolution: boolean = false;
let streamerProcessIsRunning: boolean = false
let restartingStream = false;

//
let clientSender: IpcMainEvent = null;

let originalW: number = 1280;
let originalH: number = 720;

export function startStreamer(event, args: IClientSetting) {
    clientSender = event.sender;
    let [captureW, captureH] = getBounds();

    if (autoChangeResolution && !restartingStream) {
        changeScreenRes(1280, 720);
        captureW = 1280;
        captureH = 720;
    }

    let cwd = `${app.getAppPath()}/app/service`;
    if (!serve) {
        cwd = "./resources/app/service"
    }
    console.log(cwd);

    const spawnArgs: string[] = ["/ip", args.ip, "/q", args.quality.toString(), "/w", captureW.toString(), "/h", captureH.toString(), "/s", screen.getPrimaryDisplay().scaleFactor.toString()];

    if (args.disableVideo)
        spawnArgs.push("/noVideo");

    if (args.disableAudio)
        spawnArgs.push("/noAudio");

    if (args.abSwap)
        spawnArgs.push("/abSwap");

    if (args.xySwap)
        spawnArgs.push("/xySwap");

    if (args.encoding == Encoding.NVENC || args.encoding == Encoding.AMDVCE || args.encoding == Encoding.QSV) {
        spawnArgs.push("/e");
        spawnArgs.push(Encoding[args.encoding]);
    }

    if (args.limitFPS) {
        spawnArgs.push("/limitFPS");
    }
    spawnArgs.push("/m");
    if (args.mouseControl == MouseControl.ANALOG || args.mouseControl == MouseControl.GYRO) {
        spawnArgs.push(MouseControl[args.mouseControl]);
    }

    streamerProcess = spawn(`${cwd}/NxStreamingService.exe`, spawnArgs, { cwd: cwd, stdio: "pipe" });
    streamerProcess.stdout.on("data", data => {
        log(`${data}`);
        if (!streamerProcessIsRunning) {
            streamerProcessIsRunning = true;
            restartingStream = false;
            clientSender.send("started");
        }
    });
    streamerProcess.stderr.on('data', (data) => {
        log(`${data}`);
        if (!streamerProcessIsRunning) {
            streamerProcessIsRunning = true;
            restartingStream = false;
            clientSender.send("started");
        }
    });
    streamerProcess.on('close', (code) => {
        clientSender.send("close");
        log(`streamerProcess process exited with code ${code}`);
        streamerProcessIsRunning = false;
        if (autoChangeResolution && !restartingStream) {
            changeScreenRes(originalW, originalH);
        }
    });
}
export function stopStreamer() {
    if (autoChangeResolution) {
        changeScreenRes(originalW, originalH);
    }
    streamerProcessIsRunning = false;
    streamerProcess.kill();
}
function changeScreenRes(width: number, height: number) {
    const df = __dirname + "\\NxStreamingService\\lib\\ChangeScreenResolution.exe"
    exec(df + " /w=" + width + " /h=" + height + " /d=0");
}
export function setDimension(width, height) { originalW = width; originalH = height; }

// Register events
ipcMain.on('connect', (event, arg) => {
    console.log('connected');
    clientSender = event.sender;
    startStreamer(event, arg);
});

ipcMain.on('restart', (event, arg) => {
    streamerProcess.kill();
    restartingStream = true;
    startStreamer(event, arg);
});
ipcMain.on('kill', (event, arg) => {
    streamerProcess.kill();
});
ipcMain.on('autoChangeResolutionOn', (event, fullMessage) => {
    autoChangeResolution = true;
});
ipcMain.on('autoChangeResolutionOff', (event, fullMessage) => {
    if (autoChangeResolution) {
        changeScreenRes(originalW, originalH);
    }
    autoChangeResolution = false;
});
ipcMain.on("restartComputer", (event, fullMessage) => {
    exec("shutdown -r -t 0");
});

export default { startStreamer, stopStreamer, setDimension }