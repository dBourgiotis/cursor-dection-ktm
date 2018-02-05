import { Component, HostListener, Output, EventEmitter, Input } from '@angular/core';

declare let moment: any;
declare let c3: any;

@Component({
    moduleId: module.id,
    selector: 'app-hoverable-table',
    templateUrl: 'hoverable-table.component.html',
})
export class HoverableTableComponent {
    tds = new Array(10);
    trs = new Array(10);
    coordinatesWithTime = [];
    @Input() color = 'white';
    @Output() templateAddition: EventEmitter<any> = new EventEmitter();
    timeout: any;

    @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
        // reverse the (0,0) point
        const x = event.clientX;
        const y = window.innerHeight - event.clientY;
        const t = moment().valueOf();
        // console.log(x, y);
        const lastItem = this.coordinatesWithTime.length > 1 ? this.coordinatesWithTime.length - 1 : null;
        // Check if cursor has stop
        if (this.timeout !== undefined) {
            window.clearTimeout(this.timeout);
        }
        this.timeout = window.setTimeout(() => {
            this.coordinatesWithTime = [];
            console.log('stopped');
        }, 1000);

        this.coordinatesWithTime.push({ x: x, y: y, t: t});
    }

    @HostListener('mouseleave', ['$event']) onMouseLeave(event: MouseEvent) {
        // this.templateAddition.emit(this.coordinatesWithTime);
        this.coordinatesWithTime = [];
    }

    @HostListener('click') onClick() {
        if (this.coordinatesWithTime.length) {
            this.templateAddition.emit(this.coordinatesWithTime);
        }
        this.coordinatesWithTime = [];
    }
}
