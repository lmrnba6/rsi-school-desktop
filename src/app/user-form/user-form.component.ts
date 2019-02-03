import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {User} from "../model/user";
import './user-form.component.scss';
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-user-form',
    templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {

    public user: User;
    public block: boolean;
    public isOnEdit: boolean;
    public userForm: FormGroup;
    public username: FormControl;
    public password: FormControl;
    public name: FormControl;
    public role: FormControl;
    public roles = ['admin', 'user', 'student', 'teacher','parent']

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
                this.user = new User();
            }
        });
    }

    /**
     * get data
     *
     * @param  {string} name user name
     * @returns void
     */
    public getData(id: number): void {
        User
            .get(id)
            .then((val: User) => (this.user = val));
    }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.username = new FormControl(null, [Validators.required]);
        this.role = new FormControl(null, [Validators.required]);
        this.password = new FormControl(null, [Validators.required]);
        this.userForm = this.fb.group({
            name: this.name,
            username: this.username,
            role: this.role,
            password: this.password
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
        let userPromise: Promise<any>;
        if (this.isOnEdit) {
            userPromise = this.user.update();
        } else {
            userPromise = this.user.insert();
        }
        this.block = true;
        userPromise.then(
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
        this.router.navigate(['settings/users']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
