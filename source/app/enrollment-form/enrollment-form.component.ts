import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Enrollment} from "../model/enrollment";
import './enrollment-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Session} from "../model/session";
import {Intern} from "../model/intern";
import {Training} from "../model/training";
import {DialogsService} from "../_services/dialogs.service";

@Component({
    selector: 'app-enrollment-form',
    templateUrl: './enrollment-form.component.html',
})
export class EnrollmentFormComponent implements OnInit {

    @Output() public next: EventEmitter<any> = new EventEmitter()
    public enrollment: Enrollment = new Enrollment();
    public block: boolean;
    public isOnEdit: boolean;
    public express: boolean;
    public enrollmentForm: FormGroup;
    public date: FormControl;
    public comment: FormControl;
    public intern_id: FormControl;
    public session_id: FormControl;
    public interns: Array<Intern> = [];
    public sessions: Array<Session> = [];
    public internsFiltered: Array<Intern> = [];
    public internSelected: Intern;
    public training_fees: boolean;
    public enrollment_fees: boolean;
    public books_fees: boolean;
    public backpack: boolean

    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private dialogsService: DialogsService,
                private translate: TranslateService) {
    }

    public ngOnInit(): void {
        this.initForm();
        this.getParams();
        this.getSessions();
    }

    getSessions() {
        this.block = true;
        Session.getAll().then(values => {
            this.block = false;
            this.sessions = values;
        }, ()=> {
            this.block = false;
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
        });
    }

    public displayFn(intern: Intern) {
        return intern ? intern.name : '';
    }

    onSessionChange() {
        if(this.enrollment.session_id && this.internSelected){
            this.block = true;
            Enrollment.getAllByIntern(this.internSelected.id).then(enrollments => {
                this.block = false;
                if(enrollments.some(enrollment => enrollment.session_id === this.enrollment.session_id)) {
                    (this.enrollment.session_id as any) = undefined;
                    this.messagesService.notifyMessage(this.translate.instant('messages.intern_already_enrolled'), '', 'error');
                }
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            })
            Promise.all([Enrollment.getAllBySession(Number(this.enrollment.session_id)), Session.get(Number(this.enrollment.session_id))]).then(values => {
                if(values[0].length >= values[1].limit){
                    (this.enrollment.session_id as any) = undefined;
                    this.messagesService.notifyMessage(this.translate.instant('messages.session_full'), '', 'error');
                }
            })
        }
    }

    public internOnChange(event: any): void {
        //if(event.keyCode == 13) {
            this.block = true;
            Intern.getAllPaged(0, 5, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.internsFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
        //}
        //this.internsFiltered = this.interns.filter(interns => interns.name.toLowerCase().includes(event.toLowerCase()));
    }

    public internOnSelect(intern: Intern): void {
        this.internSelected = intern;
        this.onSessionChange();
    }


    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.id) {
                this.getData(res.id);
                this.isOnEdit = true;
            } else if(res.in) {
                this.express = true;
                this.getInternToEnroll(res.in)
            } else {
                this.isOnEdit = false;
                this.enrollment = new Enrollment();
                this.enrollment.date = new Date();
            }
        });
    }

    public getInternToEnroll(id: number): void {
        Intern
            .get(id)
            .then((val: Intern) => {
                this.internSelected = val;
                this.intern_id.patchValue(val.id);
                this.enrollment.date = new Date();
            });
    }

    /**
     * get data
     *
     * @param  {string} name enrollment name
     * @returns void
     */
    public getData(id: number): void {
        Enrollment
            .get(id)
            .then((val: Enrollment) => {
                this.enrollment = val;
                this.enrollment.date = new Date(Number(this.enrollment.date));
                Intern.get(this.enrollment.intern_id as number).then(intern =>
                    this.internSelected = intern);
            });
    }

    public initForm(): void {
        this.date = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.intern_id = new FormControl(null, [Validators.required]);
        this.session_id = new FormControl(null, [Validators.required]);

        this.enrollmentForm = this.fb.group({
            date: this.date,
            comment: this.comment,
            intern_id: this.intern_id,
            session_id: this.session_id,
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
        this.enrollment.intern_id = this.internSelected.id;
        this.enrollment.date = (this.enrollment.date as Date).getTime();
        let coursePromise: Promise<any>;
        if (this.isOnEdit) {
            coursePromise = this.enrollment.update();
        } else {
            coursePromise = this.enrollment.insert();
        }
        this.block = true;
        coursePromise.then(
            () => {
                this.block = false;
                !this.isOnEdit && this.manageInternSold();
                if(this.express){
                    this.goToPayment(this.internSelected.id)
                }else {
                    this.goBack();
                }
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }

    goToPayment(id: number) {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.go_to_payment_message', true, 'usd')
            .subscribe(confirm => {
                if (confirm) {
                    const session = this.sessions.find(s => s.id === this.enrollment.session_id );
                    this.router.navigate(['/payment/express/' + id + '/' + (session ? session.training_id : '')]);

                }
            });
    }

    manageInternSold() {
        Session.get(this.enrollment.session_id as number).then(session => {
            Training.get(session.training_id as number).then(training => {
                if (this.training_fees) {
                    this.internSelected.sold =  Number(this.internSelected.sold) + Number(training.training_fees);
                }
                if (this.backpack) {
                    this.internSelected.comment = (this.internSelected.comment || '') +   '\n 1 sac à dos \n';
                }
                if (this.books_fees) {
                    this.internSelected.sold = Number(this.internSelected.sold) + Number(training.books_fees);
                }
                if (this.enrollment_fees) {
                    this.internSelected.sold = Number(this.internSelected.sold) + Number(training.enrollment_fees);
                }
                this.block = true;
                this.internSelected.sold = Number(Number(this.internSelected.sold).toFixed(0));
                Intern.updateSoldAndComment(this.internSelected.id, this.internSelected.sold,this.internSelected.comment).then(() => this.block = false,
                    () => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                })
            })
        })
    }


    goBack() {
        this.router.navigate(['enrollment']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }


}