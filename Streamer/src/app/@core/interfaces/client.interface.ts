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