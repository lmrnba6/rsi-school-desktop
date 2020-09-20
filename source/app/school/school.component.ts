import {Component, OnInit} from '@angular/core';
import './school.component.scss';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";

import * as fs from "fs";
import {OpenDialogOptions, remote} from "electron";
import {School} from "../model/school";
import {MessagesService} from "../_services/messages.service";

@Component({
    selector: 'app-school',
    templateUrl: './school.component.html'
})
export class SchoolComponent implements OnInit {
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public schoolForm: FormGroup;
    public name: FormControl;
    public dist: FormControl;
    public address: FormControl;
    public phone1: FormControl;
    public phone2: FormControl;
    public email: FormControl;
    public website: FormControl;
    public api: FormControl;
    public host: FormControl;
    public db: FormControl;
    public user: FormControl;
    public password: FormControl;
    public photo: any;
    public block: boolean;
    public school: School;
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;


    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private router: Router,
                private translate: TranslateService
    ) {
    }

    getPath() {
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    ngOnInit() {
        this.getData();
        this.initForm();
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.dist = new FormControl(null);
        this.phone1 = new FormControl(null, [Validators.required]);
        this.phone2 = new FormControl(null);
        this.address = new FormControl(null, [Validators.required]);
        this.email = new FormControl(null, [Validators.required]);
        this.website = new FormControl(null);
        this.api = new FormControl(null);
        this.host = new FormControl(null);
        this.db = new FormControl(null);
        this.user = new FormControl(null);
        this.password = new FormControl(null);
        this.schoolForm = this.fb.group({
            name: this.name,
            dist: this.dist,
            address: this.address,
            phone1: this.phone1,
            phone2: this.phone2,
            email: this.email,
            website: this.website,
            api: this.api,
            host: this.host,
            db: this.db,
            user: this.user,
            password: this.password
        });
    }

    public getData(): void {
        School
            .getAll()
            .then(val => {
                if (val.length) {
                    this.school = val[0];
                    this.photo = 'data:image/png;base64,' + this.school.photo;
                } else {
                    const school = new School();
                    school.name = '';
                    school.photo = '';
                    school.dist = '';
                    school.address = '';
                    school.phone1 = '';
                    school.phone2 = '';
                    school.email = '';
                    school.website = '';
                    // School.api = '';
                    // School.host = '';
                    // School.db = '';
                    // School.user = '';
                    // School.password = '';
                    school.insert().then();
                    this.getData();
                }
            });
    }

    /**
     * onSave
     */
    public onSave(): void {
        this.school.update().then(
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

    openFile() {
        const options: OpenDialogOptions = {};
        const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), options);
        files && this.readFile(files[0]);
    }

    private readFile(file: string) {
        const This = this;
        fs.readFile(file, function (err, data) {
            if (err) {
                return console.error(err);
            }
            This.school.photo = data.toString('base64');
            This.getPhoto(data);
        });
    }

    getPhoto(data: any) {
        const blob = new Blob([data], {
            type: 'image/png'
        });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            this.photo = reader.result;
            (document.getElementById('name') as HTMLElement).focus();
        }
    }

    goBack() {
        this.router.navigate(['settings']);
    }

    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
