import { Component, HostListener, Output, EventEmitter, Input } from '@angular/core';

declare let moment: any;
declare let c3: any;

@Component({
    moduleId: module.id,
    selector: 'app-hoverable-table',
    templateUrl: 'hoverable-table.component.html',
})
export class HoverableTableComponent {
    coordinatesWithTime = [];
    @Input() color = 'white';
    @Output() templateAddition: EventEmitter<any> = new EventEmitter();

    @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
        const x = event.clientX;
        const y = event.clientY;
        const t = moment().valueOf();
        // const t = moment().format();
        this.coordinatesWithTime.push({ x: x, y: y, t: t});
    }

    @HostListener('mouseleave', ['$event']) onMouseLeave(event: MouseEvent) {
        // this.templateAddition.emit(this.coordinatesWithTime);
        this.coordinatesWithTime = [];
    }

    @HostListener('click') onClick() {
        this.templateAddition.emit(this.coordinatesWithTime);
        this.coordinatesWithTime = [];
    }
}
