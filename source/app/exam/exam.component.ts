import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DialogsService} from '../_services/dialogs.service';
import {MessagesService} from "../_services/messages.service";
import {Router} from '@angular/router';
import {AbstractTableSetting} from "../model/abstractTableSetting";
import './exam.component.scss';
import {TranslateService} from "@ngx-translate/core";
import {Exam} from "../model/exam";
import {Intern} from "../model/intern";
import {AuthenticationService} from "../_services/authentication.service";
import {Session} from "../model/session";
import {User} from "../model/user";
import {Instructor} from "../model/instructor";

@Component({
    selector: 'app-exam',
    templateUrl: './exam.component.html',
})
export class ExamComponent implements OnInit, OnChanges {

    @Input() public intern: Intern;
    @Input() public session: Session;
    public internOpen: boolean;
    public sessionSelected: any;
    public tabSelected: number = 1;
    public filter: string = '';
    public data: any;
    public dataBySession: any;
    public dataByInterns: any;
    public tableName: string;
    public setting: AbstractTableSetting;
    public settingByInterns: AbstractTableSetting;
    public settingBySession: AbstractTableSetting;
    public exam: Exam;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public pageIndex: number = 0;
    public pageSize: number = 10;
    public sortName: string = 'date';
    public sortDirection: string = 'DESC';
    public isAdmin: boolean;
    public isUser: boolean;
    public isInstructor: boolean;
    public instructor: Instructor;
    public user: User;
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;
    public sessionImage = `${this.getPath()}dist/assets/images/sessionImage.png`;
    public internImage = `${this.getPath()}dist/assets/images/internImage.png`;

    constructor(
        private dialogsService: DialogsService,
        public messagesService: MessagesService,
        private router: Router,
        private translate: TranslateService,
        private authService: AuthenticationService) {
    }

