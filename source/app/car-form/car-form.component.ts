import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Car} from "../model/car";
import './car-form.component.scss';
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-car-form',
    templateUrl: './car-form.component.html',
})
export class CarFormComponent implements OnInit, OnChanges {

    @Input() public car: Car;
    @Output() public next: EventEmitter<any> = new EventEmitter()
    public block: boolean;
    public isOnEdit: boolean;
    public carForm: FormGroup;
    public name: FormControl;
    public make: FormControl;
    public seat: FormControl;
    public comment: FormControl;
    public plate: FormControl;


    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public  photo: any;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private router: Router,
                private translate: TranslateService,
                private route: ActivatedRoute,
    ) {
    }

    public ngOnInit(): void {
        this.initForm();
        this.getParams();
    }

    public ngOnChanges() {
        this.initForm();
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
            } else {
                this.isOnEdit = false;
                this.car = new Car();
            }
        });
    }

    /**
     * get data
     *
     * @param  {string} name car name
     * @returns void
     */
    public getData(id: number): void {
        Car
            .get(id)
            .then((val: Car) => {
                this.car = val;
            });
    }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.seat = new FormControl(null, [Validators.required]);
        this.make = new FormControl(null);
        this.comment = new FormControl(null);
        this.plate = new FormControl(null);

        this.carForm = this.fb.group({
            name: this.name,
            plate: this.plate,
            comment: this.comment,
            make: this.make,
            seat: this.seat,
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
        let internPromise: Promise<any>;
        if (this.isOnEdit) {
            internPromise = this.car.update();
        } else {
            internPromise = this.car.insert();
        }

    internPromise.then(
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

    goBack() {
        this.router.navigate(['car']);
    }

    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }
}
