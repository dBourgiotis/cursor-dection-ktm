import { Component, HostListener, Output, EventEmitter } from '@angular/core';

declare let moment: any;
declare let c3: any;

@Component({
    moduleId: module.id,
    selector: 'app-hoverable-table',
    templateUrl: 'hoverable-table.component.html',
})
export class HoverableTableComponent {
    coordinatesWithTime = [];
    @Output() templateAddition: EventEmitter<any> = new EventEmitter();

    @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
        const x = event.clientX;
        const y = event.clientY;
        const t = moment().valueOf();
        this.coordinatesWithTime.push([x, y, t]);
    }

    @HostListener('mouseleave', ['$event']) onMouseLeave(event: MouseEvent) {
        this.templateAddition.emit(this.coordinatesWithTime);
        this.coordinatesWithTime = [];
    }
}
