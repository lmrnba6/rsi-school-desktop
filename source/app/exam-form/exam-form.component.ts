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
import {Questionnaire} from "../model/questionnaire";
import {Mark} from "../model/mark";

@Component({
    selector: 'app-exam-form',
    templateUrl: './exam-form.component.html',
})
export class ExamFormComponent implements OnInit {

    public exam: Exam = new Exam();
    public block: boolean;
    public isOnEdit: boolean;
    public examForm: FormGroup;
    public mark: FormControl;
    public intern_id: FormControl;
    public session_id: FormControl;
    public comment: FormControl;
    public questionnaire_id: FormControl;
    public date: FormControl;
    public time: FormControl;
    public interns: Array<Intern> = [];
    public internsFiltered: Array<Intern> = [];
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public internSelected: Intern;
    public questionnaireSelected: Questionnaire;
    public questionnaires: Array<Questionnaire>;
    public sessions: Array<Session> = [];
    public instructor: Instructor;
    public sessionsString: string = '';
    public sessionSelected: number;
    public type: string = 'individual';
    public user: User;
    public isInstructor: boolean;
    public infoImage = `${this.getPath()}dist/assets/images/infoImage.png`;
    public assessmentImage = `${this.getPath()}dist/assets/images/assessmentImage.png`;
    public marks: Array<Mark> = [];

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
                private auth: AuthenticationService) {
    }


    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }

    getPath() {
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    public ngOnInit(): void {
        this.user = this.auth.getCurrentUser();
        this.isInstructor = this.user.role === 'teacher';
        this.getParams();
        this.getSessions(this.type);
    }

    private getSessions(type: string) {
        if (this.isInstructor) {
            Instructor.getByUser(Number(this.user.id)).then((ins: Instructor) => {
                this.instructor = ins;
                Session.getAllSessionsByInstructor(ins.id).then(sessions => {
                    this.sessions = sessions;
                });
            });
        } else {
            if (type === 'individual' && this.internSelected) {
                Session.getAllSessionByIntern(this.internSelected.id).then((sessions: any) => {
                    this.sessions = sessions;
                });
            } else if (type === 'group') {
                Session.getAll().then((sessions: any) => {
                    this.sessions = sessions;
                });
            }
        }
    }

    async print() {
        let modal = window.open('', 'Test');
        modal!.document.write(document.getElementById('questionnaire')!.outerHTML);
        modal!.document.close();
        setTimeout(() => {
            modal!.print();
        }, 100);
    }

    onTypeChanged(type: string) {
        this.getSessions(type);
        this.initForm(type);
    }


    parseAmount(amount: number) {
        this.exam.mark = Number(Number(amount).toFixed(2));
    }

    onSessionChange(session: number) {
        this.sessionSelected = session;
        this.getQuestionnaires();
    }

    getQuestionnaires() {
        Session.get(this.sessionSelected).then(session => {
            Questionnaire.getAllByTraining(session.training_id as number).then((qs: any) => {
                this.questionnaires = qs;
            });
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
                (this.exam.questionnaire_id as any) = null;
            }
            this.initForm(this.type);
        });
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
            .then((exam: Exam) => {
                exam.date = new Date(Number(exam.date));
                Promise.all([
                    Intern.get(exam.intern_id as number),
                    Session.getAllSessionByIntern(exam.intern_id as number),
                    Questionnaire.getAll(),
                    Mark.getAllByExamAndQuestionnaire(exam.id)
                ]).then(
                    val => {
                        this.internSelected = val[0];
                        this.sessions = val[1];
                        this.questionnaires = val[2];
                        this.marks = val[3];
                        this.examForm.controls['intern_id'].disable();
                        this.examForm.controls['session_id'].disable();
                        this.examForm.controls['questionnaire_id'].disable();
                        this.exam = exam;
                    });
            });
    }

    public displayFn(intern: Intern) {
        return intern ? intern.name : '';
    }

    public internOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.block = true;
            const promise = this.isInstructor ? Intern.getAllPagedByInstructor(0, 10, 'name', '',event.target.value, this.instructor.id) :
                Intern.getAllPagedBySessions(0, 10, 'name', '', event.target.value, this.sessionsString);
            promise.then(
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
        this.getSessions(this.type);

    }


    public initForm(type: string): void {
        this.mark = new FormControl(null);
        this.date = new FormControl(null, [Validators.required]);
        this.time = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.questionnaire_id = new FormControl(null);
        this.session_id = new FormControl(null, [Validators.required]);
        this.intern_id = new FormControl(null, [Validators.required]);
        const config = {
            mark: this.mark,
            date: this.date,
            time: this.time,
            comment: this.comment,
            intern_id: this.intern_id,
            session_id: this.session_id,
            questionnaire_id: this.questionnaire_id
        }
        if (type === 'group') {
            delete config.intern_id;
        }

        this.examForm = this.fb.group(config);
    }

    public onSave(): void {
        if (this.type === 'individual') {
            this.onSaveOrUpdate();
        } else {
            this.saveMultiple();
        }
    }

    saveMultiple() {
        const internsPromise: Array<Promise<any>> = [];
        this.exam.date = new Date(this.exam.date).getTime();
        Intern.getInternBySession(this.exam.session_id as number).then(interns => {
                interns.forEach(intern => {
                    this.exam.intern_id = intern.id;
                    internsPromise.push(this.exam.insert());
                });
                this.block = true;
                Promise.all(internsPromise).then(() => {
                        this.block = false;
                        this.goBack();
                        this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                    },
                    () => {
                        this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                        this.block = false;
                    });
            },
            () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }

    /**
     * onSave
     */
    public onSaveOrUpdate(): void {
        this.exam.date = new Date(this.exam.date).getTime();
        this.exam.intern_id = this.internSelected.id;
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
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                this.goBack();
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
