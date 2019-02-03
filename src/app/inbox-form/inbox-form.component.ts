import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Inbox} from "../model/inbox";
import './inbox-form.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {AuthenticationService} from "../_services/authentication.service";
import {User} from "../model/user";
import {MessagesService} from "../_services/messages.service";
import {Attachment} from "../model/attachment";
@Component({
    selector: 'app-inbox-form',
    templateUrl: './inbox-form.component.html',
})
export class InboxFormComponent implements OnInit {

    public inbox: Inbox;
    public isOnEdit: boolean;
    public inboxForm: FormGroup;
    public subject: FormControl;
    public content: FormControl;
    public to: FormControl;
    public users: Array<User> = [];
    public usersFiltered: Array<User> = [];
    public userSelected: User;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public user: User;
    public attachments: Array<Attachment> = [];

    constructor(private fb: FormBuilder,
                private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService,
                private authService: AuthenticationService,
                private messagesService: MessagesService
                ) {
    }

    public ngOnInit(): void {
        this.user = this.authService.getCurrentUser();
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
                this.inbox = new Inbox();
                this.inbox.date = new Date();
            }
            this.initForm();
        });
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
     * @param  {string} name inbox name
     * @returns void
     */
    public getData(id: number): void {
        Inbox
            .get(id)
            .then((val: Inbox) => {
                this.inbox = val;
                if(this.inbox.from !== this.user.id ) {
                    this.inbox.read = 1;
                    this.inbox.update().then();
                }
                this.getAttachments(this.inbox.id);
                this.inbox.date = new Date(Number(this.inbox.date));
                this.messagesService.messagesSubject.next(null);
            });
    }

    getAttachments(id: number) {
        Attachment.getByInbox(id).then(attachments => this.attachments = attachments);
    }



    onUpload(event: any) {
        const _this = this;
        let reader = new FileReader();
        if(event.target.files && event.target.files.length > 0) {
            let file = event.target.files[0];
            reader.readAsDataURL(file);
            reader.onload = () => {
                const attachment = new Attachment();
                attachment.file = (reader.result as string).split(',')[1];
                attachment.name = file.name;
                attachment.type = file.type;
                _this.attachments.push(attachment as Attachment);
            };
        }
    }

    removeAttachment(file: Attachment) {
        this.attachments = this.attachments.filter(attachment => attachment.name !== file.name);
    }

    downloadFile(attachment: Attachment) {
        const sampleArr = this.base64ToArrayBuffer(attachment);
        this.saveByteArray(attachment.name, sampleArr, attachment.type);
    }

    base64ToArrayBuffer(attachment: Attachment) {
        const binaryString = window.atob(attachment.file);
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
            const ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    }

    saveByteArray(reportName: string, byte: any, type: string) {
        const blob = new Blob([byte], {type});
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        const fileName = reportName;
        link.download = fileName;
        link.click();
        this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
    };

    public initForm(): void {
        this.subject = new FormControl(null, [Validators.required]);
        this.content = new FormControl(null, [Validators.required]);
        this.to = new FormControl(null, [Validators.required]);

        this.inboxForm = this.fb.group({
            subject: this.subject,
            content: this.content,
            to: this.to,
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
        this.inbox.date = new Date().getTime();
        this.inbox.from = this.user.id;
        this.inbox.to = (this.userSelected as User).id;
        let internPromise: Promise<any>;
        if (this.isOnEdit) {
            internPromise = this.inbox.update();
        } else {
            internPromise = this.inbox.insert();
        }
        this.block = true;
        internPromise.then(
            () => {
                this.block = false;
                this.goBack();
                this.saveAttachments(this.inbox.id);
                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
            () => {
                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                this.block = false;
            });

    }

    saveAttachments(id: number) {
        this.attachments.forEach(attachment => {
            attachment.inbox_id = id;
            this.block = true;
            attachment.insert().then(
                () => {
                    this.block = false;
                },
                () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false;
                });
        });
    }

    goBack() {
        this.router.navigate([`messages/inbox/${this.inbox.from === this.user.id ? 'sent' : 'inbox'}`]);
    }


    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

}
