import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {Session} from "../model/session";
import './session-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Instructor} from "../model/instructor";
import {Training} from "../model/training";

@Component({
    selector: 'app-session-form',
    templateUrl: './session-form.component.html',
})
export class SessionFormComponent implements OnInit, OnChanges {

    @Input() public session: Session;
    public block: boolean;
    public isOnEdit: boolean;
    public sessionForm: FormGroup;
    public name: FormControl;
    public start: FormControl;
    public end: FormControl;
    public limit: FormControl;
    public instructor_id: FormControl;
    public training_id: FormControl;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public instructors: Array<Instructor> = [];
    public trainings: Array<Training> = [];


    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private router: Router,
                private translate: TranslateService) {
    }

    public ngOnInit(): void {
        this.initForm();
        this.getParams();
        this.getTrainingsAndInstructors();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if(changes.session){
            this.getData(this.session.id);
        }
    }

    /**
     * getParams
     */
    public getParams(): void {
        if (this.session) {
            this.isOnEdit = true;
        } else {
            this.isOnEdit = false;
            this.session = new Session();
            this.session.closed = false;
        }
    }

    public getTrainingsAndInstructors(): void {
        this.block = true;
        Promise.all([Training.getAll(), Instructor.getAll()])
            .then((val) => {
                this.trainings = val[0];
                this.instructors = val[1];
                this.block = false;
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }


    /**
     * get data
     *
     * @param  {string} name session name
     * @returns void
     */
    public getData(id: number): void {
        this.block = true;
        Promise.all([Session.get(id)])
            .then((val) => {
                this.session = val[0];
                this.session.end = new Date(Number(this.session.end));
                this.session.start = new Date(Number(this.session.start));
                this.block = false;
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.start = new FormControl(null, [Validators.required]);
        this.end = new FormControl(null, [Validators.required]);
        this.limit = new FormControl(null, [Validators.required]);
        this.instructor_id = new FormControl(null, [Validators.required]);
        this.training_id = new FormControl(null, [Validators.required]);
        this.sessionForm = this.fb.group({
            name: this.name,
            start: this.start,
            end: this.end,
            limit: this.limit,
            instructor_id: this.instructor_id,
            training_id: this.training_id,
        });
    }

    onNameChange() {
        if(!this.isOnEdit) {
            Session.nameExist(this.session.name).catch(() => {
                this.session.name = '';
                this.messagesService.notifyMessage(this.translate.instant('messages.name_exist'), '', 'error');
            })
        }
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
        this.session.start = (this.session.start as Date).getTime();
        this.session.end = (this.session.end as Date).getTime();
        let internPromise: Promise<any>;
        if (this.isOnEdit) {
            internPromise = this.session.update();
        } else {
            internPromise = this.session.insert();
        }
        this.block = true;
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
        this.router.navigate(['session']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
