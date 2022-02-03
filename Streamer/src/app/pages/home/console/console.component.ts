import { Component, ElementRef, ViewChild } from '@angular/core';
import { LoggerService } from '../../../@core/utils/logger.service';


@Component({
	selector: 'ngx-console',
	templateUrl: './console.component.html'
})
export class ConsoleComponent
{
	@ViewChild("consoleContainer", { static: true })
	private consoleMessages: ElementRef;


	constructor(protected loggerService: LoggerService) {

	}
}