import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {User} from "../model/user";
import './user-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Instructor} from "../model/instructor";
import {Intern} from "../model/intern";

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
    public intern: FormControl;
    public instructor: FormControl;
    public name: FormControl;
    public role: FormControl;
    public instructors: Array<Instructor> = [];
    public instructorsFiltered: Array<Instructor> = [];
    public instructorSelected: Instructor | any;
    public interns: Array<Intern> = [];
    public internsFiltered: Array<Intern> = [];
    public internSelected: Intern | any;
    public roles = ['admin', 'user', 'student', 'teacher', 'parent']

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
                this.roles = ['admin', 'user', 'student', 'teacher', 'parent'];
            } else {
                this.isOnEdit = false;
                this.user = new User();
                this.roles = ['admin', 'user', 'student', 'teacher', 'parent'];
                this.initForm();
            }
        });
    }

    /**
     * get data
     *
     * @param  {string} names user name
     * @returns void
     */
    public getData(id: number): void {
        User
            .get(id)
            .then((val: User) => {
                this.user = val;
                if(this.user.role === 'student') {
                    Intern.getByUser(this.user.id).then(intern => {
                        this.internSelected = intern;
                    })
                }
                if(this.user.role === 'teacher') {
                    Instructor.getByUser(this.user.id).then(instructor => {
                        this.instructorSelected = instructor;
                    })
                }
                this.initForm();
            });
    }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.username = new FormControl(null, [Validators.required]);
        this.role = new FormControl(null, [Validators.required]);
        this.password = new FormControl(null, [Validators.required]);
        this.intern = new FormControl(null);
        this.instructor = new FormControl(null);
        this.userForm = this.fb.group({
            name: this.name,
            username: this.username,
            role: this.role,
            password: this.password,
            intern: this.intern,
            instructor: this.instructor
        });
        if(this.isOnEdit) {
            this.userForm.controls['intern'].disable();
            this.userForm.controls['instructor'].disable();
        }
    }

    public displayFn(instructor: Instructor) {
        return instructor ? instructor.name : this.instructorSelected.name;
    }

    public instructorOnChange(event: any): void {
        if(event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {            this.block = true;
            Instructor.getAllPaged(0, 10, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.instructorsFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
            this.instructorSelected = null;
        }
    }

    public instructorOnSelect(instructor: Instructor): void {
        this.instructorSelected = instructor;
        if(this.instructorSelected.user_id) {
            this.instructorSelected = null;
            this.userForm.controls['instructor'].patchValue('');
            this.messagesService.notifyMessage(this.translate.instant('messages.account_exist'), '', 'error');
        }
    }

    public displayFnIntern(intern: Intern) {
        return intern ? intern.name : '';
    }

    public internOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.block = true;
            Intern.getAllPaged(0, 10, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.internsFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
            this.internSelected = null;
        }
    }

    public onRoleChange() {
        this.internSelected = null;
        this.instructorSelected = null;
    }

    public internOnSelect(intern: Intern): void {
        this.internSelected = intern;
        if(this.internSelected.user_id) {
            this.internSelected = null;
            this.userForm.controls['intern'].patchValue('');
            this.messagesService.notifyMessage(this.translate.instant('messages.account_exist'), '', 'error');
        }
    }

    /**
     * onSave
     */
    public onSave(): void {
        this.onSaveOrUpdate();
    }

    public checkUserName(): void {
        User.getByUserName(this.user.username).then((u: User) => {
                if ((this.isOnEdit && u.id !== this.user.id) || (!this.isOnEdit && u.id)) {
                    this.user.username = '';
                    this.messagesService.notifyMessage(this.translate.instant('messages.username_exist'), '', 'error');
                }
            }
        )
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
                if(!this.isOnEdit) {
                    let updateEmployee;
                    if(this.internSelected) {
                        updateEmployee = Intern.updateUserId(this.internSelected.id, this.user.id);
                    }
                    else if (this.instructorSelected) {
                        updateEmployee = Instructor.updateUserId(this.instructorSelected.id, this.user.id);
                    }
                    if(updateEmployee) {
                        updateEmployee.then(() => this.block = false, () => {
                            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                            this.block = false;
                        });
                    }
                }
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
