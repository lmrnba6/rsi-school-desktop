import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Transport} from "../model/transport";
import './transport-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Car} from "../model/car";

@Component({
    selector: 'app-transport-form',
    templateUrl: './transport-form.component.html',
})
export class TransportFormComponent implements OnInit, OnChanges {

    @Input() public transport: Transport;
    public block: boolean;
    public isOnEdit: boolean;
    public transportForm: FormGroup;
    public day: FormControl;
    public time: FormControl;
    public car: FormControl;
    public direction: FormControl;
    public comment: FormControl;
    public cars: Array<Car> = [];
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public carTimes: Array<Transport> = [];
    public timeToEdit: string;
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
        this.getCars();
    }

    public ngOnChanges(): void {
        this.initForm();
        this.getParams();
        this.getCars();
    }

    getCars() {
        Car.getAll().then((cars: any) => {
            this.cars = cars;
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
                this.transport = new Transport();
            }
        });
    }

    /**
     * get data
     *
     * @param  {string} name transport name
     * @returns void
     */
    public getData(id: number): void {
        Transport
            .get(id)
            .then((val: Transport) => {
                this.transport = val;
                this.timeToEdit = val.time;
                this.onChange();
            });
    }

    public initForm(): void {
        this.day = new FormControl(null, [Validators.required]);
        this.time = new FormControl(null, [Validators.required]);
        this.car = new FormControl(null, [Validators.required]);
        this.direction = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.transportForm = this.fb.group({
            day: this.day,
            time: this.time,
            car: this.car,
            comment: this.comment,
            direction: this.direction,
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
            coursePromise = this.transport.update();
        } else {
            coursePromise = this.transport.insert();
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


    onChange() {
        if (this.transport.day && this.transport.car) {
            this.generateTime();
            Transport.getAllByCarAndDay(this.transport.car as number, this.transport.day).then(transports => {
                this.carTimes = transports;
                // this.times = this.times.filter(time => transports.some(transport =>
                //     transport.time !== time));
                // this.isOnEdit && this.times.push(this.transport.time);
                if(this.timeExist(this.transport.time)) {
                    this.transport.time = '';
                 }
            });
        }
    }

    timeExist(time : string) {
        return this.carTimes.some(s => (s.time === time && !this.isOnEdit) || (this.isOnEdit && s.time === time && s.time !== this.timeToEdit));
    }

    generateTime() {
        let d = new Date();
        d.setHours(0, 0, 0, 0);
        let date = d.getDate();
        let timeArr: any = [];
        while (date == d.getDate()) {
            let hours: any = d.getHours();
            let minutes: any = d.getMinutes();
            hours = hours == 0 ? 0 : hours;
            hours = ("0" + hours).slice(-2);
            minutes = ("0" + d.getMinutes()).slice(-2);
            timeArr.push(hours + ":" + minutes);
            d.setMinutes(d.getMinutes() + 15);
        }
        this.times = timeArr.slice(28, 85);
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
        this.router.navigate(['transport']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
