import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Comment} from "../model/comment";
import './comment-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {User} from "../model/user";

@Component({
    selector: 'app-comment-form',
    templateUrl: './comment-form.component.html',
})
export class CommentFormComponent implements OnInit, OnChanges {

    @Input() public comment: Comment;
    @Output() public next: EventEmitter<any> = new EventEmitter()
    public block: boolean;
    public isOnEdit: boolean;
    public commentForm: FormGroup;
    public comments: FormControl;
    public date: FormControl;
    public userId: number;
    public page: string;
    public user: User;


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
            this.page = res.page;
            if (res.id && res.user) {
                this.getData(res.id);
                this.userId = res.user;
                this.isOnEdit = true;
            } else {
                this.userId = res.user;
                this.isOnEdit = false;
                this.comment = new Comment();
                this.comment.date = new Date();
            }
            User.getByUserName(res.user).then(user => this.user = user);
        });
    }

    /**
     * get data
     *
     * @param  {string} name comment name
     * @returns void
     */
    public getData(id: number): void {
        Comment
            .get(id)
            .then((val: Comment) => {
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
        this.comment.employee = this.user.id;
        let internPromise: Promise<any>;
        if (this.isOnEdit) {
            internPromise = this.comment.update();
        } else {
            internPromise = this.comment.insert();
        }

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

    goBack() {
        this.router.navigate([this.page + '-management/'+ this.userId]);
    }

    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }
}
