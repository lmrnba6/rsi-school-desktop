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
@Component({
    selector: 'app-payment-form',
    templateUrl: './payment-form.component.html',
})
export class PaymentFormComponent implements OnInit {

    public payment: Payment;
    public block: boolean;
    public isOnEdit: boolean;
    public paymentForm: FormGroup;
    public date: FormControl;
    public amount: FormControl;
    public comment: FormControl;
    public training: FormControl;
    public month: FormControl;
    public intern: FormControl;
    public interns: Array<Intern> = [];
    public internsFiltered: Array<Intern> = [];
    public internSelected: Intern;
    public trainingsFiltered: Array<Training> = [];
    public trainingSelected: Training;
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
                ) {
    }

    public ngOnInit(): void {
        this.getParams();
    }

    parseAmount(amount: number) {
        this.payment.amount = Number(Number(amount).toFixed(2));
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
                this.payment = new Payment();
                this.payment.date = new Date();
            }
            this.initForm();
        });
    }

    public displayFn(intern: Intern) {
        return intern ? intern.name : this.internSelected.name;
    }

    public internOnChange(event: any): void {
        if(event.keyCode == 13) {
            this.block = true;
            Intern.getAllPaged(0, 5, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.internsFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
        }
    }

    public internOnSelect(intern: Intern): void {
        this.internSelected = intern;
    }

    public trainingOnChange(event: any): void {
        if(event.keyCode == 13) {
            this.block = true;
            Training.getAllPaged(0, 5, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.trainingsFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
            this.trainingSelected.name = event;
        }
    }

    public trainingOnSelect(training: Training): void {
        this.trainingSelected = training;
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
                Intern.get(this.payment.intern_id as number).then(intern => this.internSelected = intern)
                this.payment.date = new Date(Number(this.payment.date));
            });
    }


    public initForm(): void {
        this.amount = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.training = new FormControl(null);
        this.month = new FormControl(null);
        this.intern = this.isOnEdit ? new FormControl(null) :
            new FormControl(null,  [Validators.required]);

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
    public onSave(): void {
        this.onSaveOrUpdate();
    }

    /**
     * onSave
     */
    public onSaveOrUpdate(): void {
        this.payment.date = (this.payment.date as Date).getTime();
        this.payment.intern_id = this.internSelected.id;
        this.payment.training = this.trainingSelected.name;
        let internPromise: Promise<any>;
        if (this.isOnEdit) {
            internPromise = this.payment.update();
        } else {
            internPromise = this.payment.insert();
        }
        this.block = true;
        internPromise.then(
            () => {
                this.manageInternSold(this.oldPayment);
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
        if(this.isOnEdit) {
            this.internSelected.sold += payment;
        }
        this.internSelected.sold -= this.payment.amount;
        this.block = true;
        this.internSelected.update().then(() => this.block = false,
            () => {
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
