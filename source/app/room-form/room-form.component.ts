import {Component, Input, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import {Room} from "../model/room";
import './room-form.component.scss';
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-room-form',
    templateUrl: './room-form.component.html',
})
export class RoomFormComponent implements OnInit {

    @Input() public room: Room;
    public block: boolean;
    public isOnEdit: boolean;
    public roomForm: FormGroup;
    public number: FormControl;
    public capacity: FormControl;

    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService) {
    }

    public ngOnInit(): void {
        this.getParams();
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
                this.room = new Room();
            }
            this.initForm();
        });
    }

    /**
     * get data
     *
     * @param  {string} name room name
     * @returns void
     */
    public getData(id: number): void {
        Room
            .get(id)
            .then((val: Room) => (this.room = val));
    }

    public initForm(): void {
        this.number = new FormControl(null, [Validators.required]);
        this.capacity = new FormControl(null, [Validators.required]);
        this.roomForm = this.fb.group({
            number: this.number,
            capacity: this.capacity,
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
        let roomPromise: Promise<any>;
        if (this.isOnEdit) {
            roomPromise = this.room.update();
        } else {
            roomPromise = this.room.insert();
        }
        this.block = true;
        roomPromise.then(
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
        this.router.navigate(['room']);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
