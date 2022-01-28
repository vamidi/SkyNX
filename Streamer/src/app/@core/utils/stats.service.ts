import { Injectable } from '@angular/core';
import { ElectronService } from '../services/electron/electron.service';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const encodingFpsChartData: any = {
	labels: ['FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS'],
	datasets: [{
		label: 'FPS',
		data: [0],
		backgroundColor: 'rgba(0, 0, 255, 0.8)',
		borderColor: 'rgba(255, 255, 255, 0)',
		fillOpacity: .3,
		fill: true,
		borderWidth: 0,
		xAxisID: 'xAxes',
		yAxisID: 'yAxes',
	}]
};

const fpsChartData: any = {
	labels: ['FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS'],
	datasets: [{
		label: 'FPS',
		data: [0],
		backgroundColor: 'rgba(0, 0, 255, 0.8)',
		borderColor: 'rgba(255, 255, 255, 0)',
		fillOpacity: .3,
		fill: true,
		borderWidth: 0,
		xAxisID: 'xAxes',
		yAxisID: 'yAxes',
		type: 'linear',
		position: 'right',
	}]
};

@Injectable({ providedIn: 'root' })
export class StatsService
{
	private encodingFpsChart = null;
	private fpsChart = null;

	private fps = "0";
	private encodingFps: string = "0";
	private bitrate: string = "";

	constructor(electronService: ElectronService) {
		electronService.ipcRenderer.on('log', (_, generatedHTML) => this.onLog(generatedHTML));
	}

	public initialize(fpsCtx: CanvasRenderingContext2D, encodingCtx: CanvasRenderingContext2D)
	{

		this.fpsChart = new Chart(fpsCtx, {
			type: 'line',
			data: {
				labels: ['FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS'],
				datasets: [{
					label: 'FPS',
					data: [0],
					fill: true,
					backgroundColor: 'rgba(0, 0, 255, 0.8)',
					borderColor: 'rgba(255, 255, 255, 0)',
					tension: 0.1
				}]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true,
						max: 60
					}
				}
			}
		});

		this.fpsChart = new Chart(encodingCtx, {
			type: 'line',
			data: {
				labels: ['FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS', 'FPS'],
				datasets: [{
					label: 'FPS',
					data: [0],
					fill: true,
					backgroundColor: 'rgba(0, 0, 255, 0.8)',
					borderColor: 'rgba(255, 255, 255, 0)',
					tension: 0.1
				}]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true,
						max: 60
					}
				}
			}
		});

		/*

		this.fpsChart = new Chart(fpsCtx, {
			type: 'line',
			data: fpsChartData,
			options: {
				maintainAspectRatio: false,
				elements: {
					point: {
						radius: 0
					}
				},
				scales: {
					yAxis: {
						type: 'linear',
						position: 'left',
						beginAtZero: true,
						max: 60
					},
					xAxes: {
						type: 'linear',
						position: 'right',
						ticks: {
							display: false //this will remove only the label
						}
					}
				}
			}
		});
		this.encodingFpsChart = new Chart(encodingCtx, {
			type: 'line',
			data: encodingFpsChartData,
			options: {
				maintainAspectRatio: false,
				elements: {
					point: {
						radius: 0
					}
				},
				scales: {
					yAxis: {
						type: 'linear',
						position: 'left',
						beginAtZero: true,
						max: 60
					},
					xAxes: {
						type: 'linear',
						position: 'right',
						ticks: {
							display: false //this will remove only the label
						}
					}
				}
			}
		});
		 */
	}

	private onLog(generatedHTML: string)
	{
		if(generatedHTML.includes("fps="))
		{
			this.encodingFps = generatedHTML.includes("fps= ") ? generatedHTML.split("fps= ")[1].split(" ")[0]
				: generatedHTML.split("fps=")[1].split(" ")[0];

			encodingFpsChartData.datasets[0].data.push(parseInt(this.encodingFps));
			if (encodingFpsChartData.datasets[0].data.length > 40) {
				encodingFpsChartData.datasets[0].data.shift();
			}

			encodingFpsChartData.labels = StatsService.genrateLabelList("FPS", encodingFpsChartData.datasets[0].data.length);
			this.encodingFpsChart.update(0);
		}

		if (generatedHTML.includes("switchFps="))
		{
			this.fps = generatedHTML.split("switchFps=")[1].split(" ")[0].replace("<br>", "");

			fpsChartData.datasets[0].data.push(parseInt(this.fps));
			if (fpsChartData.datasets[0].data.length > 40) {
				fpsChartData.datasets[0].data.shift();
			}

			fpsChartData.labels = StatsService.genrateLabelList("FPS", fpsChartData.datasets[0].data.length);
			this.fpsChart.update(0);
		}
	}

	private static genrateLabelList(label, length): string[] {
		const labels: string[] = [];
		while (length > 0) {
			labels.push(label);
			length--;
		}
		return labels;
	}
}