import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { StatsService } from '../../../@core/utils/stats.service';


@Component({
	selector: 'ngx-stats',
	templateUrl: './stats.component.html'
})
export class StatsComponent implements AfterViewInit
{
	@ViewChild('fpsChart', { static: true })
	public fpsChartCtx: ElementRef<HTMLCanvasElement>;

	@ViewChild('encodingFpsChart', { static: true })
	public encodingFpsChartCtx: ElementRef<HTMLCanvasElement>;

	public constructor(protected statsService: StatsService) { }

	public ngAfterViewInit(): void {
		const fpsCtx = this.fpsChartCtx.nativeElement.getContext('2d');
		const encodingCtx = this.encodingFpsChartCtx.nativeElement.getContext('2d');

		this.statsService.initialize(fpsCtx, encodingCtx)
	}

}