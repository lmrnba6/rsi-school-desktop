import { Component, OnInit } from '@angular/core';
import { DialogsService } from '../_services/dialogs.service';
import { Router } from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './instructor.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Instructor} from "../model/instructor";
import {AuthenticationService} from "../_services/authentication.service";
import {MessagesService} from "../_services/messages.service";
@Component({
  selector: 'app-instructor',
  templateUrl: './instructor.component.html',
})
export class InstructorComponent implements OnInit {

  public filter: string = '';
  public data: any;
  public tableName: string;
  public setting: AbstractTableSetting;
  public instructor: Instructor;
  public block: boolean;
  public color: string = 'warn';
  public mode: string = 'indeterminate';
  public value: number = 100;
  public pageIndex: number = 0;
  public pageSize: number = 5;
  public sortName: string = 'name';
  public sortDirection: string = 'ASC';

  constructor(
    private dialogsService: DialogsService,
    public messagesService: MessagesService,
    private router: Router,
    private translate: TranslateService,
    private authService: AuthenticationService) { }

  ngOnInit(): void {
    if(this.authService.getCurrentUser().role === 'teacher') {
      Instructor.getByPhone(this.authService.getCurrentUser().username).then(instructor => {
          instructor && this.router.navigate(['instructor-management/' + instructor.id]);
      })
    }
    this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
    this.initSetting();
  }


  public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
    const offset: number = pageIndex * pageSize;
    const limit: number = pageSize;
    this.block = true;
    Promise.all([Instructor
      .getAllPaged(offset, limit, sort, order, filter),Instructor.getCount(this.filter)])
      .then(
        values => {
          this.block = false;
          this.data = { items: values[0], paging: {totalCount: (values[1][0] as any).count}};
        },
          () => {
          this.block = false;
            this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
        });
  }

  /**
   * sortOnChange
   */
  public sortOnChange(event: any): void {
    this.sortName = event.col;
    this.sortDirection = event.sortDirection.length ? event.sortDirection : 'ASC';
    this.pageIndex = 0;
    this.getDataTable(this.pageIndex, this.pageSize, event.col, event.sortDirection, this.filter);
  }

  /**
   * onPageChange
   */
  public onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize =  event.pageSize;
    this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
  }

  public initSetting(): void {
    this.setting = new AbstractTableSetting();
    this.setting.settingColumn = true;
    this.setting.tableName = this.tableName;
    this.setting.filter = true;
    this.setting.addRow = true;
    this.setting.cols = [
      { columnDef: 'name', header: 'instructor.placeholder.name', type: 'text', cell: (row: any) => `${row.name}` },
      {
        columnDef: 'phone',
        header: 'instructor.placeholder.phone',
        type: 'text',
        cell: (row: any) => `0${row.phone}`
      },
      { columnDef: 'email', header: 'instructor.placeholder.email', type: 'text', cell: (row: any) => `${row.email}` },
        { columnDef: 'sold', header: 'instructor.placeholder.sold', type: 'text', cell: (row: any) => `${row.sold}` },
        { columnDef: 'settings', header: '', type: 'settings', delete: true, editRow: true },
    ];
  }
  /**
   * init data
   */
  public onRowDeleted(id: number): void {
    this.dialogsService
      .confirm('messages.warning_title', 'messages.remove_row_warning_message', true, 'warning-sign')
      .subscribe(confirm => {
        if (confirm) {
          this.block = true;
          Instructor
            .delete(id)
            .then(
                () => {
              this.block = false;
              this.data = [];
              this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
              this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
            },
                () => {
              this.block = false;
              this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
            }
            );
        }
      });
  }

  /**
   * add row
   */
  public onAddRow(): void {
    this.router.navigate(['instructors/forms']);
  }

  /**
   * onEditRow
   */
  public onEditRow(event: Instructor): void {
    this.instructor = event;
    this.router.navigate(['instructor-management/' + event.id]);

  }

  onFilter(filter: string) {
    this.filter = filter;
    this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
  }

}
