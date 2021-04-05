import {Component, OnDestroy, OnInit} from '@angular/core';
import './test.component.scss';
import {DialogsService} from "../_services/dialogs.service";
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Intern} from "../model/intern";
import {Questionnaire} from "../model/questionnaire";
import {Question} from "../model/question";
import {Answer} from "../model/answer";
import {TranslateService} from "@ngx-translate/core";
import {Exam} from "../model/exam";
import {Location} from "@angular/common";
import {Mark} from "../model/mark";

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html'
})
export class TestComponent implements OnInit {
    public interval: any;
    public intern: Intern;
    public questionnaire: Questionnaire;
    public exam: Exam;
    public questions: Array<Question> = [];
    public marks: Array<Mark> = [];
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public timeLeft: any;
    public testStarted: boolean;
    public testDone: boolean;
    public currentQuestion: Question;

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private location: Location) {
    }

    canDeactivate() {
        if(this.testStarted && !this.testDone) {
            return false;
        } else {
            return true;
        }
    }

    ngOnInit() {
        this.getParams();
    }

    getParams() {
        this.route.params.subscribe(res => {
            this.getData(res.questionnaire, res.intern, res.exam);
        });
    }

    startTimer() {
        this.interval = setInterval(() => {
            if (this.timeLeft > 1) {
                this.timeLeft--;
            } else {
                this.testDone = true;
                clearInterval(this.interval);
                this.done();
            }
        }, 1000 * 60)
    }


    getData(q, i, e) {
        this.block = true;
        Promise.all([Questionnaire.get(q), Intern.get(i), Exam.get(e)]).then(values => {
            this.questionnaire = values[0];
            this.intern = values[1];
            this.exam = values[2];
            this.block = false;
            this.buildQuestions();
        }, () => {
            this.location.back();
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        });
    }

    buildQuestions() {
        Question.getAllByQuestionnaire(this.questionnaire.id).then(q => {
            this.questions = q;
            const list: Array<Promise<Array<Answer>>> = [];
            q.forEach(qs => {
                list.push(Answer.getAllByQuestion(qs.id));
            });
            this.block = true;
            Promise.all(list).then(answers => {
                this.block = false;
                answers.forEach((a, i) => {
                    this.questions[i]['answers'] = a;
                });
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            })
        });
    }

    back() {
        this.router.navigate(['intern-management/' + this.intern.id + '/4'])
    }

    start() {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.start_test_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    this.startTest();
                }
            });
    }

    getLetter(i: number) {
        return String.fromCharCode('A'.charCodeAt(0) + i);
    }

    onAnswerChange(a: Answer) {
        this.currentQuestion['answer'] = a
    }

    next() {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.next_question_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    if (this.currentQuestion.sequence >= this.questions.length && this.currentQuestion['answer']) {
                        this.saveAnswer(true);
                        this.back()
                    } else {
                        this.saveAnswer(false);
                    }
                }
            });
    }

    done() {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.exam_done_message', true, 'warning-sign')
            .subscribe(() => this.back());
    }

    saveAnswer(exit: boolean) {
        const mark = this.currentQuestion['mark'] || new Mark();
        mark.answer = this.currentQuestion.type === 'qcm' ? this.currentQuestion['answer'].title : this.currentQuestion['answer'];
        mark.exam = this.exam.id;
        mark.question = this.currentQuestion.id;
        const promise = mark.id > 0 ? mark.update() : mark.insert();
        this.block = true;
        promise.then(() => {
            this.block = false;
            this.currentQuestion['mark'] = mark;
            if (exit) {
                this.testDone = true;
                this.done();
            } else {
                this.currentQuestion = this.questions[this.currentQuestion.sequence]
            }
        }, () => {
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        });
    }

    previous() {
        this.currentQuestion = this.questions[this.currentQuestion.sequence - 2]
    }

    startTest() {
        const promises: Array<any> = [];
        this.block = true;
        Mark.getAllByExamAndQuestionnaire(this.exam.id).then(vals => {
            vals.forEach(v => promises.push(Mark.delete(v.id)));
            this.block = true;
            Promise.all(promises).then(() => {
                this.block = true;
                this.exam.passed = true;
                Exam.passTest(this.exam.id).then(() => {
                    this.block = false;
                    this.timeLeft = this.exam.time;
                    if (this.questionnaire.timed) {
                        this.startTimer();
                    }
                    this.testStarted = true;
                    this.currentQuestion = this.questions[0];
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false;
                })
            },() => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            })
        },() => {
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        });
    }

}
