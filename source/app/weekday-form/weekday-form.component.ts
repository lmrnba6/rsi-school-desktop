import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Weekday} from "../model/weekday";
import './weekday-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Session} from "../model/session";
import {Room} from "../model/room";
import {Training} from "../model/training";
import * as  Moment from 'moment';
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment);

@Component({
    selector: 'app-weekday-form',
    templateUrl: './weekday-form.component.html',
})
export class WeekdayFormComponent implements OnInit, OnChanges {

    @Input() public weekday: Weekday;
    public block: boolean;
    public isOnEdit: boolean;
    public weekdayForm: FormGroup;
    public name: FormControl;
    public time: FormControl;
    public room_id: FormControl;
    public session_id: FormControl;
    public sessions: Array<Session> = [];
    public rooms: Array<Room> = [];
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public training: Training;
    public days = [
        'saturday',
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
    ];
    public times: Array<string> = []

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService) {
    }

    public ngOnInit(): void {
        this.initForm();
        this.getParams();
        this.getSessions();
        this.getRooms();
    }

    public ngOnChanges(): void {
        this.initForm();
        this.getParams();
        this.getSessions();
        this.getRooms();
    }

    getSessions() {
        Session.getAll().then((sessions: any) => {
            this.sessions = sessions;
        });
    }

    getRooms() {
        Room.getAll().then((rooms: any) => {
            this.rooms = rooms;
        });
    }

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
                this.onSessionChange();
            });
    }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.time = new FormControl(null, [Validators.required]);
        this.session_id = new FormControl(null, [Validators.required]);
        this.room_id = new FormControl(null, [Validators.required]);
        this.weekdayForm = this.fb.group({
            name: this.name,
            time: this.time,
            session_id: this.session_id,
            room_id: this.room_id,
        });
    }

    /**
     * onSave
     */
    public onSave(): void {
        this.onSaveOrUpdate();
    }
    

    /**
     * onSave
     */
    public onSaveOrUpdate(): void {
        let coursePromise: Promise<any>;
        if (this.isOnEdit) {
            coursePromise = this.weekday.update();
        } else {
            coursePromise = this.weekday.insert();
        }
        this.block = true;
        coursePromise.then(
            () => {
                this.block = false;
                this.goBack();
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }

    onSessionChange() {
        Session.get(this.weekday.session_id as number).then(session => {
            Training.get(session.training_id as number).then( training => {
                this.training = training;
                //this.getTimes(this.training);
                this.generateTime();
                this.onChange();
            })
        })
    }

    onChange() {
        if(this.weekday.name && this.weekday.room_id && this.weekday.session_id) {
            //this.getTimes(this.training);
            this.generateTime();
            Promise.all([Weekday.getAllByRoomAndName(this.weekday.room_id as number, this.weekday.name),
                Weekday.getAllBySessionAndName(this.weekday.session_id as number, this.weekday.name)]).then(weekdays => {
                this.times = this.times.filter(time => !weekdays[0].some(weekday =>
                    this.overlaps(weekday.time, time)));
                this.times = this.times.filter(time => !weekdays[1].find(weekday =>
                    this.overlaps(weekday.time, time)));
                this.isOnEdit && this.times.push(this.weekday.time);
            });
        }
    }

    overlaps(time1: string, time2: string) {
        const start1 = moment(time1.slice(0,5), 'LT');
        const end1 = moment(time1.slice(-5), 'LT');
        const range1 = moment.range(start1, end1);
        const start2 = moment(time2.slice(0,5), 'LT');
        const end2 = moment(time2.slice(-5), 'LT');
        const range2 = moment.range(start2, end2);
        return range1.overlaps(range2);
    }
    
    generateTime() {
        let d = new Date();
        d.setHours(0,0,0,0);
        let date = d.getDate();
        let timeArr: any = [];
        while ( date == d.getDate() )
        {
            let hours: any = d.getHours();
            let minutes: any = d.getMinutes();
            let end = d.getHours() + Number(this.training.time);
            hours = hours == 0 ? 0: hours;
            hours = ( "0" + hours ).slice(-2);
            minutes = ( "0" + d.getMinutes() ).slice(-2);
            timeArr.push( hours + ":" + minutes + ' - ' + end + ":" + minutes);
            d.setMinutes( d.getMinutes() + 15);
        }
        this.times = timeArr.slice( 28, 85 );
    }

    // private getTimes(training: Training) {
    //     const index = Number(training.time);
    //     let start = 9;
    //     let array: Array<string> = [];
    //     while (start < 19) {
    //         array.push(`${start}h - ${start + index}h`);
    //         start = start + index;
    //     }
    //     this.times = array;
    // }

    goBack() {
        this.router.navigate(['weekday']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
