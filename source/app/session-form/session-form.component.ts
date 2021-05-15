import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {Session} from "../model/session";
import './session-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Instructor} from "../model/instructor";
import {Training} from "../model/training";
import {Settings} from "../model/settings";

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
    // public start: FormControl;
    // public end: FormControl;
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

    public displayFn(id: number) {
        const training: Training | undefined= this.trainings.find(s => s.id === Number(id));
        return training ? training.name : '';
    }

    public displayFn2(id: number) {
        const instructor: Instructor | undefined= this.instructors.find(s => s.id === Number(id));
        return instructor ? instructor.name : '';
    }

    public trainingOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.sessionForm.controls['training_id'].setErrors({required: true});
            this.block = true;
            Training.getAllPaged(0, Settings.isDbLocalServer ? Number.MAX_SAFE_INTEGER : 30, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.trainings = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
        }
    }

    public instructorOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.sessionForm.controls['instructor_id'].setErrors({required: true});
            this.block = true;
            Instructor.getAllPaged(0, Settings.isDbLocalServer ? Number.MAX_SAFE_INTEGER : 30, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.instructors = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
        }
    }

    /**
     * getParams
     */
    public getParams(): void {
        if (this.session) {
            this.isOnEdit = true;
            this.sessionForm.controls['training_id'].disable();
            this.sessionForm.controls['instructor_id'].disable();
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
                this.sessionForm.controls['training_id'].patchValue(this.session.training_id);
                this.sessionForm.controls['instructor_id'].patchValue(this.session.instructor_id);
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
        // this.start = new FormControl(null, [Validators.required]);
        // this.end = new FormControl(null, [Validators.required]);
        this.limit = new FormControl(null, [Validators.required]);
        this.instructor_id = new FormControl(null, [Validators.required]);
        this.training_id = new FormControl(null, [Validators.required]);
        this.sessionForm = this.fb.group({
            name: this.name,
            // start: this.start,
            // end: this.end,
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
        this.session.start = new Date().getTime();
        this.session.end = new Date().getTime();
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
                this.session.start = new Date(this.session.start);
                this.session.end = new Date(this.session.end);
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
