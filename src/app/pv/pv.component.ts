import {Component, OnInit} from '@angular/core';
import './pv.component.scss';
import {ActivatedRoute, Router} from "@angular/router";
import {Intern} from "../model/intern";
import {TranslateService} from "@ngx-translate/core";
import {Session} from "../model/session";
import {Instructor} from "../model/instructor";
import {Training} from "../model/training";
import {Payment} from "../model/payment";
import * as JsBarcode from "jsbarcode";
import {Enrollment} from "../model/enrollment";
import {Attendance} from "../model/attendance";
import {School} from "../model/school";

@Component({
  selector: 'app-pv',
  templateUrl: './pv.component.html'
})
export class PvComponent implements OnInit {
    logo = ''
    data: any;
    pvName: string;
    id: number;
    date: Date = new Date;
    title: string;
    center: string;
    payment: Payment;
    payment_code: string;
    object: string;
    session: Session ;
    sessions: Array<any> = [] ;
    instructor: Instructor;
    training: Training;
    interns: Array<Intern> = [];
    results: Array<any> = [];
    intern: Intern;
    payments: Array<Payment> = [];
    attendances: Array<Attendance>  = []
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService) {}


    ngOnInit() {
        this.getParams();
        this.getDataTableByDate();
        this.getInternsBySession();
        this.title = this.pvName === 'form' ? this.translate.instant('pv.form') : this.title;
        this.getCenter();
    }

    getCenter() {
        this.block = true;
        School.getAll().then(school => {
            this.block = false;
            if(school.length) {
                this.center = school[0].name;
                this.logo = 'data:image/png;base64,' + school[0].photo;
            }
        })
    }

    onPaymentChange() {
        if(this.payment) {
            this.payment_code = new Date().getFullYear().toString().slice(2) + '/' + (new Date().getMonth() + 1) + '/' + this.payment.id.toString();
        }
    }

    getSessions() {
        this.block = true;
        Enrollment.getAllByIntern(this.intern.id).then(enrollments => {
            this.block = false;
            this.sessions = enrollments;
        });
    }

    getIntern() {
        Intern.get(this.id as number).then(intern => {
            this.intern = intern;
            this.getReceipts();
            this.getTraining();
            this.getSessions();
            this.pvName === 'card' && JsBarcode("#barcode", this.intern.phone.toString() + this.intern.id.toString(), {width:2,
                height:40});
            this.pvName === 'form' && JsBarcode("#barcode2", this.intern.phone.toString() + this.intern.id.toString(), {width:2,
                height:40});
        });
    }

    getTraining() {
        this.block = true;
        Session.get(this.intern.id).then(session =>
            Training.get(session.training_id as number).then(
                training => {
                    this.block = false;
                    this.training = training
                }));
    }

    getReceipts() {
        this.block = true;
        Payment.getAllByIntern(this.intern.id).then(payments => {
            this.block = false;
            this.payments = payments;
            this.payments.forEach(payment => payment.date = new Date(Number(payment.date)).toLocaleDateString('fr-FR') as any);
            if(this.payments.length) {
                this.payment = this.payments[this.payments.length - 1];
            }
            this.onPaymentChange();
        })
    }

    getDataTableByDate() {
        this.interns = [];
        this.block = true;
        Promise.all([Enrollment.getAllBySession(this.id), Attendance.getAlldBySession(this.id)])
            .then(values => {
                this.attendances = values[1];
                this.attendances.forEach(attendance => attendance.date = new Date(Number(attendance.date)).toLocaleDateString('fr-FR') as any);
                    this.asyncForEach(values[0], async (enrollment: any) => {
                        await Promise.all([Attendance.getAlldByIntern(enrollment.intern_id as number), Intern.get(enrollment.intern_id as number)])
                            .then((values: any) => {
                                const intern = values[1];
                                intern['attendances'] = values[0];
                                this.interns.push(intern);
                            });
                    });
                });
    }

    async asyncForEach(array: any, callback: any) {
        this.block = true;
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
        this.block = false;
        this.interns = [...this.interns];
        (document.getElementById('test') as HTMLElement).focus();
    }


    getInternsBySession() {
        // Intern.getInternBySession(this.id).then(interns => {
        //     this.interns = interns;
        //     this.interns.forEach(intern => {
        //         intern.birth = new Date(Number(intern.birth)).toLocaleDateString('fr-FR') as any;
        //     } );
        // });
        this.block = true;
        this.pvName !== 'card' && Session.get(this.id).then(session => {
            this.session = session;
            Instructor.get(session.instructor_id as number).then(instructor => {
                this.block = false;
                this.instructor = instructor;
            });
            Training.get(this.session.training_id as number).then(training => {
                this.block = false;
                this.training = training
            })
        });
    }

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            this.pvName = res.name;
            this.id = res.id;
            this.title = this.pvName === 'intern' ? this.translate.instant('pv.student_list') : this.title;
            this.getIntern();
        });
    }

    print() {
        let modal = window.open('', 'modal');
        modal!.document.write('<html><head><title>my div</title>');
        modal!.document.write('</head><body >');
            modal!.document.write('<style type="text/css">tables {color: red;}</style>');
        modal!.document.write(document.getElementById(this.pvName)!.innerHTML );
        modal!.document.write('</body></html>');
        modal!.print();
    }

    goBack() {
        this.router.navigate(['document']);
    }

    getDate(date: number) {

        return date ? new Date(date).toISOString().slice(0, 10) : ''

    }

}


