import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Course} from "../model/course";
import './course-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Training} from "../model/training";

@Component({
    selector: 'app-course-form',
    templateUrl: './course-form.component.html',
})
export class CourseFormComponent implements OnInit {

    public course: Course;
    public block: boolean;
    public isOnEdit: boolean;
    public courseForm: FormGroup;
    public name: FormControl;
    public time: FormControl;
    public training_id: FormControl;
    public trainings: Array<Training> = [];

    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService) {
    }

    public ngOnInit(): void {
        this.initForm();
        this.getParams();
        this.getTrainings();
    }

    getTrainings() {
        Training.getAll().then((trainings: any) => {
            this.trainings = trainings;
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
                this.course = new Course();
            }
        });
    }

    /**
     * get data
     *
     * @param  {string} name course name
     * @returns void
     */
    public getData(id: number): void {
        Course
            .get(id)
            .then((val: Course) => (this.course = val));
    }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.time = new FormControl(null, [Validators.required]);
        this.training_id = new FormControl(null, [Validators.required]);
        this.courseForm = this.fb.group({
            name: this.name,
            time: this.time,
            training_id: this.training_id
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
        let coursePromise: Promise<any>;
        if (this.isOnEdit) {
            coursePromise = this.course.update();
        } else {
            coursePromise = this.course.insert();
        }
        this.block = true;
        coursePromise.then(
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
        this.router.navigate(['course']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
