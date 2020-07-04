import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Payment} from "../model/payment";
import './payment-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Intern} from "../model/intern";
import {Training} from "../model/training";
import {DialogsService} from "../_services/dialogs.service";
import {Register} from "../model/register";
import {Enrollment} from "../model/enrollment";
import {AuthenticationService} from "../_services/authentication.service";

@Component({
    selector: 'app-payment-form',
    templateUrl: './payment-form.component.html',
})
export class PaymentFormComponent implements OnInit {

    public payment: Payment;
    public block: boolean;
    public isOnEdit: boolean;
    public express: boolean;
    public offer: boolean;
    public paymentForm: FormGroup;
    public date: FormControl;
    public amount: FormControl;
    public comment: FormControl;
    public training: FormControl;
    public month: FormControl;
    public intern: FormControl;
    public interns: Array<Intern> = [];
    public internsFiltered: Array<Intern> = [];
    public internSelected: Intern | any;
    public trainingsFiltered: Array<Training> = [];
    public trainingSelected: Training | any;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public oldPayment: number;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
                private dialogsService: DialogsService,
                private auth: AuthenticationService
    ) {
    }

    public ngOnInit(): void {
        this.getParams();
    }

    parseAmount(amount: number) {
        this.payment.amount = Number(Number(amount).toFixed(0));
    }

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.id) {
                this.getData(res.id);
                this.isOnEdit = true;
            } else if (res.in && res.tr) {
                this.express = true;
                this.payment = new Payment();
                this.getInternToPay(res.in, res.tr);
            } else {
                this.isOnEdit = false;
                this.payment = new Payment();
                this.payment.date = new Date();
            }
            this.initForm();
        });
    }

    public getInternToPay(id: number, tr: number): void {
        Promise.all([Intern
            .get(id), Training.get(tr)])
            .then((val: any) => {
                this.internSelected = val[0];
                this.trainingSelected = val[1];
                this.intern.patchValue(val[0].id);
                this.training.patchValue(val[1].id);
                this.payment.date = new Date();
            });
    }

    public displayFnTraining(training: Training) {
        return training ? training.name : '';
    }

    public displayFnIntern(intern: Intern) {
        return intern ? intern.name : '';
    }

    public internOnChange(event: any): void {
        //if(event.keyCode == 13) {
        this.block = true;
        Intern.getAllPaged(0, 5, 'name', '', event.target.value).then(
            users => {
                this.block = false;
                this.internsFiltered = users
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false
            });
        this.internSelected = null;
        //}
    }

    public internOnSelect(intern: Intern): void {
        this.internSelected = intern;
        this.verifyTraining();

    }

    public trainingOnChange(event: any): void {
        //if(event.keyCode == 13) {
        this.block = true;
        Training.getAllPaged(0, 5, 'name', '', event.target.value).then(
            users => {
                this.block = false;
                this.trainingsFiltered = users
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false
            });
        this.trainingSelected = null;
        //}
    }

    public trainingOnSelect(training: Training): void {
        this.trainingSelected = training;
        this.verifyTraining();
    }

    /**
     * get data
     *
     * @param  {string} name payment name
     * @returns void
     */
    public getData(id: number): void {
        Payment
            .get(id)
            .then((val: Payment) => {
                this.payment = val;
                this.oldPayment = val.amount;
                Intern.get(this.payment.intern_id as number).then(intern => this.internSelected = intern);
                this.trainingSelected = new Training();
                this.trainingSelected.name = this.payment.training;
                this.payment.date = new Date(Number(this.payment.date));
            });
    }


    public initForm(): void {
        this.amount = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.training = this.isOnEdit ? new FormControl(null) : new FormControl(null, [Validators.required]);
        this.month = new FormControl(null);
        this.intern = this.isOnEdit ? new FormControl(null) :
            new FormControl(null, [Validators.required]);

        this.paymentForm = this.fb.group({
            amount: this.amount,
            date: this.date,
            comment: this.comment,
            training: this.training,
            month: this.month,
            intern: this.intern,
        });
    }

    /**
     * onSave
     */
    public async onSave(): Promise<void> {
        await this.onSaveOrUpdate();
    }

    verifyTraining() {
        if (this.trainingSelected && this.internSelected) {
            Enrollment.getAllByIntern(this.internSelected.id).then(enrolls => {
                const exist = enrolls.some(e => e['training'] === this.trainingSelected.name);
                if (!exist) {
                    this.training.patchValue('');
                    this.messagesService.notifyMessage(this.translate.instant('messages.notEnrolled_message'), '', 'error');
                    this.block = false;
                }
            });
        }
    }

    /**
     * onSave
     */
    public async onSaveOrUpdate(): Promise<void> {
        this.payment.error = this.payment.error ? 1 : 0;
        this.payment.intern_id = this.internSelected.id;
        this.payment.username = this.auth.getCurrentUser().username;
        this.payment.training = this.trainingSelected ? this.trainingSelected.name : this.payment.training;
        const copy: Payment = new Payment();
        copy.id = this.payment.id;
        copy.username = this.auth.getCurrentUser().username;
        copy.intern_id = this.internSelected.id;
        copy.error = this.payment.error;
        copy.training = this.trainingSelected ? this.trainingSelected.name : this.payment.training;
        copy.date = (this.payment.date as Date).getTime();
        copy.comment = this.payment.comment;
        copy.month = this.payment.month;
        copy.amount = this.payment.amount;
        const trainingAcc: number = await this.getTrainingPaidAmount(this.payment);
        this.payment.rest = this.trainingSelected.training_fees - this.payment.amount - trainingAcc;
        copy.rest = this.payment.rest;
        let internPromise: Promise<any>;
        if (this.isOnEdit) {
            internPromise = copy.update();
        } else {
            internPromise = copy.insert();
        }
        this.block = true;
        internPromise.then(
            () => {
                this.manageInternSold(this.oldPayment);
                this.goToReceipt();
                !this.offer && this.manageRegister(this.payment, this.payment.rest);
                this.block = false;
                this.goBack();
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });

    }

    async getTrainingPaidAmount(payment: Payment): Promise<number> {
        const payments: Array<Payment> = await Payment.getAllByIntern(this.internSelected.id);
        return payments.reduce((a, b) => {
            if (this.trainingSelected.name === payment.training) {
                return Number(a) + Number(b.amount)
            }
            return a
        }, 0)
    }

    async manageRegister(payment: Payment, rest: number) {
        if (!this.isOnEdit) {
            const register: Register = new Register();
            register.amount = payment.amount;
            register.comment = payment.comment;
            register.date = (payment.date as Date).getTime();
            register.intern = this.internSelected.name;
            register.sold = this.internSelected.sold;
            register.training = this.trainingSelected.name;
            register.username = payment.username;
            register.rest = rest;
            register.insert().catch(() => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            })
        }
    }

    goToReceipt() {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.go_to_receipt_message', true, 'print')
            .subscribe(confirm => {
                if (confirm) {
                    this.router.navigate(['/document/pv/receipt/' + this.internSelected.id]);
                }
            });
    }

    manageInternSold(payment: number) {
        if (this.isOnEdit) {
            this.internSelected.sold = Number(this.internSelected.sold) + Number(payment);
        }
        this.internSelected.sold = Number(this.internSelected.sold) - Number(this.payment.amount);
        this.block = true;
        Intern.updateSoldAndComment(this.internSelected.id, this.internSelected.sold, this.internSelected.comment).then(() => this.block = false,
            e => {
                console.log(e);
                this.block = false;
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            });
    }

    goBack() {
        this.router.navigate(['payment']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
