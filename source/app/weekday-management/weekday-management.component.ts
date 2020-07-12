import { Component, OnInit } from '@angular/core';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './weekday-management.component.scss';
import {Weekday} from "../model/weekday";
@Component({
  selector: 'app-weekday-management',
  templateUrl: './weekday-management.component.html',
})
export class WeekdayManagementComponent implements OnInit {

    public weekday: Weekday;
    public tabSelected: number = 0;
    public block: boolean;
    public isOnEdit: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public infoImage = `../../dist/assets/images/infoImage.png`;
    public attendanceImage = `../../dist/assets/images/attendanceImage.png`;
    public backImage = `../../dist/assets/images/backImage.png`;

    constructor(public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router
    ) {
    }

    public ngOnInit(): void {
        this.getParams();
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }    }


    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.id) {
                this.getData(res.id);
                this.isOnEdit = true;
            } else {
                this.isOnEdit = false;
                this.weekday = new Weekday();
            }
        });
    }

    public onTabChange(): void {}

    /**
     * get data
     *
     * @param  {string} name weekday name
     * @returns void
     */
    public getData(id: number): void {
        Weekday
            .get(id)
            .then((val: Weekday) => {
                this.weekday = val;
            });
    }

    goBack() {
        this.router.navigate(['weekday']);
    }

}