    ngOnInit(): void {
        this.user = this.authService.getCurrentUser();
        this.isAdmin = this.user.role === 'admin';
        this.isUser = this.user.role === 'user';
        this.isInstructor = this.user.role === 'teacher';
        if (this.isInstructor) {
            this.getDataTableForInstructor(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        } else {
            this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        }
        this.initSetting();
        this.initSettingBySession();
        this.initSettingByInterns();
    }

    ngOnChanges(): void {
        if (this.isInstructor) {
            this.getDataTableForInstructor(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        } else {
            this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        }
        this.initSetting();
        this.initSettingBySession();
        this.initSettingByInterns();
    }

    getPath() {
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }

    goBack() {
        this.router.navigate(['assessment']);
    }

    public getDataTableForInstructor(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Instructor.getByUser(this.user.id).then(instructor => {
            Promise.all([this.tabSelected === 1 ? Exam.getAllPagedByInstructor(offset, limit, sort, order, filter, instructor.id) :
                Exam.getAllPagedByInstructorGroupedBySession(offset, limit, sort, order, filter, instructor.id), this.tabSelected === 1 ?
                Exam.getCountByInstructor(this.filter, instructor.id) : Exam.getCountByInstructorGroupedBySession(this.filter, instructor.id)])
                .then(
                    values => {
                        this.block = false;
                        if (this.tabSelected === 0) {
                            this.dataBySession = {items: values[0], paging: {totalCount: values[1].length}};
                        } else {
                            this.data = {items: values[0], paging: {totalCount: (values[1][0] as any).count}};
                        }
                    },
                    () => {
                        this.block = false;
                        this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    });
        });
    }

    public getDataTable(pageIndex: number, pageSize: number, sort: string, order: string, filter: string): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([this.intern ?
            Exam.getAllPagedByIntern(offset, limit, sort, order, filter, this.intern.id) : this.session ?
                this.tabSelected === 1 ? Exam.getAllPagedBySession(offset, limit, sort, order, filter, this.session.id) :
                    Exam.getAllPagedGroupedBySession(offset, limit, sort, order, filter, this.session.id) :
                this.tabSelected === 1 ? Exam.getAllPaged(offset, limit, sort, order, filter) :
                    Exam.getAllPagedGroupedBySession(offset, limit, sort, order, filter),
            this.intern ? Exam.getCountByIntern(filter, this.intern.id) :
                this.session ? this.tabSelected === 1 ? Exam.getCountBySession(filter, this.session.id) :
                    Exam.getCountGroupedBySession(this.filter, this.session.id) :
                    this.tabSelected === 1 ? Exam.getCount(this.filter) : Exam.getCountGroupedBySession(this.filter)])
            .then(
                values => {
                    this.block = false;
                    if (this.tabSelected === 0) {
                        this.dataBySession = {items: values[0], paging: {totalCount: values[1].length}};
                    } else {
                        this.data = {items: values[0], paging: {totalCount: (values[1][0] as any).count}};
                    }
                },
                () => {
                    this.block = false;
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                });
    }

    public getDataTableByInterns(pageIndex: number, pageSize: number, sort: string, order: string, filter: string, sessionId: number, date: number): void {
        const offset: number = pageIndex * pageSize;
        const limit: number = pageSize;
        this.block = true;
        Promise.all([Exam.getAllPagedBySessionAndByDate(offset, limit, sort, order, filter, sessionId, date), Exam.getCountBySession(filter, sessionId)])
            .then(
                values => {
                    this.block = false;
                    this.dataByInterns = {items: values[0], paging: {totalCount: (values[1][0] as any).count}};
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
        if (this.isInstructor) {
            this.getDataTableForInstructor(this.pageIndex, this.pageSize, event.col, event.sortDirection, this.filter);
        } else {
            this.getDataTable(this.pageIndex, this.pageSize, event.col, event.sortDirection, this.filter);
        }

    }

    /**
     * onPageChange
     */
    public onPageChange(event: any): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        if (this.isInstructor) {
            this.getDataTableForInstructor(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        } else {
            this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        }
    }

    public initSettingByInterns(): void {
        this.settingByInterns = new AbstractTableSetting();
        this.settingByInterns.settingColumn = true;
        this.settingByInterns.tableName = this.tableName;
        this.settingByInterns.filter = false;
        this.settingByInterns.addRow = false;
        this.settingByInterns.paging = false;
        this.settingByInterns.cols = [
            {columnDef: 'date', header: 'exam.placeholder.date', type: 'date', cell: (row: any) => `${row.date}`},
            {
                columnDef: 'passed',
                header: 'exam.placeholder.passed',
                type: 'boolean',
                cell: (row: any) => `${row.passed}`
            },
            {
                columnDef: 'questionnaire',
                header: 'exam.placeholder.questionnaire_id',
                type: 'text',
                cell: (row: any) => `${row.questionnaire || ''}`
            },
            {columnDef: 'mark', header: 'exam.placeholder.mark', type: 'text', cell: (row: any) => `${row.mark || ''}`},
            {
                columnDef: 'result',
                header: 'exam.placeholder.result',
                type: 'boolean',
                cell: (row: any) => `${row.result}`
            },
            {
                columnDef: 'intern',
                header: 'exam.placeholder.intern_id',
                type: 'text',
                cell: (row: any) => `${row.intern}`
            },
            {
                columnDef: 'training',
                header: 'exam.placeholder.training_id',
                type: 'text',
                cell: (row: any) => `${row.training}`
            },
            {
                columnDef: 'session',
                header: 'exam.placeholder.session_id',
                type: 'text',
                cell: (row: any) => `${row.session}`
            }
        ];
        !this.intern && !this.session &&
        this.settingByInterns.cols.push({
            columnDef: 'settings',
            class: 'a10',
            header: '',
            type: 'settings',
            delete: this.isAdmin,
            editRow: this.isAdmin || this.isInstructor
        })
    }

    public initSetting(): void {
        this.setting = new AbstractTableSetting();
        this.setting.settingColumn = !this.session;
        this.setting.tableName = this.tableName;
        this.setting.filter = !this.intern && !this.session;
        this.setting.addRow = !this.session && (this.isAdmin || this.isUser || this.isInstructor);
        this.setting.cols = [
            {columnDef: 'date', header: 'exam.placeholder.date', type: 'date', cell: (row: any) => `${row.date}`},
            {
                columnDef: 'passed',
                header: 'exam.placeholder.passed',
                type: 'boolean',
                cell: (row: any) => `${row.passed}`
            },
            {
                columnDef: 'questionnaire',
                header: 'exam.placeholder.questionnaire_id',
                type: 'text',
                cell: (row: any) => `${row.questionnaire || ''}`
            },
            {columnDef: 'mark', header: 'exam.placeholder.mark', type: 'text', cell: (row: any) => `${row.mark || ''}`},
            {
                columnDef: 'result',
                header: 'exam.placeholder.result',
                type: 'boolean',
                cell: (row: any) => `${row.result}`
            },
            {
                columnDef: 'intern',
                header: 'exam.placeholder.intern_id',
                type: 'text',
                cell: (row: any) => `${row.intern}`
            },
            {
                columnDef: 'training',
                header: 'exam.placeholder.training_id',
                type: 'text',
                cell: (row: any) => `${row.training}`
            },
            {
                columnDef: 'session',
                header: 'exam.placeholder.session_id',
                type: 'text',
                cell: (row: any) => `${row.session}`
            }
        ];
        !this.session &&
        this.setting.cols.push({
            columnDef: 'settings',
            class: 'a10',
            header: '',
            type: 'settings',
            delete: this.isAdmin,
            editRow: this.intern || this.isAdmin || this.isInstructor
        })
    }

    public initSettingBySession(): void {
        this.settingBySession = new AbstractTableSetting();
        this.settingBySession.settingColumn = !this.intern;
        this.settingBySession.tableName = this.tableName;
        this.settingBySession.filter = !this.intern && !this.session;
        this.settingBySession.addRow = !this.session && (this.isAdmin || this.isUser || this.isInstructor);
        this.settingBySession.cols = [
            {columnDef: 'date', header: 'exam.placeholder.date', type: 'date', cell: (row: any) => `${row.date}`},
            {
                columnDef: 'questionnaire',
                header: 'exam.placeholder.questionnaire_id',
                type: 'text',
                cell: (row: any) => `${row.questionnaire || ''}`
            },
            {
                columnDef: 'session',
                header: 'exam.placeholder.session_id',
                type: 'text',
                cell: (row: any) => `${row.session}`
            },
            {
                columnDef: 'training',
                header: 'exam.placeholder.training_id',
                type: 'text',
                cell: (row: any) => `${row.training}`
            },
            {
                columnDef: 'interns',
                header: 'session.placeholder.interns',
                type: 'text',
                cell: (row: any) => `${row.interns}`
            },
            {
                columnDef: 'instructor',
                header: 'session.placeholder.instructor_id',
                type: 'text',
                cell: (row: any) => `${row.instructor}`
            },
        ];
        !this.intern &&
        this.settingBySession.cols.push({
            columnDef: 'settings',
            class: 'a10',
            header: '',
            type: 'settings',
            delete: this.isAdmin,
            editRow: !this.intern
        })
    }

    onTabChange() {
        this.internOpen = false;
        this.filter = '';
        this.pageIndex = 0;
        this.pageSize = 10;
        this.sortName = 'date';
        this.sortDirection = 'DESC';
        if (this.isInstructor) {
            this.getDataTableForInstructor(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        } else {
            this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        }

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
                    Exam
                        .delete(id)
                        .then(
                            () => {
                                this.block = false;
                                this.data = [];
                                if (this.isInstructor) {
                                    this.getDataTableForInstructor(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
                                } else {
                                    this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
                                }
                                this.messagesService.notifyMessage(this.translate.instant('messages.unable_delete_relation'), '', 'success');
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
        this.router.navigate([ this.intern ? ('exam/form/intern/' + this.intern.id) : 'exam/form']);
    }

    public onAddRowBySession(): void {
        this.router.navigate([ 'exam/form-by-session/group']);
    }

    /**
     * onEditRow
     */
    public onEditRow(event: Exam): void {
        this.exam = event;
        if(this.intern) {
            if(this.exam.questionnaire_id && !this.exam.passed) {
                this.router.navigate(['test/' + event.questionnaire_id + '/' + this.intern.id + '/' + this.exam.id]);
            } else {
                this.messagesService.notifyMessage(this.translate.instant('messages.no_questionnaire_attached_message'), '', 'error');
            }
        } else {
            this.router.navigate(['exam/form/' + event.id]);
        }
    }

    public onEditRowBySession(event: any): void {
        this.internOpen = true;
        this.sessionSelected = event;
        this.getDataTableByInterns(0, Number.MAX_SAFE_INTEGER, this.sortName, this.sortDirection, '', event.session_id, event.date)
    }

    onFilter(filter: string) {
        this.filter = filter;
        if (this.isInstructor) {
            this.getDataTableForInstructor(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        } else {
            this.getDataTable(this.pageIndex, this.pageSize, this.sortName, this.sortDirection, this.filter);
        }
    }

}
