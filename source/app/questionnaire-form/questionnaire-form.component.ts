import {Component, OnInit} from '@angular/core';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './questionnaire-form.component.scss';
import {Questionnaire} from "../model/questionnaire";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {Training} from "../model/training";
import {Question} from "../model/question";
import {Answer} from "../model/answer";
import {DialogsService} from "../_services/dialogs.service";
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-questionnaire-management',
    templateUrl: './questionnaire-form.component.html',
})
export class QuestionnaireFormComponent implements OnInit {

    public questionnaire: Questionnaire;
    public selectedQuestion: Question;
    public questions: Array<Question> = [new Question()];
    public answers: Array<Answer> = [new Answer()];
    public answersDraft: Array<Answer> = [new Answer()];
    public questionnaireForm: FormGroup;
    public title: FormControl;
    public description: FormControl;
    public time: FormControl;
    public training: FormControl;
    public tabSelected: number = 0;
    public block: boolean;
    public isOnEdit: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public infoImage = `${this.getPath()}dist/assets/images/infoImage.png`;
    public assessmentImage = `${this.getPath()}dist/assets/images/assessmentImage.png`;
    public printImage = `${this.getPath()}dist/assets/images/printImage.png`;
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;
    public trainings: Array<Training> = [];
    public step = 0;

    constructor(public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private fb: FormBuilder,
                private translate: TranslateService,
                private dialogsService: DialogsService
    ) {
    }

    async drop(event: CdkDragDrop<string[]>) {
        if(event.currentIndex < this.questions.length - 1) {
            moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
            this.handleSequences();
        }
    }

    public getTrainings(): void {
        this.block = true;
        Training.getAll()
            .then((val) => {
                this.trainings = val;
                this.block = false;
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }

    getPath() {
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    public ngOnInit(): void {
        this.getParams();
        this.getTrainings();
        this.initForm();
    }

    deleteAnswer(id: number) {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.remove_answer_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    if (id > 0) {
                        this.block = true;
                        Answer.delete(id).then(() => {
                            this.block = false;
                            this.answers = this.answers.filter(x => x.id !== id);
                        }, () => {
                            this.block = false;
                            this.messagesService.notifyMessage(this.translate.instant('messages.unable_delete_relation'), '', 'error');
                        });
                    } else {
                        this.answers.pop();
                        this.answers = [...this.answers];
                    }
                }
            });
    }

    addAnswer() {
        this.answers = [...this.answers, new Answer()]
    }

    setQuestion(id: number) {
        this.selectedQuestion = this.questions.find(s => s.id === id)!;
        this.step = id;
        if(id > 0) {
            this.answersDraft = this.answers;
            this.block = true;
            Answer.getAllByQuestion(id).then((vals) => {
                this.block = false;
                this.answers = vals;
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
        } else {
            this.answers = this.answersDraft;
        }
    }

    isQuestionInValid() {
        if (!this.selectedQuestion.title || !this.selectedQuestion.type) {
            return 'messages.questionnaire_not_valid';
        } else if (this.selectedQuestion.type === 'qcm' && !this.answers.length) {
            return 'messages.questionnaire_answers_required';
        } else if (this.selectedQuestion.type === 'qcm' && this.answers.length && this.answers.some(s => !s.title.length)) {
            return 'messages.questionnaire_answer_not_valid';
        } else if (this.selectedQuestion.type === 'qcm' && this.answers.length && (!this.answers.some(s => s.correct) || this.answers.filter(s => s.correct).length > 1)) {
            return 'messages.questionnaire_correct_required';
        } else {
            return '';
        }
    }

    async saveQuestion(id: number, sequence: number) {
        const error = this.isQuestionInValid();
        if (error) {
            this.messagesService.notifyMessage(this.translate.instant(error), '', 'error');
        } else {
            this.block = true;
            let promise: Promise<any>;
            if (id > 0) {
                promise = this.selectedQuestion.update();
            } else {
                this.selectedQuestion.sequence = sequence;
                this.selectedQuestion.questionnaire = this.questionnaire.id;
                promise = this.selectedQuestion.insert();
            }
            promise.then(async () => {
                this.block = false;
                if (this.selectedQuestion.type === 'qcm') {
                    this.block = true;
                    await this.asyncForEach(this.answers, async (answer: Answer) => {
                        answer.correct = answer.correct === true ? 1 : answer.correct === false ? 0 : (answer.correct || 0);
                        if (answer.id > 0) {
                            await answer.update();
                        } else {
                            answer.question = this.selectedQuestion.id;
                            await answer.insert();
                        }
                    });
                    this.block = false;
                }
                if(this.questions[this.questions.length -1].id !== -1) {
                    this.questions = [...this.questions, new Question()];
                    this.answers = [];
                }
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
        }
    }

    async asyncForEach(array: any, callback: any) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
        this.block = false;
    }

    deleteQuestion(id: number) {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.remove_question_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    if (id > 0) {
                        this.block = true;
                        Answer.deleteByQuestion(id).then(() => {
                            Question.delete(id).then(() => {
                                this.block = false;
                                this.questions = this.questions.filter(x => x.id !== id);
                                this.handleSequences();
                            }, () => {
                                this.messagesService.notifyMessage(this.translate.instant('messages.unable_delete_relation'), '', 'error');
                                this.block = false;
                            });
                        })
                    } else {
                        this.questions.pop();
                        this.step = this.questions[this.questions.length -1].id;
                        this.questions = [...this.questions];
                    }
                }
            });
    }

