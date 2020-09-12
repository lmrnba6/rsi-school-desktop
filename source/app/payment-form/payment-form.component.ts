import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Payment} from "../model/payment";
import './payment-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Intern} from "../model/intern";
import {DialogsService} from "../_services/dialogs.service";
import {Register} from "../model/register";
import {AuthenticationService} from "../_services/authentication.service";
import {Charge} from "../model/charge";

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
    public charge: FormControl;
    public month: FormControl;
    public intern: FormControl;
    public interns: Array<Intern> = [];
    public charges: Array<Charge> = [];
    public internsFiltered: Array<Intern> = [];
    public internSelected: Intern | any;
    public chargeSelected: Charge | any;
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
            .get(id), Charge.getBySession(tr, id)])
            .then((val: any) => {
                this.internSelected = val[0];
                this.chargeSelected = val[1];
                this.payment.charge = this.chargeSelected.id;
                this.payment.intern_id = this.internSelected.id;
                this.intern.patchValue(val[0].id);
                this.charge.patchValue(val[1].id);
                this.payment.date = new Date();
                this.getCharges();
            });
    }

    public displayFnIntern(intern: Intern) {
        return intern ? intern.name : '';
    }

    public internOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
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
        }
    }

    public internOnSelect(intern: Intern): void {
        this.internSelected = intern;
        this.getCharges();

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
                Intern.get(this.payment.intern_id as number).then(intern => {
                    this.internSelected = intern;
                    this.getCharges();
                });
                this.payment.date = new Date(Number(this.payment.date));
                if (this.isOnEdit || this.express) {
                    this.paymentForm.controls['amount'].disable();
                    this.paymentForm.controls['date'].disable();
                    this.paymentForm.controls['charge'].disable();
                    this.paymentForm.controls['intern'].disable();
                }
            });
    }


    public initForm(): void {
        this.amount = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.charge = new FormControl(null);
        this.month = new FormControl(null);
        this.intern = new FormControl(null, [Validators.required]);

        this.paymentForm = this.fb.group({
            amount: this.amount,
            date: this.date,
            comment: this.comment,
            charge: this.charge,
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

    getCharges() {
        if (this.internSelected) {
            Charge.getAllByIntern(this.internSelected.id).then(charges => {
                this.charges = charges;
                this.block = false;
            });
        }
    }

    public onChargeChange(id: number) {
        this.chargeSelected = this.charges.find(s => s.id === id);
        if(!this.chargeSelected){
            (this.payment.charge as any) = null;
        } else {
            this.payment.charge = id as any;
        }
    }

    /**
     * onSave
     */
    public async onSaveOrUpdate(): Promise<void> {
        this.payment.error = this.payment.error ? 1 : 0;
        this.payment.intern_id = this.internSelected.id;
        this.payment.username = this.auth.getCurrentUser().username;
        const copy: Payment = new Payment();
        copy.id = this.payment.id;
        copy.username = this.auth.getCurrentUser().username;
        copy.intern_id = this.internSelected.id;
        copy.error = this.payment.error;
        copy.charge = this.payment.charge;
        copy.date = (this.payment.date as Date).getTime();
        copy.comment = this.payment.comment;
        copy.month = this.payment.month;
        copy.amount = this.payment.amount;
        //const trainingAcc: number = await this.getTrainingPaidAmount(this.payment);
        this.payment.rest = this.chargeSelected ? Number(this.chargeSelected.rest) - Number(this.payment.amount) : 0;
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
                if (this.chargeSelected) {
                    this.manageInternSold();
                } else {
                    !this.offer && this.manageRegister(this.payment, this.payment.rest);
                }
                this.goToReceipt();
                this.block = false;
                this.goBack();
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });

    }

    //
    // async getTrainingPaidAmount(payment: Payment): Promise<number> {
    //     const payments: Array<Payment> = await Payment.getAllByIntern(this.internSelected.id);
    //     return payments.reduce((a, b) => {
    //         if (this.trainingSelected.name === payment.training) {
    //             return Number(a) + Number(b.amount)
    //         }
    //         return a
    //     }, 0)
    // }

    async manageRegister(payment: Payment, rest: number) {
        if (!this.isOnEdit) {
            const register: Register = new Register();
            register.amount = payment.amount;
            register.comment = payment.comment;
            register.date = (payment.date as Date).getTime();
            register.intern = this.internSelected.name;
            register.sold = this.internSelected.sold;
            register.training = this.chargeSelected.session_name;
            register.username = payment.username;
            register.rest = rest;
            register.responsible = this.auth.getCurrentUser().username;
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

    manageInternSold() {
        this.block = true;
            Charge.updateRest(this.payment.rest, this.chargeSelected.id).then(() => {
                this.block = false
                Charge.getSold(this.chargeSelected.intern as number).then(sold => {
                        this.internSelected.sold = sold[0].sold;
                        Intern.updateSold(this.chargeSelected.intern as number, sold[0].sold).then();
                        !this.offer && this.manageRegister(this.payment, this.payment.rest);
                    }, () => {
                        this.block = false;
                        this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    }
                )
            }, () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
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
