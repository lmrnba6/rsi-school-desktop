import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import { Router} from '@angular/router';
import {Intern} from "../model/intern";
import './intern-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {OpenDialogOptions, remote} from "electron";
import * as fs from "fs";
import {AuthenticationService} from "../_services/authentication.service";
import * as JsBarcode from "jsbarcode";
import {User} from "../model/user";
import {Settings} from "../model/settings";
import * as path from "path";
const WebCamera = require("webcamjs");
@Component({
    selector: 'app-intern-form',
    templateUrl: './intern-form.component.html',
})
export class InternFormComponent implements OnInit, OnChanges, OnDestroy {

    @Input() public intern: Intern;
    @Output() public next: EventEmitter<any> = new EventEmitter()
    public block: boolean;
    public isOnEdit: boolean;
    public internForm: FormGroup;
    public name: FormControl;
    public phone: FormControl;
    public phone2: FormControl;
    public sold: FormControl;
    public parent: FormControl;
    public email: FormControl;
    public address: FormControl;
    public birth: FormControl;
    public name_arabic: FormControl;
    public scholar: FormControl;
    public isAdmin: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public  photo: any;
    public saveCamera: boolean;
    public scholars = [
        'elementary',
        'secondary',
        'high',
        'bachelor',
        'master',
        'phd'
    ];
    public isIntern: boolean;
    public users: Array<User> = [];
    public usersFiltered: Array<User> = [];
    public userSelected: User;

    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private router: Router,
                private translate: TranslateService,
                private authService: AuthenticationService) {
    }

    public ngOnInit(): void {
        this.isIntern = this.authService.getCurrentUser().role === 'student';
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
        this.initForm();
        this.getParams();
        //this.readFile(__dirname + '/assets/images/profile.png')
    }

    public ngOnChanges() {
        this.initForm();
        this.getParams();
    }

    public ngOnDestroy() {
        WebCamera.reset();
        this.saveCamera = false;
    }

    /**
     * getParams
     */
    public getParams(): void {
        if (this.intern) {
            this.getData(this.intern.id);
            this.isOnEdit = true;
        } else {
            this.isOnEdit = false;
            this.intern = new Intern();
        }
    }

    public displayFn(user: User) {
        return user ? user.name : this.userSelected.name;
    }

    public userOnChange(event: any): void {
        if(event.keyCode == 13) {
            this.block = true;
            User.getAllPaged(0, 5, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.usersFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
        }
        //this.usersFiltered = this.users.filter(users => users.name.toLowerCase().includes(event.toLowerCase()));
    }

    public userOnSelect(user: User): void {
        this.userSelected = user;
    }

    /**
     * get data
     *
     * @param  {string} name intern name
     * @returns void
     */
    public getData(id: number): void {
        Intern
            .get(id)
            .then((val: Intern) => {
                this.intern = val;
                this.intern.isAllowed = this.intern.isAllowed === 1 ? true : false;
                this.intern.birth = new Date(Number(this.intern.birth));
                //this.photo = 'data:image/png;base64,' + this.intern.photo;
                this.photo = this.intern.photo;
                JsBarcode("#barcode", this.intern.phone.toString() + this.intern.id.toString());
                this.intern.parent && User.get(this.intern.parent).then(user => this.userSelected = user);
            });
    }

    getAge(date: number) {
        var diff_ms = Date.now() - date;
        var age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    }

    phoneParse() {
        this.intern.phone = this.intern.phone.toString().slice(0, 9)
        this.intern.phone2 = this.intern.phone2.toString().slice(0, 9)
    }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.email = new FormControl(null, [Validators.email]);
        this.address = new FormControl(null);
        this.phone = new FormControl(null, [Validators.required]);
        this.phone2 = new FormControl(null);
        this.sold = new FormControl({value: 0, disabled:!this.isAdmin});
        this.birth = new FormControl(null, [Validators.required]);
        this.name_arabic = new FormControl(null, [Validators.required]);
        this.scholar = new FormControl(null);
        this.parent = new FormControl(null);

        this.internForm = this.fb.group({
            name: this.name,
            name_arabic: this.name_arabic,
            address: this.address,
            phone: this.phone,
            phone2: this.phone2,
            sold: this.sold,
            email: this.email,
            birth: this.birth,
            scholar: this.scholar,
            parent: this.parent
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
        this.intern.isAllowed = this.intern.isAllowed ? 1 : 0;
        this.intern.birth = (this.intern.birth as Date).getTime();
        if(this.userSelected) {
            this.intern.parent = this.userSelected.id;
        }
        let internPromise: Promise<any>;
        if (this.isOnEdit) {
            internPromise = this.intern.update();
        } else {
            internPromise = this.intern.insert();
        }
        this.block = true;
    internPromise.then(
        () => {
            this.block = false;
            !this.isOnEdit && this.createUser();
            this.goBack();
            this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
        },
        () => {
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        });

    }

    createUser() {
        const user: User = new User();
        user.role = 'student';
        user.name = this.intern.name;
        user.username = this.intern.phone;
        user.password = this.intern.phone;
        this.block = true;
        user.insert().then(
            () => this.block = false,
            () => {
                this.block = false;
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            })
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



    savePhoto() {
        WebCamera.snap((data_uri: any) => {
            const matches = data_uri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }
            /**
             * the old way to save photo on db
             */
            //this.intern.photo = matches[2];
            //this.photo = 'data:image/png;base64,' + matches[2];+

            /**
             * new way to save photo on disk
             */
            const name = new Date().getTime().toString() + '.png';
            this.saveCamera = false;
            this.downloadFile(name, matches[2]);
            WebCamera.reset();
            return false;
        });
    }

    goBack() {
        this.router.navigate(['intern']);
    }

    cancelPhoto() {
        this.saveCamera = false;
        WebCamera.reset();
    }

    openCamera() {
        this.saveCamera = true;
        setTimeout(() =>
        WebCamera.attach('#camera')
        ,500);
    }

    openFile() {
        const options: OpenDialogOptions = {};
        const files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), options);
        this.readFile(files[0]);
    }


    private readFile(file: string) {
        const This = this;
        fs.readFile(file, function (err, data) {
            if (err) {
                return console.error(err);
            }

            /**
             * this is the old way to save photo on db
             */
            //This.intern.photo = data.toString('base64');
            //This.getPhoto(data);

            /**
             * this the new way to save photo on disk
             */
            const name = new Date().getTime().toString() + '.png';
            fs.writeFile(path.join(Settings.imgFolder, name), data, (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
                This.intern.photo = path.join(Settings.imgFolder, name);
                This.photo = This.intern.photo;
                (document.getElementById('name') as HTMLElement).focus();
            });
        });
    }

    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }


    /**
     * new methods to save photo on disk
     */

    downloadFile(name: string, data: any) {
        const sampleArr = this.base64ToArrayBuffer(data);
        fs.writeFile(path.join(Settings.imgFolder, name), sampleArr, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
            this.photo = path.join(Settings.imgFolder, name);
            this.intern.photo = this.photo;
            (document.getElementById('name') as HTMLElement).focus();
        });
    }

    base64ToArrayBuffer(data: any) {
        const binaryString = window.atob(data);
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
            const ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    }

}
