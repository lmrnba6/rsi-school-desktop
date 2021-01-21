import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Attendance} from "../model/attendance";
import './attendance-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Session} from "../model/session";
import {Room} from "../model/room";
import {Intern} from "../model/intern";
import {Weekday} from "../model/weekday";
import {Payment} from "../model/payment";
import {Charge} from "../model/charge";
import {Payment_instructor} from "../model/paymentInstructor";
import {ChargeInstructor} from "../model/chargeInstructor";
import {Instructor} from "../model/instructor";

@Component({
    selector: 'app-attendance-form',
    templateUrl: './attendance-form.component.html',
})
export class AttendanceFormComponent implements OnInit {

    public attendance: Attendance;
    public block: boolean;
    public isOnEdit: boolean;
    public attendanceForm: FormGroup;
    public date: FormControl;
    public intern_id: FormControl;
    public session_id: FormControl;
    public weekday_id: FormControl;
    public day_id: FormControl;
    public interns: Array<Intern> = [];
    public weekdays: Array<Room> = [];
    public sessions: Array<Session> = [];
    public sessionParamId: number;
    public internSelected: Intern;
    public instructorId: number;
    public day = '';
    public days = [
        'saturday',
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
    ];

    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService
    ) {
    }

    public ngOnInit(): void {
        this.initForm();
        this.getParams();
        this.getSessions();
    }


    getWeekdays() {
        this.attendance && Weekday.getAllBySessionAndName(this.attendance.session_id as number, this.day).then((weekdays: any) => {
            this.weekdays = weekdays;
        });
    }

    getSessions() {
        Session.getAll().then(sessions => {
            this.sessions = sessions;
            this.attendanceForm.controls['session_id'].patchValue(this.sessionParamId);
            this.attendance.session_id = this.sessionParamId;
            if (this.instructorId) {
                this.sessions = this.sessions.filter(session => session.instructor_id === this.instructorId);
                this.onInternsChange();
            }
        });
    }

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            this.sessionParamId = res.sessionId
            if (res.id) {
                this.getData(res.id);
                this.isOnEdit = true;
            } else if (res.instructorId) {
                this.instructorId = Number(res.instructorId)
                this.isOnEdit = false;
                this.attendance = new Attendance();
                this.attendance.date = new Date();
            } else {
                this.isOnEdit = false;
                this.attendance = new Attendance();
                this.attendance.date = new Date();
            }
        });
    }

    /**
     * get data
     *
     * @param  {string} name attendance name
     * @returns void
     */
    public getData(id: number): void {
        Attendance
            .get(id)
            .then((val: Attendance) => {
                this.attendance = val;
                this.attendance.date = new Date(Number(this.attendance.date));
                Intern.get(this.attendance.intern_id as number).then(intern => this.internSelected = intern);
                Weekday.get(this.attendance.weekday_id as number).then(weekday => {
                    this.day = weekday.name;
                    this.getWeekdays();
                });
                this.getSessions();
            });
    }

    public initForm(): void {
        this.date = new FormControl(null, [Validators.required]);
        this.session_id = new FormControl(null, [Validators.required]);
        this.weekday_id = new FormControl(null, [Validators.required]);
        this.day_id = new FormControl(null, [Validators.required]);

        this.attendanceForm = this.fb.group({
            date: this.date,
            session_id: this.session_id,
            weekday_id: this.weekday_id,
            day_id: this.day_id
        });
    }

    /**
     * onSave
     */
    public onSave(): void {
        if (this.isOnEdit) {
            this.onSaveOrUpdate();
        } else {
            this.saveMultiple();
        }
    }

    saveMultiple() {
        const internsPromise: Array<Promise<any>> = [];
        this.attendance.date = (this.attendance.date as Date).getTime();
        this.interns.forEach(intern => {
            this.attendance.intern_id = intern.id;
            this.attendance.present = intern['selected'];
            internsPromise.push(this.attendance.insert());
        });
        this.block = true;
        Promise.all(internsPromise).then(() => {
                this.block = false;
                const session: Session | undefined = this.sessions.find(s => s.id === this.attendance.session_id);
                if (session && session['payment_type'] === 'seance') {
                    this.handleCharge(session);
                } else {
                    this.goBack();
                }
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.attendance.date = new Date(this.attendance.date);
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }

    async handleCharge(session: Session) {
        try {
            this.block = true;
            for (const intern of this.interns) {
                const due = await Payment.getPaymentDueBySessionToDate(intern.id, session.id, session['seance_fees']);
                const charged = await Payment.getChargeDoneBySessionToDate(intern.id, session.id);
                const done = await Payment.getPaymentDoneBySessionToDate(intern.id, session.id);
                const diff = ((Number(due) || 0) + (Number(session['enrollment_fees']) || 0) + (Number(session['books_fees']) || 0)) - (Number(done) || 0) - (Number(charged) || 0);
                if (diff >= 0) {
                    const newCharge = new Charge();
                    newCharge.amount = Number(session['seance_fees']) * Number(session['seance_number']);
                    newCharge.date = new Date().getTime();
                    newCharge.intern = intern.id;
                    newCharge.rest = Number(session['seance_fees']) * Number(session['seance_number']);
                    newCharge.session = session.id;
                    newCharge.comment = 'Calcule automatique';
                    await newCharge.insert();
                    await Intern.updateSold(intern.id, Number(intern.sold) + Number(newCharge.amount));
                }
            }
            const instructor :Instructor = await Instructor.get(session.instructor_id as number);
            const due = await Payment_instructor.getPaymentInstructorDueBySessionToDate(instructor.id, session.id, session['instructor_fees']);
            const charged = await Payment_instructor.getChargeDoneBySessionToDate(instructor.id, session.id);
            const done = await Payment_instructor.getPaymentInstructorDoneBySessionToDate(instructor.id, session.id);
            const diff = (Number(due) || 0) - (Number(done) || 0) - (Number(charged) || 0);
            if (diff >= (Number(session['instructor_fees']) || 0) * (Number(session['seance_number']) || 0)) {
                const newCharge = new ChargeInstructor();
                newCharge.amount = Number(session['instructor_fees']) * Number(session['seance_number']);
                newCharge.date = new Date().getTime();
                newCharge.instructor = instructor.id;
                newCharge.rest = Number(session['instructor_fees']) * Number(session['seance_number']);
                newCharge.session = session.id;
                newCharge.comment = 'Calcule automatique';
                await newCharge.insert();
                await Instructor.updateSold(instructor.id, Number(instructor.sold) + Number(newCharge.amount));
            }
            this.block = false;
            this.goBack();
        }catch (e) {
            this.block = false;
            this.goBack();
        }
    }

    /**
     * onSave
     */
    public onSaveOrUpdate(): void {
        this.attendance.present = this.attendance.present ? 1 : 0;
        this.attendance.date = (this.attendance.date as Date).getTime();
        let coursePromise: Promise<any>;
        if (this.isOnEdit) {
            coursePromise = this.attendance.update();
        } else {
            coursePromise = this.attendance.insert();
        }
        this.block = true;
        coursePromise.then(
            () => {
                this.block = false;
                this.goBack();
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.attendance.date = new Date(this.attendance.date);
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }

    onDaysChange() {
        this.getWeekdays();
    }

    onInternsChange() {
        if (this.attendance.session_id) {
            Intern.getInternBySession(this.attendance.session_id as number).then(interns => {
                this.interns = interns;
                this.interns.forEach(intern => intern['selected'] = 1);
                this.getWeekdays();
            })
        }
    }

    goBack() {
        this.router.navigate([this.instructorId ? 'attendance-instructor/' + this.instructorId : 'attendance']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