    public initForm(): void {
        this.title = new FormControl(null, [Validators.required]);
        this.description = new FormControl(null);
        this.training = new FormControl(null, [Validators.required]);

        this.questionnaireForm = this.fb.group({
            title: this.title,
            description: this.description,
            training: this.training
        });
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
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
                this.questionnaire = new Questionnaire();
                (this.questionnaire.training as any) = null;
            }
        });
    }

    public onTabChange(): void {
        if(this.tabSelected === 2) {
            this.getAnswers();
        }
    }

    handleSequences() {
        this.asyncForEach(this.questions, async (question: Question, i: number) => {
            try {
                question.sequence = i + 1;
                if(question.id > 0) {
                    this.block = true;
                    question.update().then(() => {
                        this.block = false;
                    }, () => {
                        this.block = false;
                    });
                }
            } catch (e) {
                this.block = false;
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            }
        });
    }

    /**
     * get data
     *
     * @param  {string} name questionnaire name
     * @returns void
     */
    public getData(id: number): void {
        Questionnaire
            .get(id)
            .then((val: Questionnaire) => {
                this.questionnaire = val;
                Question.getAllByQuestionnaire(val.id).then((vals) => {
                    this.questions = vals;
                    const newQuestion = new Question();
                    newQuestion.sequence = this.questions.length + 1;
                    this.questions = [...this.questions, newQuestion];
                    this.step = -1;
                })
            });
    }

    handleTitle(title: string) {
        if(!this.isOnEdit){
            Questionnaire.titleExist(title).catch(() => {
                this.questionnaire.title = '';
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
        this.questionnaire.timed = this.questionnaire.timed ? 1 : 0;
        this.questionnaire.save = this.questionnaire.save ? 1 : 0;
        this.questionnaire.jump = this.questionnaire.jump ? 1 : 0;

        let internPromise: Promise<any>;
        if (this.isOnEdit) {
            internPromise = this.questionnaire.update();
        } else {
            internPromise = this.questionnaire.insert();
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

    async print () {
        let modal = window.open('', 'Test');
        modal!.document.write(document.getElementById('questionnaire')!.outerHTML );
        modal!.document.close();
        setTimeout(() => {modal!.print();}, 100);
    }

    getLetter(i: number) {
        return String.fromCharCode('A'.charCodeAt(0) + i);
    }

    async getAnswers() {
        await this.asyncForEach(this.questions, (question: Question) => {
            this.block = true;
            Answer.getAllByQuestion(question.id).then((vals) => {
                this.block = false;
                question['answers'] = vals;
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
        })
    }

    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }


    goBack() {
        this.router.navigate(['questionnaire']);
    }

}
