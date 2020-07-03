import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Visitor} from "../model/visitor";
import './visitor-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {DialogsService} from "../_services/dialogs.service";

@Component({
    selector: 'app-visitor-form',
    templateUrl: './visitor-form.component.html',
})
export class VisitorFormComponent implements OnInit, OnChanges {

    @Input() public visitor: Visitor;
    @Output() public next: EventEmitter<any> = new EventEmitter()
    public block: boolean;
    public isOnEdit: boolean;
    public internForm: FormGroup;
    public name: FormControl;
    public phone: FormControl;
    public comment: FormControl;
    public date: FormControl;


    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public  photo: any;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private router: Router,
                private translate: TranslateService,
                private route: ActivatedRoute,
                private dialogsService: DialogsService,
    ) {
    }

    public ngOnInit(): void {
        this.initForm();
        this.getParams();
    }

    public ngOnChanges() {
        this.initForm();
        this.getParams();
    }

    phoneParse() {
        this.visitor.phone = this.visitor.phone.toString().slice(0, 9)
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
                this.visitor = new Visitor();
            }
        });
    }

    /**
     * get data
     *
     * @param  {string} name visitor name
     * @returns void
     */
    public getData(id: number): void {
        Visitor
            .get(id)
            .then((val: Visitor) => {
                this.visitor = val;
                this.visitor.date = new Date(Number(this.visitor.date));
            });
    }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.phone = new FormControl(null, [Validators.required, Validators.maxLength(10)]);
        this.comment = new FormControl(null, [Validators.required]);
        this.date = new FormControl(null, [Validators.required]);

        this.internForm = this.fb.group({
            name: this.name,
            phone: this.phone,
            comment: this.comment,
            date: this.date,
        });
    }

    /**
     * onSave
     */
    public onSave(): void {
        this.onSaveOrUpdate();
    }

    /**
     * onTransfer
     */
    public onTransfer(): void {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.transfer_intern_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    this.router.navigate(['intern-transfer/' + this.visitor.name + '/' + this.visitor.phone+ '/' + this.visitor.id]);
                }
            });
    }

    /**
     * onSave
     */
    public onSaveOrUpdate(): void {
        this.visitor.date = (this.visitor.date as Date).getTime();
        let internPromise: Promise<any>;
        if (this.isOnEdit) {
            internPromise = this.visitor.update();
        } else {
            internPromise = this.visitor.insert();
        }

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
        this.router.navigate(['visitor']);
    }

    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }
}
