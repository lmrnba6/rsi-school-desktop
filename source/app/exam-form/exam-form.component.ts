import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Exam} from "../model/exam";
import './exam-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Intern} from "../model/intern";
import {Session} from "../model/session";
import {AuthenticationService} from "../_services/authentication.service";
import {Instructor} from "../model/instructor";
import {User} from "../model/user";

@Component({
    selector: 'app-exam-form',
    templateUrl: './exam-form.component.html',
})
export class ExamFormComponent implements OnInit {

    public exam: Exam;
    public block: boolean;
    public isOnEdit: boolean;
    public examForm: FormGroup;
    public mark: FormControl;
    public intern_id: FormControl;
    public session_id: FormControl;
    public comment: FormControl;
    public date: FormControl;
    public time: FormControl;
    public interns: Array<Intern> = [];
    public internsFiltered: Array<Intern> = [];
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public internSelected: Intern;
    public sessions: Array<Session> = [];
    public instructor: Instructor;
    public sessionsString: string = '';


    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
                private auth: AuthenticationService) {
    }

    public ngOnInit(): void {
        this.getParams();
        const user: User = this.auth.getCurrentUser();
        if(user.role === 'teacher') {
            Instructor.getByPhone(Number(user.password)).then((ins: Instructor) => {
                this.instructor = ins;
                Session.getAllSessionsByInstructor(ins.id).then(sessions =>  sessions.forEach((s, i) => {
                    this.sessionsString = this.sessionsString +  String(s.id)
                    if(i < sessions.length-1) {
                        this.sessionsString += ','
                    }
                }));
            });
        }
    }

    parseAmount(amount: number) {
        this.exam.mark = Number(Number(amount).toFixed(2));
    }

    getSessions() {
        Session.getAllSessionByIntern(this.internSelected.id).then((sessions: any) => {
            this.sessions = sessions;
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
                this.exam = new Exam();
            }
            this.initForm();
        });
    }

    transformBooleanToInteger() {
        Object.keys(this.exam).forEach(key => {
            if(this.exam[key] === true) {
                this.exam[key] = 1;
            } else if(this.exam[key] === false) {
                this.exam[key] = 0;
            }
        })
    }

    transformIntegerToBoolean() {
        Object.keys(this.exam).forEach(key => {
            if((this.exam[key] === 'retake' || this.exam[key] === 'result') && this.exam[key] === 0 ) {
                this.exam[key] = false;
            } else if((this.exam[key] === 'retake' || this.exam[key] === 'result') && this.exam[key] === 1) {
                this.exam[key] = true;
            }
        })
    }

    /**
     * get data
     *
     * @param  {string} name exam name
     * @returns void
     */
    public getData(id: number): void {
        Exam
            .get(id)
            .then((val: Exam) => {
                this.exam = val;
                this.transformIntegerToBoolean();
                this.exam.date = new Date(Number(this.exam.date));
                Intern.get(this.exam.intern_id as number).then(
                    intern => this.internSelected = intern);
            });
    }

    public displayFn(intern: Intern) {
        return intern ? intern.name : '';
    }

    public internOnChange(event: any): void {
        if(event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.block = true;
            Intern.getAllPagedBySessions(0, 5, 'name', '', event.target.value, this.sessionsString).then(
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

    public internOnSelect(intern: Intern): void {
        this.internSelected = intern;
        this.getSessions();

    }


    public initForm(): void {
        this.mark = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.time = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.session_id = new FormControl(null, [Validators.required]);
        this.intern_id = this.isOnEdit ? new FormControl(null) :
            new FormControl(null,  [Validators.required]);

        this.examForm = this.fb.group({
            mark: this.mark,
            date: this.date,
            time: this.time,
            comment: this.comment,
            intern_id: this.intern_id,
            session_id: this.session_id
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
        this.exam.date = new Date(this.exam.date).getTime();
        this.exam.intern_id = this.internSelected.id;
        this.transformBooleanToInteger();
        let examPromise: Promise<any>;
        if (this.isOnEdit) {
            examPromise = this.exam.update();
        } else {
            examPromise = this.exam.insert();
        }
        this.block = true;
        examPromise.then(
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
        this.router.navigate(['exam']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
