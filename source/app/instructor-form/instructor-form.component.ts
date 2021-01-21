import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Instructor} from "../model/instructor";
import './instructor-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {User} from "../model/user";
import {AuthenticationService} from "../_services/authentication.service";

@Component({
    selector: 'app-instructor-form',
    templateUrl: './instructor-form.component.html',
})
export class InstructorFormComponent implements OnInit, OnChanges {

    @Input() public instructor: Instructor;
    public isInstructor: boolean;
    public block: boolean;
    public isOnEdit: boolean;
    public internForm: FormGroup;
    public name: FormControl;
    public phone: FormControl;
    public email: FormControl;
    public address: FormControl;
    public name_arabic: FormControl;
    public sold: FormControl;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public isAdmin: boolean;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
                private authService: AuthenticationService) {
    }

    public ngOnInit(): void {
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
        this.isInstructor = this.authService.getCurrentUser().role === 'teacher';
        this.initForm();
        this.getParams();
    }

    public ngOnChanges() {
        this.initForm();
        this.getParams();
    }

    handleName(name: string) {
        if(!this.isOnEdit){
            Instructor.nameExist(name).catch(() => {
                this.instructor.name = '';
                this.messagesService.notifyMessage(this.translate.instant('messages.name_exist'), '', 'error');
            });
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
            } else if (res.instructor) {
                this.getData(res.instructor);
                this.isOnEdit = true;
            }
            else {
                this.isOnEdit = false;
                this.instructor = new Instructor();
            }
        });
    }

    /**
     * get data
     *
     * @param  {string} name instructor name
     * @returns void
     */
    public getData(id: number): void {
        Instructor
            .get(id)
            .then((val: Instructor) => {
                this.instructor = val;
                this.instructor.isFullTime = this.instructor.isFullTime === 1 ? true : false;
            });
    }

    phoneParse() {
        this.instructor.phone = this.instructor.phone.toString().slice(0, 9)
    }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.email = new FormControl(null, [Validators.required, Validators.email]);
        this.address = new FormControl(null);
        this.phone = new FormControl(null, [Validators.required]);
        this.name_arabic = new FormControl(null);
        this.sold = new FormControl({value: 0, disabled:true});


        this.internForm = this.fb.group({
            name: this.name,
            name_arabic: this.name_arabic,
            address: this.address,
            phone: this.phone,
            email: this.email,
            sold: this.sold,
        });
        this.internForm.controls['sold'].disable();
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
        this.instructor.isFullTime = this.instructor.isFullTime ? 1 : 0;
        let internPromise: Promise<any>;
        if (this.isOnEdit) {
            internPromise = this.instructor.update();
        } else {
            internPromise = this.instructor.insert();
        }
        this.block = true;
        internPromise.then(
            () => {
                this.block = false;
                this.goBack();
                if(!this.isOnEdit){
                    this.createUser();
                }
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }

    public onPhoneChanged(): void {
        Instructor.getByPhone(Number(this.instructor.phone)).then(() => {
                this.instructor.phone = '';
                this.messagesService.notifyMessage(this.translate.instant('messages.phone_exist'), '', 'error');
            }
        )
    }

    createUser() {
        const user: User = new User();
        user.role = 'teacher';
        user.name = this.instructor.name;
        user.username = new Date().getTime().toString();;
        user.password = new Date().getTime().toString();;
        this.block = true;
        user.insert().then(
            () => {
                this.block = false;
                this.instructor.user_id = user.id;
                this.instructor.updateUser().then();
            },
            () => {
                this.block = false;
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            })
    }

    goBack() {
        this.router.navigate(['instructor']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
