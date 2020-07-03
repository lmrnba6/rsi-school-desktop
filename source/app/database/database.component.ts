import { Component, OnInit } from '@angular/core';
import './database.component.scss';
import {Router} from "@angular/router";
import {DialogsService} from "../_services/dialogs.service";
import {TranslateService} from "@ngx-translate/core";
import {MessagesService} from "../_services/messages.service";
import {Settings} from "../model/settings";
@Component({
  selector: 'app-database',
  templateUrl: './database.component.html'
})
export class DatabaseComponent implements OnInit {

  isDatabaseLocal: boolean = true;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

  constructor( private router: Router,
               private dialogsService: DialogsService,
               public messagesService: MessagesService,
               private translate: TranslateService) {
  }

  ngOnInit() {
  }

    onDatabaseLocalChange() {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.change_local_database_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    Settings.read();
                    Settings.isDbLocal = !Settings.isDbLocal;
                    Settings.write();
                    Settings.initialize();
                    this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                }else {
                  this.isDatabaseLocal = !this.isDatabaseLocal;
                }
                });
    }

    syncDatabase() {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.sync_database_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    this.block = true;
                    setTimeout(() =>{
                                this.block = false;
                                this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                            },
                            2000
                        );
                }
            });
    }

    /**
     * onCancel
     */
    public onCancel(): void {
        this.goBack();
    }

    goBack() {
      this.router.navigate(['settings']);
    }

}
