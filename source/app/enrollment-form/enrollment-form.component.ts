import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Enrollment} from "../model/enrollment";
import './enrollment-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Session} from "../model/session";
import {Intern} from "../model/intern";
import {DialogsService} from "../_services/dialogs.service";
import {Charge} from "../model/charge";
import {Settings} from "../model/settings";

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
    public internSelected: Intern | any;
    public payment_type: string;
    public seance_fees: number;
    public seance_number: number;
    public training_fees: number;
    public enrollment_fees: number;
    public books_fees: number;
    public chargeComment: string;

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
        this.getOfflineData();
    }

    getOfflineData() {
        this.block = true;
        Promise.all([Session.getAllPaged(0, Settings.isDbLocalServer ? Number.MAX_SAFE_INTEGER : 30, 'name', '', ''),
            Intern.getAllPaged(0, Settings.isDbLocalServer ? Number.MAX_SAFE_INTEGER : 30, 'name', '', '')]).then(values => {
            this.block = false;
            this.sessions = values[0];
            this.internsFiltered = values[1];
        }, () => {
            this.block = false;
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
        });
    }

    public displayFn(intern: Intern) {
        return intern ? intern.name : '';
    }

    public displayFn2(id: number) {
        const session: Session | undefined= this.sessions.find(s => s.id === Number(id));
        return session ? session.name + ' - ' + session['training'] + ' - ' +
            session['instructor'] : '';
    }

    public sessionOnSelect(id: number) {
        this.enrollment.session_id = id;
        this.onSessionChange();
    }

    onSessionChange() {
        if (this.enrollment.session_id && this.internSelected) {
            this.block = true;
            Enrollment.getAllByIntern(this.internSelected.id).then(enrollments => {
                this.block = false;
                if (enrollments.some(enrollment => enrollment.session_id === this.enrollment.session_id)) {
                    (this.enrollment.session_id as any) = undefined;
                    this.messagesService.notifyMessage(this.translate.instant('messages.intern_already_enrolled'), '', 'error');
                } else {
                    const session = this.sessions.find(s => this.enrollment.session_id === s.id);
                    this.training_fees = session ? session['training_fees'] : 0;
                    this.books_fees = session ? session['books_fees'] : 0;
                    this.enrollment_fees = session ? session['enrollment_fees'] : 0;
                    this.payment_type = session ? session['payment_type'] || 'total' : 'total';
                    this.seance_fees = session ? session['seance_fees'] : 0;
                    this.seance_number = session ? session['seance_number'] : 0;
                }
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            })
            Promise.all([Enrollment.getAllBySession(Number(this.enrollment.session_id)), Session.get(Number(this.enrollment.session_id))]).then(values => {
                if (values[0].length >= values[1].limit) {
                    (this.enrollment.session_id as any) = undefined;
                    this.messagesService.notifyMessage(this.translate.instant('messages.session_full'), '', 'error');
                }
            })
        }
    }

    public internOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.enrollmentForm.controls['intern_id'].setErrors({required: true});
            this.block = true;
            Intern.getAllPaged(0, Settings.isDbLocalServer ? Number.MAX_SAFE_INTEGER : 30, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.internsFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
        }
        //this.internsFiltered = this.interns.filter(interns => interns.name.toLowerCase().includes(event.toLowerCase()));
    }

    public sessionOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.enrollmentForm.controls['session_id'].setErrors({required: true});
            this.block = true;
            Session.getAllPaged(0, Settings.isDbLocalServer ? Number.MAX_SAFE_INTEGER : 30, 'name', '', event.target.value, true).then(
                users => {
                    this.block = false;
                    this.sessions = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
        }
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
            } else if (res.in) {
                this.express = true;
                this.getInternToEnroll(res.in)
            } else {
                this.isOnEdit = false;
                this.express = true;
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
                Intern.get(this.enrollment.intern_id as number).then(intern => {
                        this.internSelected = intern
                        if (this.isOnEdit || this.express) {
                            this.enrollmentForm.controls['intern_id'].disable();
                        }
                    }
                );
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
        const charge = Number(this.enrollment_fees) + Number(this.books_fees) + Number(this.training_fees) + Number(this.seance_fees);
        if (charge > 0) {
            this.onSaveOrUpdate();
        } else {
            this.dialogsService
                .confirm('messages.warning_title', 'messages.zero_charge_message', true, 'usd')
                .subscribe(confirm => {
                    if (confirm) {
                        this.onSaveOrUpdate();
                    }
                });
        }
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
                if (this.isOnEdit) {
                    this.block = false;
                    this.goBack();
                    this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                } else {
                    this.manageInternSold();
                }
            },
            () => {
                this.enrollment.date = new Date(this.enrollment.date);
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }

    goToPayment(id: number) {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.go_to_payment_message', true, 'usd')
            .subscribe(confirm => {
                if (confirm) {
                    const session = this.sessions.find(s => s.id === this.enrollment.session_id);
                    this.router.navigate(['/payment/express/' + id + '/' + (session ? session.id : '')]);

                }
            });
    }

    manageInternSold() {
        let charge = 0;
        if (this.training_fees && this.payment_type !== 'seance') {
            charge = charge + Number(this.training_fees);
        } else {
            charge = charge + (Number(this.seance_fees) * Number(this.seance_number));
        }
        if (this.books_fees) {
            charge = charge + Number(this.books_fees);
        }
        if (this.enrollment_fees) {
            charge = charge + Number(this.enrollment_fees);
        }
        if (charge > 0) {
            const newCharge = new Charge();
            newCharge.amount = charge;
            newCharge.date = new Date().getTime();
            newCharge.intern = this.internSelected.id;
            newCharge.rest = charge;
            newCharge.session = this.enrollment.session_id;
            newCharge.comment = 'Calcule automatique';
            newCharge.insert().then(() => {
                this.block = false;
                Charge.getSold(newCharge.intern as number).then(sold => {
                        Intern.updateSold(newCharge.intern as number, sold[0].sold).then(() => {
                            this.goBack();
                            if (this.express) {
                                this.goToPayment(this.internSelected.id)
                            }
                        }, () => {
                            this.block = false;
                            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                        });
                    }, () => {
                        this.block = false;
                        this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    }
                )
            }, () => {
                this.block = false;
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            });
        } else {
            this.block = false;
            this.goBack();
            if (this.express) {
                this.goToPayment(this.internSelected.id)
            }
            this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');

        }
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
