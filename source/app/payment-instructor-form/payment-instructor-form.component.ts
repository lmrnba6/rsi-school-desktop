import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './payment-instructor-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Instructor} from "../model/instructor";
import {DialogsService} from "../_services/dialogs.service";
import {Register} from "../model/register";
import {AuthenticationService} from "../_services/authentication.service";
import {ChargeInstructor} from "../model/chargeInstructor";
import {Payment_instructor} from "../model/paymentInstructor";

@Component({
    selector: 'app-payment-instructor-form',
    templateUrl: './payment-instructor-form.component.html',
})
export class PaymentInstructorFormComponent implements OnInit {

    public payment: Payment_instructor;
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
    public instructor: FormControl;
    public instructors: Array<Instructor> = [];
    public charges: Array<ChargeInstructor> = [];
    public instructorsFiltered: Array<Instructor> = [];
    public instructorSelected: Instructor | any;
    public chargeSelected: ChargeInstructor | any;
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
                this.payment = new Payment_instructor();
                this.getInstructorToPay(res.in, res.tr);
            } else {
                this.isOnEdit = false;
                this.payment = new Payment_instructor();
                this.payment.date = new Date();
            }
            this.initForm();
        });
    }

    public getInstructorToPay(id: number, tr: number): void {
        Instructor.get(id).then((val: any) => {
            this.instructorSelected = val;
            this.payment.instructor_id = this.instructorSelected.id;
            this.instructor.patchValue(val.id);
            this.payment.date = new Date();
        });
        ChargeInstructor.getBySession(tr, id)
            .then((val: any) => {
                this.chargeSelected = val;
                this.payment.charge = this.chargeSelected.id;
                this.charge.patchValue(val.id);
                this.payment.date = new Date();
                this.getCharges();
            });
    }

    public displayFnInstructor(instructor: Instructor) {
        return instructor ? instructor.name : '';
    }

    public instructorOnChange(event: any): void {
        if (event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.block = true;
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
        this.getCharges();

    }

    /**
     * get data
     *
     * @param  {string} name payment name
     * @returns void
     */
    public getData(id: number): void {
        Payment_instructor
            .get(id)
            .then((val: Payment_instructor) => {
                this.payment = val;
                this.oldPayment = val.amount;
                Instructor.get(this.payment.instructor_id as number).then(instructor => {
                    this.instructorSelected = instructor;
                    this.getCharges();
                });
                this.payment.date = new Date(Number(this.payment.date));
                if (this.isOnEdit || this.express) {
                    this.paymentForm.controls['amount'].disable();
                    this.paymentForm.controls['date'].disable();
                    this.paymentForm.controls['charge'].disable();
                    this.paymentForm.controls['instructor'].disable();
                }
            });
    }


    public initForm(): void {
        this.amount = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.charge = new FormControl(null);
        this.month = new FormControl(null);
        this.instructor = new FormControl(null, [Validators.required]);

        this.paymentForm = this.fb.group({
            amount: this.amount,
            date: this.date,
            comment: this.comment,
            charge: this.charge,
            month: this.month,
            instructor: this.instructor,
        });
    }

    /**
     * onSave
     */
    public async onSave(): Promise<void> {
        await this.onSaveOrUpdate();
    }

    getCharges() {
        if (this.instructorSelected) {
            ChargeInstructor.getAllByInstructor(this.instructorSelected.id).then(charges => {
                this.charges = charges;
                this.block = false;
            });
        }
    }

    getDate(date: number) {
        return date && Number(date) ? new Date(Number(date)).toISOString().slice(0, 10) : ''
    }

    public onChargeChange(id: number) {
        this.chargeSelected = this.charges.find(s => s.id === id);
        if (!this.chargeSelected) {
            (this.payment.charge as any) = null;
        } else {
            this.payment.charge = id as any;
        }
    }

    /**
     * onSave
     */
    public async onSaveOrUpdate(): Promise<void> {
        if(this.chargeSelected && Number(this.payment.amount) > Number(this.chargeSelected.amount)) {
            this.messagesService.notifyMessage(this.translate.instant('messages.payment_grater_than_charge'), '', 'error');
            return;
        }
        this.payment.error = this.payment.error ? 1 : 0;
        this.payment.instructor_id = this.instructorSelected.id;
        this.payment.username = this.auth.getCurrentUser().username;
        const copy: Payment_instructor = new Payment_instructor();
        copy.id = this.payment.id;
        copy.username = this.auth.getCurrentUser().username;
        copy.instructor_id = this.instructorSelected.id;
        copy.error = this.payment.error;
        copy.charge = this.payment.charge;
        copy.date = (this.payment.date as Date).getTime();
        copy.comment = this.payment.comment;
        copy.month = this.payment.month;
        copy.amount = this.payment.amount;
        //const trainingAcc: number = await this.getTrainingPaidAmount(this.payment);
        this.payment.rest = this.chargeSelected ? Number(this.chargeSelected.rest) - Number(this.payment.amount) : 0;
        copy.rest = this.payment.rest;
        let instructorPromise: Promise<any>;
        if (this.isOnEdit) {
            instructorPromise = copy.update();
        } else {
            instructorPromise = copy.insert();
        }
        this.block = true;
        instructorPromise.then(
            () => {
                if (this.chargeSelected) {
                    this.manageInstructorSold();
                } else {
                    this.manageRegister(this.payment, this.payment.rest);
                }
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
    // async getTrainingPaidAmount(payment: Payment_instructor): Promise<number> {
    //     const payments: Array<Payment_instructor> = await Payment_instructor.getAllByInstructor(this.instructorSelected.id);
    //     return payments.reduce((a, b) => {
    //         if (this.trainingSelected.name === payment.training) {
    //             return Number(a) + Number(b.amount)
    //         }
    //         return a
    //     }, 0)
    // }

    async manageRegister(payment: Payment_instructor, rest: number) {
        if (!this.isOnEdit) {
            this.dialogsService
                .confirm('register.title', 'messages.add_to_register_message', true, 'usd')
                .subscribe(confirm => {
                    if (confirm) {
                        const register: Register = new Register();
                        register.amount = 0 - Number(payment.amount);
                        register.comment = payment.comment;
                        register.date = (payment.date as Date).getTime();
                        register.intern = this.instructorSelected.name;
                        register.sold = this.instructorSelected.sold;
                        register.training = this.chargeSelected?.session_name || '';
                        register.username = payment.username;
                        register.rest = rest;
                        register.responsible = this.auth.getCurrentUser().username;
                        register.insert().catch(() => {
                            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                            this.block = false;
                        })
                        this.goToReceipt();
                    } else {
                        this.goToReceipt();
                    }
                })
        } else {
            this.goToReceipt();
        }
    }

    goToReceipt() {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.go_to_receipt_message', true, 'print')
            .subscribe(confirm => {
                if (confirm) {
                    this.router.navigate(['/document/pv/receipt/' + this.instructorSelected.id + '/instructor']);
                }
            });
    }

    manageInstructorSold() {
        this.block = true;
        ChargeInstructor.updateRest(this.payment.rest, this.chargeSelected.id).then(() => {
            this.block = false
            ChargeInstructor.getSold(this.chargeSelected.instructor as number).then(sold => {
                    this.instructorSelected.sold = sold[0].sold;
                    Instructor.updateSold(this.chargeSelected.instructor as number, sold[0].sold).then();
                    this.manageRegister(this.payment, this.payment.rest);
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
        this.router.navigate(['payments/instructors']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
