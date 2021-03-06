import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Training} from "../model/training";
import './training-form.component.scss';
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-training-form',
    templateUrl: './training-form.component.html',
})
export class TrainingFormComponent implements OnInit {

    public training: Training;
    public block: boolean;
    public isOnEdit: boolean;
    public trainingForm: FormGroup;
    public name: FormControl;
    public time: FormControl;
    public training_fees: FormControl;
    public books_fees: FormControl;
    public enrollment_fees: FormControl;
    public payment_type: FormControl;
    public seance_fees: FormControl;
    public instructor_fees: FormControl;
    public seance_number: FormControl;
    public type: FormControl;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    types = ['individual','mini_group', 'group', 'leisure']

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService) {
    }

    public ngOnInit(): void {
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
                this.training = new Training();
            }
        });
    }

    /**
     * get data
     *
     * @param  {string} name training name
     * @returns void
     */
    public getData(id: number): void {
        Training
            .get(id)
            .then((val: Training) => {
                this.training = val;
            });
    }

    onNameChange() {
        if(!this.isOnEdit) {
            Training.nameExist(this.training.name).catch(() => {
                this.training.name = '';
                this.messagesService.notifyMessage(this.translate.instant('messages.name_exist'), '', 'error');
            })
        }
    }


    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.time = new FormControl(null, [Validators.required]);
        this.type = new FormControl(null);
        this.training_fees = new FormControl(0, [Validators.required]);
        this.books_fees = new FormControl(0, [Validators.required]);
        this.enrollment_fees = new FormControl(0, [Validators.required]);
        this.payment_type = new FormControl(null, [Validators.required]);
        this.seance_fees = new FormControl(0);
        this.instructor_fees = new FormControl(0);
        this.seance_number = new FormControl(0);

        this.trainingForm = this.fb.group({
            name: this.name,
            time: this.time,
            type: this.type,
            training_fees: this.training_fees,
            books_fees: this.books_fees,
            enrollment_fees: this.enrollment_fees,
            payment_type: this.payment_type,
            seance_fees:this.seance_fees,
            instructor_fees: this.instructor_fees,
            seance_number: this.seance_number
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
        let trainingPromise: Promise<any>;
        if (this.isOnEdit) {
            trainingPromise = this.training.update();
        } else {
            trainingPromise = this.training.insert();
        }
        this.block = true;
        trainingPromise.then(
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
        this.router.navigate(['training']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
