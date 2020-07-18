import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Commute} from "../model/commute";
import './commute-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Transport} from "../model/transport";
import {Intern} from "../model/intern";

@Component({
    selector: 'app-commute-form',
    templateUrl: './commute-form.component.html',
})
export class CommuteFormComponent implements OnInit {

    public commute: Commute = new Commute();
    public intern: Intern;
    public block: boolean;
    public isOnEdit: boolean;
    public commuteForm: FormGroup;
    public day: FormControl;
    public time: FormControl;
    public address: FormControl;
    public comment: FormControl;
    public internTransport: Array<Commute | Transport> = [];
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public daySelected: string = 'saturday';
    public timeToEdit: string;
    public transports: Array<Transport> = [];
    public days = [
        'saturday',
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
    ];
    public times: Array<string> = []

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService) {
    }

    public ngOnInit(): void {
        this.initForm();
        this.getParams();
    }


    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.commuteId && res.internId) {
                this.getData(res.commuteId, res.internId);
                this.isOnEdit = true;
            } else {
                this.isOnEdit = false;
                this.commute = new Commute();
                this.getIntern(res.internId);
            }
        });
    }

    public getIntern(internId: number): void {
        Promise.all([Intern.get(internId), Commute.getAllByIntern(internId)])
            .then(val => {
                this.intern = val[0];
                this.commute.address = this.intern.address;
                this.internTransport = val[1];
                this.onChange();
            });
    }

    /**
     * get data
     *
     * @param  {string} name commute name
     * @returns void
     */
    public getData(commuteId: number, internId: number): void {
        Promise.all([Commute.get(commuteId), Intern.get(internId), Commute.getAllByIntern(internId)])
            .then(val => {
                this.commute = val[0];
                this.intern = val[1];
                this.internTransport = val[2];
                this.timeToEdit = val[0]['time'];
                this.daySelected = val[0]['day'];
                this.onChange();
            });
    }

    public initForm(): void {
        this.day = new FormControl(null, [Validators.required]);
        this.time = new FormControl(null, [Validators.required]);
        this.address = new FormControl(null, [Validators.required]);
        this.comment = new FormControl(null);
        this.commuteForm = this.fb.group({
            day: this.day,
            time: this.time,
            comment: this.comment,
            address: this.address,
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
        this.commute.intern = this.intern.id;
        let coursePromise: Promise<any>;
        if (this.isOnEdit) {
            coursePromise = this.commute.update();
        } else {
            coursePromise = this.commute.insert();
        }
        this.block = true;
        coursePromise.then(
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


    onChange() {
        Transport.getAll().then(transports => {
            this.transports = transports.filter(t => t.day === this.daySelected);
            if (this.commute.transport) {
                const t = this.transports.find(x => x.id === this.commute.transport);
                if (t) {
                    if (this.transportExist(t)) {
                        (this.commute.transport as any) = null;
                    }
                }
            }
        });

    }

    transportExist(transport: Transport) {
        return (!this.isOnEdit && (this.internTransport.some(t => t['time'] === transport.time && t['day'] === transport.day)
            || transport['available'] <= 0)) ||
            (this.isOnEdit && (transport.day !== this.daySelected || transport['available'] <= 0)
                &&  transport.time !== this.timeToEdit);
    }

    goBack() {
        this.router.navigate(['intern-management/' + this.intern.id + '/' + 6]);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
