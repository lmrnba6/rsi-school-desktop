import { Component, OnInit } from '@angular/core';
import './accounting.component.scss';
import {Instructor} from "../model/instructor";
import {Session} from "../model/session";
import {Attendance} from "../model/attendance";
import {TranslateService} from "@ngx-translate/core";
import {MessagesService} from "../_services/messages.service";
@Component({
  selector: 'app-accounting',
  templateUrl: './accounting.component.html'
})
export class AccountingComponent implements OnInit {

    public instructors: Array<Instructor> = [];
    public sessions: Array<Session> = [];
    public instructorsFiltered: Array<Instructor> = [];
    public instructorSelected: Instructor;
    public months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    public month: string;
    public instructorRate: Array<number> = [];
    public attendances: Array<number> = [];
    public classRate: Array<number> = [];
    public salary: number = 0;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public searchImage = `../../dist/assets/images/searchImage.png`;
    constructor(private translate: TranslateService, private messagesService: MessagesService) { }

  ngOnInit() {
  }

  onMonthChange() {
    const currentYear = new Date().getFullYear();
    const currentMonth = this.months.indexOf(this.month);
    const start = new Date(currentYear,this.months.indexOf(this.month), 1);
    const end = new Date(new Date().getFullYear(),currentMonth, this.lastDay(currentYear, currentMonth));
    let index = 0;
      this.asyncForEach(this.sessions, async (session: any) => {
          await Attendance.getCountByMonth(session.id, start.getTime(), end.getTime()).then(
              attendance => {
                  this.attendances[index] = attendance['count'];
                  index++;
              });
      });
  }

  lastDay(y: number, m: number){
          return  new Date(y, m +1, 0).getDate();
  }

    async asyncForEach(array: any, callback: any) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
        this.attendances = [...this.attendances];
    }

    public displayFn(instructor: Instructor) {
        return instructor ? instructor.name : '';
    }

    public instructorOnChange(event: any): void {
        if(event.code !== 'ArrowDown' && event.code !== 'ArrowUp' && event.code !== 'NumpadEnter' && event.code !== 'Enter') {
            this.block = true;
            Instructor.getAllPaged(0, 5, 'name', '', event.target.value).then(
                users => {
                    this.block = false;
                    this.instructorsFiltered = users
                }, () => {
                    this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                    this.block = false
                });
        }
        //this.instructorsFiltered = this.instructors.filter(instructors => instructors.name.toLowerCase().includes(event.toLowerCase()));
    }

    result() {
    this.salary = 0;
      this.attendances.forEach((attendance: number , i: number) => {
        this.salary += attendance * this.instructorRate[i] * (this.classRate[i]/100);
      });
      this.salary = this.salary.toFixed(0) as any;
    }

    public instructorOnSelect(instructor: Instructor): void {
        this.instructorSelected = instructor;
        this.month = '';
        this.getSessions();
    }
    
    public getSessions() {
    Session.getAll().then(sessions =>
        this.sessions = sessions.filter(session =>
            session.instructor_id === this.instructorSelected.id));
    }

}
