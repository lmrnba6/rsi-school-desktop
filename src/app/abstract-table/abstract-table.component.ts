import {
    Component,
    OnInit,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    ViewChild, ViewEncapsulation
} from '@angular/core';
import { PageEvent } from '@angular/material';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import {
  MatPaginator,
  MatSort,
  MatTableDataSource,
} from '@angular/material';
const jspdf = require('jspdf');
const html2canvas = require('html2canvas');
import './abstract-table.component.scss';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import {MessagesService} from "../_services/messages.service";
import {Settings} from "../model/settings";

@Component({
  selector: 'app-abstract-table',
  templateUrl: './abstract-table.component.html',
    encapsulation : ViewEncapsulation.None
})
export class AbstractTableComponent
  implements OnInit, OnChanges, AfterViewInit {
  @Input() public data: any;
  @Input() public setting: AbstractTableSetting;
  @Output() deleteRow: EventEmitter<any> = new EventEmitter<any>();
  @Output() pageChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() tableChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() sortChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() addRow: EventEmitter<any> = new EventEmitter<any>();
  @Output() editRow: EventEmitter<any> = new EventEmitter<any>();
  @Output() filter: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public dataSource: MatTableDataSource<any>;
  public displayedColumns: any;
  public color: string = 'warn';
  public mode: string = 'indeterminate';
  public value: number = 100;
  public block: boolean;
  public length: number = 100;
  public pageSize: number = 5;
  public colsSelected: any = [];
  public search: boolean;
  public  rowSelected: any;
    public cols: any = [];
    public pageSizeOptions: Array<number> = [5, 10, 25, 100];
  public pageEvent: PageEvent;

  constructor(public messagesService: MessagesService, /*private translate: TranslateService*/) { }

  ngOnInit(): void { }

  ngOnChanges(): void {
    //prime table
      this.cols = [];
      this.colsSelected = [];
      this.setting.cols.forEach((x:any)=> {
          //x.header = x.header.length ? this.translate.instant(x.header) : '';
          this.colsSelected.push(x);
      });
      this.cols = this.colsSelected;
      //end prime table
      this.displayedColumns = this.setting.cols.map((x: any) => x.columnDef);
      if (this.data) {
      this.dataSource = new MatTableDataSource<any>(this.data.items);
      this.length = this.data.paging.totalCount;
    }
  }

    public captureScreen()
    {
        const data = document.getElementById('contentToConvert');
        html2canvas(data).then((canvas:any) => {
            // Few necessary setting options  
            const imgWidth = 208;
            //const pageHeight = 295;
            const imgHeight = canvas.height * imgWidth / canvas.width;
           // const heightLeft = imgHeight;

            const contentDataURL = canvas.toDataURL('image/png')
            let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
           // Orientation, // Landscape or Portrait
                //unit, // mm, cm, in
                //format // A2, A4 etc
            const position = 0;
            pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
            pdf.save('MYPdf.pdf'); // Generated PDF   
        });
    }

    ngAfterViewInit(): void {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

  public applyFilter(filter: any): void {
      if(filter.keyCode == 13) {
          let filterValue: string = filter.target.value.trim(); // Remove whitespace
          filterValue = Settings.isDbLocal ? filterValue.toLowerCase() : filterValue; // Datasource defaults to lowercase matches
          // this.dataSource.filter = filterValue;
          this.filter.emit(filterValue);
      }
  }

  public integerToString(date: string) {
    return new Date(Number(date)).toLocaleDateString('fr-FR');
  }

  /**
   * onDeleteRow
   */
  public onDeleteRow(id: number): void {
    this.deleteRow.emit(id);
  }

  /**
   * sortChange
   */
  public sortOnChange(col: string): void {
    this.paginator.pageIndex = 0;
    this.sortChange.emit({
      col,
      sortDirection: this.sort.direction
    });
  }

  /**
   * pageOnChange
   */
  public pageOnChange(event: any): void {
    this.pageChange.emit(event);
  }

    /**
     * pageOnChange
     */
    public tableOnChange(event: any): void {
        this.tableChange.emit(event);
    }

  /**
   * onEditRow
   */
  public onEditRow(data: any): void {
    this.editRow.emit(data);
  }

  /**
   * onAddRow
   */
  public onAddRow(): void {
    this.addRow.emit();
  }

}