import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Register} from "../model/register";
import './register-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {AuthenticationService} from "../_services/authentication.service";
@Component({
    selector: 'app-register-form',
    templateUrl: './register-form.component.html',
})
export class RegisterFormComponent implements OnInit {

    public register: Register;
    public block: boolean;
    public isOnEdit: boolean;
    public registerForm: FormGroup;
    public date: FormControl;
    public responsible: FormControl;
    public amount: FormControl;
    public comment: FormControl;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public oldPayment: number;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
                private auth: AuthenticationService
                ) {
    }

    public ngOnInit(): void {
        this.getParams();
    }

    parseAmount(amount: number) {
        this.register.amount = Number(Number(amount).toFixed(0));
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
                this.register = new Register();
                this.register.date = new Date();
            }
        });
        this.initForm();
        this.register.responsible =this.auth.getCurrentUser().username;
    }
    
    /**
     * get data
     *
     * @param  {string} name register name
     * @returns void
     */
    public getData(id: number): void {
        Register
            .get(id)
            .then((val: Register) => {
                this.register = val;
                this.oldPayment = val.amount;
                this.register.date = new Date(Number(this.register.date));
            });
    }


    public initForm(): void {
        this.amount = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.responsible = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.registerForm = this.fb.group({
            amount: this.amount,
            date: this.date,
            comment: this.comment,
            responsible: this.responsible
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
        this.register.date = (this.register.date as Date).getTime();
        this.register.username = this.auth.getCurrentUser().username;
        let internPromise: Promise<any>;
        if (this.isOnEdit) {
            internPromise = this.register.update();
        } else {
            internPromise = this.register.insert();
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

    goBack() {
        this.router.navigate(['register']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
