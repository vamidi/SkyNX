import { app, ipcMain, screen } from 'electron';
import { ChildProcessWithoutNullStreams } from 'child_process'
import { Encoding, getBounds, IBase, IClientSetting, MouseControl, log, serve } from './utils';

const { exec, spawn } = require('child_process');
import IpcMainEvent = Electron.WebContents;

const net = require('net');

let chunk: string = "";
class StreamerService implements IBase
{
    private streamerProcess: ChildProcessWithoutNullStreams = null;
    private autoChangeResolution: boolean = false;
    private streamerProcessIsRunning: boolean = false
    private restartingStream = false;

    //
    private clientSender: IpcMainEvent = null;

    private originalW: number = 1280;
    private originalH: number = 720;


    private readonly hidStreamClient = new net.Socket();

    public setDimension(width, height) { this.originalW = width; this.originalH = height; }

    public initialize(/* opt?: any */)
    {
        this.hidStreamClient.on('error', (ex) => {
            if (ex) {
                console.log("Could not connect to Switch. Connection timed out...");
                setTimeout(() => this.connect(), 1000);
            }
        });

        this.hidStreamClient.on('connect', () => {
            this.hidStreamClient.setNoDelay(true);
            console.log('Connected to Switch!');
        });

        this.hidStreamClient.on('data', (chunk) => {
            chunk += chunk.toString();
            console.log(chunk);
            const data = Buffer.from(chunk, 'hex');
            console.log(data);
        });

        this.hidStreamClient.on('end', () => {
            console.log('disconnected from server');
        });

        this.connect();

        // Register events
        ipcMain.on('connect', (event, arg) => {
            console.log('connected');
            this.clientSender = event.sender;
            this.startStreamer(arg);
        });

        ipcMain.on('restart', (event, arg) => {
            this.streamerProcess.kill();
            this.restartingStream = true;
            this.startStreamer(arg);
        });
        ipcMain.on('kill', (_/*, arg */) => {
            this.streamerProcess.kill();
        });

        ipcMain.on('autoChangeResolutionOn', (_/*, fullMessage */) => {
            this.autoChangeResolution = true;
        });

        ipcMain.on('autoChangeResolutionOff', (_/*, fullMessage */) => {
            if (this.autoChangeResolution) {
                StreamerService.changeScreenRes(this.originalW, this.originalH);
            }
            this.autoChangeResolution = false;
        });

        ipcMain.on("restartComputer", (_/*, fullMessage */) => {
            exec("shutdown -r -t 0");
        });

        ipcMain.on('consoleCommand', (_, /*, fullMessage */) => {
            // TODO Will add later
            // const args = fullMessage.split(" ");
            // const command = args.shift().toLowerCase();
        });
    }

    public stopStreamer() {
        if (this.autoChangeResolution) {
            StreamerService.changeScreenRes(this.originalW, this.originalH);
        }
        this.streamerProcessIsRunning = false;
        this.streamerProcess.kill();
    }

    private connect()
    {
        this.hidStreamClient.connect({
            host: 'localhost',
            port: 4200,
        });
    }

    private startStreamer(args: IClientSetting) {
        let [captureW, captureH] = getBounds();

        if (this.autoChangeResolution && !this.restartingStream) {
            StreamerService.changeScreenRes(1280, 720);
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

        this.hidStreamClient.write('world!\r\n');

        return;

        // TODO remove when actually deploy
        this.streamerProcess = spawn(`${cwd}/NxStreamingService.exe`, spawnArgs, {cwd: cwd, stdio: "pipe"});
        this.streamerProcess.stdout.on("data", data => {
            log(`${data}`);
            if (!this.streamerProcessIsRunning) {
                this.streamerProcessIsRunning = true;
                this.restartingStream = false;
                this.clientSender.send("started");
            }
        });
        this.streamerProcess.stderr.on('data', (data) => {
            log(`${data}`);
            if (!this.streamerProcessIsRunning) {
                this.streamerProcessIsRunning = true;
                this.restartingStream = false;
                this.clientSender.send("started");
            }
        });
        this.streamerProcess.on('close', (code) => {
            this.clientSender.send("close");
            log(`streamerProcess process exited with code ${code}`);
            this.streamerProcessIsRunning = false;
            if (this.autoChangeResolution && !this.restartingStream) {
                StreamerService.changeScreenRes(this.originalW, this.originalH);
            }
        });
    }

    private static changeScreenRes(width: number, height: number) {
        const df = __dirname + "\\NxStreamingService\\lib\\ChangeScreenResolution.exe"
        exec(df + " /w=" + width + " /h=" + height + " /d=0");
    }
}

export const streamerService = new StreamerService();
export default streamerService;