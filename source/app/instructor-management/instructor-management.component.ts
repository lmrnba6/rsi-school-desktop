import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import './instructor-management.component.scss';
import {Instructor} from "../model/instructor";
import {MessagesService} from "../_services/messages.service";
@Component({
  selector: 'app-instructor-management',
  templateUrl: './instructor-management.component.html',
})
export class InstructorManagementComponent implements OnInit {

    public instructor: Instructor;
    public tabSelected: number = 0;
    public block: boolean;
    public isOnEdit: boolean;
    public isInstructor: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

    constructor(public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router) {
    }

    public ngOnInit(): void {
        this.getParams();
    }

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.id) {
                this.getData(res.id);
                this.isOnEdit = true;
            } else if(res.instructor) {
                this.getData(res.instructor);
                this.isOnEdit = true;
                this.isInstructor = true;
            } else {
                this.isOnEdit = false;
                this.instructor = new Instructor();
            }
        });
    }

    goBack() {
        this.router.navigate(['instructor']);
    }

    public onTabChange(): void {}

    /**
     * get data
     *
     * @param  {string} name instructor name
     * @returns void
     */
    public getData(id: number): void {
        Instructor
            .get(id)
            .then((val: Instructor) => {
                this.instructor = val;
            });
    }

}
