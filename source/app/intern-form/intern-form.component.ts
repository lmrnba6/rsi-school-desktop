import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
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
import {School} from "../model/school";
import {DialogsService} from "../_services/dialogs.service";
import {Visitor} from "../model/visitor";
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
    public isTransfer: boolean;
    public visitorId: number;
    public internForm: FormGroup;
    public name: FormControl;
    public phone: FormControl;
    public phone2: FormControl;
    public sold: FormControl;
    public parent: FormControl;
    public email: FormControl;
    public address: FormControl;
    public comment: FormControl;
    public birth: FormControl;
    public name_arabic: FormControl;
    public scholar: FormControl;
    public phoneOptional: FormControl;
    public isAdmin: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public  photo: any;
    public dist: string;
    public saveCamera: boolean;
    public scholars = [
        'kindergarten',
        'elementary',
        'secondary',
        'high',
        'bachelor',
        'master',
        'phd'
    ];
    public isIntern: boolean;
    public isParent: boolean;
    public users: Array<User> = [];
    public usersFiltered: Array<User> = [];
    public userSelected: User;
    public user: User;
    public isPhoneOptional: boolean;

    constructor(private fb: FormBuilder,
                private dialogsService: DialogsService,
                public messagesService: MessagesService,
                private router: Router,
                private route: ActivatedRoute,
                private translate: TranslateService,
                private authService: AuthenticationService) {
    }

    public ngOnInit(): void {
        this.user = this.authService.getCurrentUser();
        this.isIntern = this.user.role === 'student';
        this.isAdmin = this.user.role === 'admin';
        this.isParent = this.user.role === 'parent';
        this.initForm();
        this.getParams();
        this.getImagesDist();
        //this.readFile(__dirname + '/assets/images/profile.png')
    }

    public getImagesDist() {
        School.getAll().then(school => {
            if(school.length > 0){
                this.dist = school[0].dist
            }
        });
    }
    public ngOnChanges() {
        this.initForm();
        this.getParams();
    }

    public ngOnDestroy() {
        WebCamera.reset();
        this.saveCamera = false;
    }

    public onPhoneChanged(): void {
        if(!this.isPhoneOptional){
            Intern.getByPhone(Number(this.intern.phone)).then(() => {
                    this.intern.phone = '';
                    this.messagesService.notifyMessage(this.translate.instant('messages.phone_exist'), '', 'error');
                }
            )
        }
    }

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.name && res.phone && res.visitor) {
                this.isOnEdit = false;
                this.isTransfer = true;
                this.visitorId = res.visitor;
                this.intern = new Intern();
                this.intern.phone = res.phone;
                this.intern.name = res.name;
            } else if (this.intern) {
                this.getData(this.intern.id);
                this.isOnEdit = true;
                this.isTransfer = false;
            } else {
                this.isOnEdit = false;
                this.isTransfer = false;
                this.intern = new Intern();
            }
        });
    }

    public displayFn(user: User) {
        return user ? user.name : this.userSelected ? this.userSelected.name : null;
    }

    public userOnChange(event: any): void {
        if(event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {            this.block = true;
            User.getAllPaged(0, 5, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.usersFiltered = users.filter(u => u.role === 'parent')
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
                this.intern.isPromo = this.intern.isPromo === 1 ? true : false;
                this.intern.isVip = this.intern.isVip === 1 ? true : false;
                this.intern.birth = new Date(Number(this.intern.birth));
                //this.photo = 'data:image/png;base64,' + this.intern.photo;
                this.photo = this.intern.photo;
                JsBarcode("#barcode", this.intern.id.toString().padStart(10, '0'));
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
        this.email = new FormControl(null);
        this.address = new FormControl(null);
        this.comment = new FormControl(null);
        this.phone = new FormControl(null, [Validators.required]);
        this.phone2 = new FormControl(null);
        this.sold = new FormControl({value: 0, disabled:!this.isAdmin});
        this.birth = new FormControl(null, [Validators.required]);
        this.name_arabic = new FormControl(null);
        this.scholar = new FormControl(null);
        this.parent = new FormControl(null);
        this.phoneOptional = new FormControl(null);

        this.internForm = this.fb.group({
            name: this.name,
            name_arabic: this.name_arabic,
            address: this.address,
            comment: this.comment,
            phone: this.phone,
            phone2: this.phone2,
            sold: this.sold,
            email: this.email,
            birth: this.birth,
            scholar: this.scholar,
            parent: this.parent,
            phoneOptional: this.phoneOptional
        });
    }

    goToEnrollment(id: number) {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.go_to_enrollment_message', true, 'pencil')
            .subscribe(confirm => {
                if (confirm) {
                    this.router.navigate(['/enrollment/express/' + id]);
                }
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
        this.intern.isPromo = this.intern.isPromo ? 1 : 0;
        this.intern.isVip = this.intern.isVip ? 1 : 0;
        this.intern.birth = (this.intern.birth as Date).getTime();
        if(this.userSelected) {
            this.intern.parent = this.userSelected.id;
        } else {
            this.intern.parent = null;
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
            if(this.isTransfer){
                this.deleteVisitor();
            }
            this.intern.id && this.goToEnrollment(this.intern.id);
            this.createUser();
            this.goBack();
            this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
        },
        () => {
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            this.block = false;
        });

    }

    public deleteVisitor(): void {
        this.block = true;
        Visitor.delete(this.visitorId).then(
            () => {
                this.block = false;
            },
            () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });
    }

    createUser() {
        if(!this.isOnEdit && !this.isPhoneOptional){
            const user: User = new User();
            user.role = 'student';
            user.name = this.intern.name;
            user.username = new Date().getTime().toString();
            user.password = new Date().getTime().toString();
            this.block = true;
            user.insert().then(
                () => {
                    this.block = false;
                    this.intern.user_id = user.id;
                    this.intern.updateUser().then();
                },
                () => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                })
        }
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
        if(this.isTransfer) {
            this.router.navigate(['visitor']);
        }else {
            this.router.navigate(['intern']);
        }
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
        files && this.readFile(files[0]);
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
        fs.writeFile(path.join(this.dist || Settings.imgFolder, name), sampleArr, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
            this.photo = path.join(this.dist || Settings.imgFolder, name);
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
