import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Charge} from "../model/charge";
import './charge-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Intern} from "../model/intern";
import {Session} from "../model/session";

@Component({
    selector: 'app-charge-form',
    templateUrl: './charge-form.component.html',
})
export class ChargeFormComponent implements OnInit {

    public charge: Charge;
    public block: boolean;
    public isOnEdit: boolean;
    public offer: boolean;
    public chargeForm: FormGroup;
    public date: FormControl;
    public session: FormControl;
    public amount: FormControl;
    public rest: FormControl;
    public comment: FormControl;
    public intern: FormControl;
    public sessions: Array<Session> = [];
    public internSelected: Intern | any;
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
                this.charge = new Charge();
                this.charge.date = new Date();
                this.getIntern(res.id);
            }
            this.initForm();
        });
    }

    getIntern(id: number) {
        Intern.get(id).then(intern => {
            this.internSelected = intern;
            this.chargeForm.controls['intern'].disable();
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
        Charge
            .get(id)
            .then((val: Charge) => {
                this.charge = val;
                Intern.get(this.charge.intern as number).then(intern => {
                    this.internSelected = intern;
                    this.getSessions();
                });
                this.charge.date = new Date(Number(this.charge.date));
                if (this.isOnEdit) {
                    this.chargeForm.controls['date'].disable();
                    this.chargeForm.controls['intern'].disable();
                    this.chargeForm.controls['session'].disable();
                    this.chargeForm.controls['amount'].disable();
                    this.chargeForm.controls['rest'].disable();
                }
            });
    }

    getSessions() {
        Session.getAllSessionByIntern(this.internSelected.id).then(s => {
            this.sessions = s;
        })
    }


    public initForm(): void {
        this.amount = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null,[Validators.required]);
        this.rest = new FormControl(null, [Validators.required]);
        this.session = new FormControl(null,[Validators.required]);
        this.intern = new FormControl(null, [Validators.required]);

        this.chargeForm = this.fb.group({
            amount: this.amount,
            date: this.date,
            comment: this.comment,
            rest: this.rest,
            session: this.session,
            intern: this.intern,
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
        Intern.get(this.charge.intern as number).then(intern => {
            Intern.updateSold(this.charge.intern as number, Number(intern.sold) + Number(this.charge.rest)).then(
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
        this.charge.date = (this.charge.date as Date).getTime();
        this.charge.intern = this.internSelected.id;
        let internPromise: Promise<any>;
        if (this.isOnEdit) {
            internPromise = this.charge.update();
        } else {
            internPromise = this.charge.insert();
        }
        this.block = true;
        internPromise.then(
            () => {
                if(this.isOnEdit){
                    this.goBack();
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                } else {
                    this.updateSold();
                }
            },
            () => {
                this.charge.date = new Date(this.charge.date);
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });

    }

    goBack() {
        this.router.navigate(['intern-management/'+ this.internSelected.id + '/' + 7]);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
