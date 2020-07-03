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

    public schoolForm: FormGroup;
    public name: FormControl;
    public dist: FormControl;
    public photo: any;
    public block: boolean;
    public school: School;


    constructor(private fb: FormBuilder,
                public messagesService: MessagesService,
                private router: Router,
                private translate: TranslateService
                ) {}

  ngOnInit() {
        this.getData();
      this.initForm();
  }

    public initForm(): void {
        this.name = new FormControl(null, [Validators.required]);
        this.dist = new FormControl(null);
        this.schoolForm = this.fb.group({
            name: this.name,
            dist: this.dist
        });
    }

    public getData(): void {
        School
            .getAll()
            .then(val => {
                if(val.length) {
                    this.school = val[0];
                    this.photo = 'data:image/png;base64,' + this.school.photo;
                }else {
                    const school = new School();
                    school.name = '';
                    school.photo = '';
                    school.dist = '';
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
