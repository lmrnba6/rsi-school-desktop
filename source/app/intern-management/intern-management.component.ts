import { Component, OnInit } from '@angular/core';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './intern-management.component.scss';
import {Intern} from "../model/intern";
@Component({
  selector: 'app-intern-management',
  templateUrl: './intern-management.component.html',
})
export class InternManagementComponent implements OnInit {

    public intern: Intern;
    public tabSelected: number = 0;
    public block: boolean;
    public isOnEdit: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public isIntern: boolean;
    public enrollmentImage = `../../dist/assets/images/enrollmentImage.png`;
    public chargeImage = `../../dist/assets/images/chargeImage.png`;
    public infoImage = `../../dist/assets/images/infoImage.png`;
    public commentImage = `../../dist/assets/images/commentImage.png`;
    public examImage = `../../dist/assets/images/examImage.png`;
    public weekdayImage = `../../dist/assets/images/weekdayImage.png`;
    public attendanceImage = `../../dist/assets/images/attendanceImage.png`;
    public paymentImage = `../../dist/assets/images/paymentImage.png`;
    public backImage = `../../dist/assets/images/backImage.png`;

    constructor(public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router) {
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
            } else if(res.intern) {
                this.getData(res.intern);
                this.isOnEdit = true;
                this.isIntern = true;
            } else {
                this.isOnEdit = false;
                this.intern = new Intern();
            }
        });
    }

    public onTabChange(): void {}

    /**
     * get data
     *
     * @param  {string} name intern name
     * @returns void
     */
    public getData(id: number): void {
        Intern
            .get(id)
            .then((val: Intern) => {
                this.intern = val;
            });
    }

    goBack() {
        this.router.navigate(['intern']);
    }

}
