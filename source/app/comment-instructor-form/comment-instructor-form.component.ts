import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './comment-instructor-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {CommentInstructor} from "../model/commentInstructor";
import {Instructor} from "../model/instructor";

@Component({
    selector: 'app-comment-instructor-form',
    templateUrl: './comment-instructor-form.component.html',
})
export class CommentInstructorFormComponent implements OnInit, OnChanges {

    @Input() public comment: CommentInstructor;
    public block: boolean;
    public isOnEdit: boolean;
    public commentForm: FormGroup;
    public comments: FormControl;
    public date: FormControl;
    public instructor: Instructor;

    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public  photo: any;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private router: Router,
                private translate: TranslateService,
                private route: ActivatedRoute,
    ) {
    }

    public ngOnInit(): void {
        this.initForm();
        this.getParams();
    }

    public ngOnChanges() {
        this.initForm();
        this.getParams();
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
                this.comment = new CommentInstructor();
                this.comment.date = new Date();
            }
            this.getInstructor(res.instructor);
        });
    }

    public getInstructor(id: number): void {
        Instructor
            .get(id)
            .then(val => {
                this.instructor = val;
            });
    }

    /**
     * get data
     *
     * @param  {string} name comment-instructor name
     * @returns void
     */
    public getData(id: number): void {
        CommentInstructor
            .get(id)
            .then(val => {
                this.comment = val;
                this.comment.date = new Date(Number(this.comment.date));
            });
    }

    public initForm(): void {
        this.comments = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);

        this.commentForm = this.fb.group({
            comments: this.comments,
            date: this.date,
        });
        this.commentForm.controls['date'].disable();
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
        this.comment.date = (this.comment.date as Date).getTime();
        this.comment.instructor = this.instructor.id;
        let instructorPromise: Promise<any>;
        if (this.isOnEdit) {
            instructorPromise = this.comment.update();
        } else {
            instructorPromise = this.comment.insert();
        }

    instructorPromise.then(
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
        this.router.navigate(['instructor-management/'+ this.instructor.id + '/' +  8]);
    }

    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }
}
