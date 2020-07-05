import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './payment-instructor-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Instructor} from "../model/instructor";
import {Payment_instructor} from "../model/paymentInstructor";
@Component({
    selector: 'app-payment-instructor-form',
    templateUrl: './payment-instructor-form.component.html',
})
export class PaymentInstructorFormComponent implements OnInit {

    public payment_instructor: Payment_instructor;
    public block: boolean;
    public isOnEdit: boolean;
    public paymentForm: FormGroup;
    public date: FormControl;
    public amount: FormControl;
    public comment: FormControl;
    public instructor: FormControl;
    public instructors: Array<Instructor> = [];
    public instructorsFiltered: Array<Instructor> = [];
    public instructorSelected: Instructor;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public oldPaymentInstructor: number;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService
                ) {
    }

    public ngOnInit(): void {
        this.getParams();
    }

    parseAmount(amount: number) {
        this.payment_instructor.amount = Number(Number(amount).toFixed(0));
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
                this.payment_instructor = new Payment_instructor();
                this.payment_instructor.date = new Date();
            }
            this.initForm();
        });
    }

    public displayFn(instructor: Instructor) {
        return instructor ? instructor.name : this.instructorSelected.name;
    }

    public instructorOnChange(event: any): void {
        if(event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {            this.block = true;
            Instructor.getAllPaged(0, 5, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.instructorsFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
        }
        //this.instructorsFiltered = this.instructors.filter(instructors => instructors.name.toLowerCase().includes(event.toLowerCase()));
    }

    public instructorOnSelect(instructor: Instructor): void {
        this.instructorSelected = instructor;
    }

    /**
     * get data
     *
     * @param  {string} name instructor name
     * @returns void
     */
    public getData(id: number): void {
        Payment_instructor
            .get(id)
            .then((val: Payment_instructor) => {
                this.payment_instructor = val;
                this.oldPaymentInstructor = val.amount;
                Instructor.get(this.payment_instructor.instructor_id as number).then(instructor => this.instructorSelected = instructor)
                this.payment_instructor.date = new Date(Number(this.payment_instructor.date));
            });
    }


    public initForm(): void {
        this.amount = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.instructor = this.isOnEdit ? new FormControl(null) :
            new FormControl(null,  [Validators.required]);

        this.paymentForm = this.fb.group({
            amount: this.amount,
            date: this.date,
            comment: this.comment,
            instructor: this.instructor,
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
        this.payment_instructor.date = (this.payment_instructor.date as Date).getTime();
        this.payment_instructor.instructor_id = this.instructorSelected.id;
        let instructorPromise: Promise<any>;
        if (this.isOnEdit) {
            instructorPromise = this.payment_instructor.update();
        } else {
            instructorPromise = this.payment_instructor.insert();
        }
        this.block = true;
        instructorPromise.then(
            () => {
                this.manageInternSold(this.oldPaymentInstructor);
                this.block = false;
                this.goBack();
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });

    }

    manageInternSold(instructor: number) {
        if(this.isOnEdit) {
            this.instructorSelected.sold = Number(this.instructorSelected.sold) + Number(instructor);
        }
        this.instructorSelected.sold = Number(this.instructorSelected.sold) - Number(this.payment_instructor.amount);
        this.block = true;
        this.instructorSelected.update().then(() => this.block = false,
            () => {
            this.block = false;
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
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
