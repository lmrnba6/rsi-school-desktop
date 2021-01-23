import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './charge-instructor-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Instructor} from "../model/instructor";
import {Session} from "../model/session";
import {ChargeInstructor} from "../model/chargeInstructor";

@Component({
    selector: 'app-charge-instructor-form',
    templateUrl: './charge-instructor-form.component.html',
})
export class ChargeInstructionFormComponent implements OnInit {

    public charge: ChargeInstructor;
    public block: boolean;
    public isOnEdit: boolean;
    public offer: boolean;
    public chargeForm: FormGroup;
    public date: FormControl;
    public session: FormControl;
    public amount: FormControl;
    public rest: FormControl;
    public comment: FormControl;
    public instructor: FormControl;
    public sessions: Array<Session> = [];
    public instructorSelected: Instructor | any;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
    ) {
    }

    public ngOnInit(): void {
        this.getParams();
    }

    parseAmount(amount: number) {
        this.charge.amount = Number(Number(amount).toFixed(0));
        if(!this.isOnEdit) {
            this.charge.rest = this.charge.amount;
        }
    }

    parseRest(amount: number) {
        this.charge.rest = Number(Number(amount).toFixed(0));
    }


    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.charge) {
                this.getData(res.charge);
                this.isOnEdit = true;
            } else {
                this.isOnEdit = false;
                this.charge = new ChargeInstructor();
                this.charge.date = new Date();
                (this.charge.session as any) = -1;
                this.getInstructor(res.id);
            }
            this.initForm();
            this.chargeForm.controls['rest'].disable();
            if (this.isOnEdit) {
                this.chargeForm.controls['instructor'].disable();
                this.chargeForm.controls['date'].disable();
                this.chargeForm.controls['session'].disable();
                this.chargeForm.controls['amount'].disable();
            }
        });
    }

    getInstructor(id: number) {
        Instructor.get(id).then(instructor => {
            this.instructorSelected = instructor;
            this.chargeForm.controls['instructor'].disable();
            this.getSessions();
        })
    }


    /**
     * get data
     *
     * @param  {string} name charge name
     * @returns void
     */
    public getData(id: number): void {
        ChargeInstructor
            .get(id)
            .then((val: ChargeInstructor) => {
                this.charge = val;
                Instructor.get(this.charge.instructor as number).then(instructor => {
                    this.instructorSelected = instructor;
                    this.getSessions();
                });
                this.charge.date = new Date(Number(this.charge.date));
            });
    }

    getSessions() {
        Session.getAllSessionsByInstructor(this.instructorSelected.id).then(s => {
            this.sessions = s;
        })
    }


    public initForm(): void {
        this.amount = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null,[Validators.required]);
        this.rest = new FormControl(null, [Validators.required]);
        this.session = new FormControl(null,[Validators.required]);
        this.instructor = new FormControl(null, [Validators.required]);

        this.chargeForm = this.fb.group({
            amount: this.amount,
            date: this.date,
            comment: this.comment,
            rest: this.rest,
            session: this.session,
            instructor: this.instructor,
        });
    }

    /**
     * onSave
     */
    public async onSave(): Promise<void> {
        await this.onSaveOrUpdate();
    }

    updateSold() {
        this.block = true;
        ChargeInstructor.getSold(this.charge.instructor as number).then(total => {
            Instructor.updateSold(this.charge.instructor as number, total[0].sold).then(
                () => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                    this.goBack();
                },
                () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false;
                });
        }, () => {
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        });
    }

    /**
     * onSave
     */
    public async onSaveOrUpdate(): Promise<void> {
        if(Number(this.charge.session) === -1) {
            (this.charge.session as any) = null;
        }
        this.charge.date = (this.charge.date as Date).getTime();
        this.charge.instructor = this.instructorSelected.id;
        let instructorPromise: Promise<any>;
        if (this.isOnEdit) {
            instructorPromise = this.charge.update();
        } else {
            instructorPromise = this.charge.insert();
        }
        this.block = true;
        instructorPromise.then(
            () => {
                this.updateSold();
                this.block = false;
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                this.goBack();
            },
            () => {
                this.charge.date = new Date(this.charge.date);
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });

    }

    goBack() {
        this.router.navigate(['instructor-management/'+ this.instructorSelected.id + '/' + 5]);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
