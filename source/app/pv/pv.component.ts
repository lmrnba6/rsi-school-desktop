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
import {Payment_instructor} from "../model/paymentInstructor";

@Component({
  selector: 'app-pv',
  templateUrl: './pv.component.html'
})
export class PvComponent implements OnInit {
    logo = ''
    address = '';
    phone1 = '';
    phone2 = '';
    email = '';
    website = '';
    data: any;
    pvName: string;
    id: number;
    for: string;
    date: Date = new Date;
    options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDiploma: string = '';
    title: string;
    center: string;
    payment: Payment;
    payment_code: string;
    object: string;
    session: Session ;
    trainingName: string;
    sessions: Array<any> = [] ;
    instructor: Instructor;
    training: Training;
    interns: Array<Intern> = [];
    internsCard: string = '';
    results: Array<any> = [];
    intern: Intern;
    payments: Array<Payment> = [];
    attendances: Array<Attendance>  = []
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public orientation: string = 'landscape';

    constructor(private route: ActivatedRoute,
                private router: Router,
                private translate: TranslateService) {}


    ngOnInit() {
        this.getParams();
        if(this.pvName !== 'card') {
            this.getDataTableByDate();
            this.getInternsBySession();
        }
        this.title = this.pvName === 'form' ? this.translate.instant('pv.form') : this.pvName === 'receipt' ? this.translate.instant('pv.receipt') : this.title;
        this.dateDiploma = new Date().toLocaleDateString('fr-FR');
        this.getCenter();
    }

    capitalize(s) {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    onSessionNameChange(t: Session) {
        this.trainingName = t ? t['training'] : '';
    }

    getCenter() {
        this.block = true;
        School.getAll().then(school => {
            this.block = false;
            if(school.length) {
                this.center = school[0].name;
                this.logo = 'data:image/png;base64,' + school[0].photo;
                this.address = school[0].address;
                this.phone1 = school[0].phone1;
                this.phone2 = school[0].phone2;
                this.email = school[0].email;
                this.website = school[0].website;
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
        if(this.pvName === 'card') {
            const promises: Array<Promise<Intern>> = [];
            this.internsCard.split(',').forEach(i => promises.push(Intern.get(Number(i))));
            Promise.all(promises).then(val => {
                this.interns = val;
                this.interns.forEach((intern, i) => {
                    JsBarcode("#barcode" + i, intern.id.toString().padStart(10, '0'), {
                        width: 2,
                        height: 40
                    });
                })
            });
        }else {
            if(this.for === 'instructor') {
                Instructor.get(this.id as number).then(intern => {
                    this.instructor = intern;
                    (this.intern as any) = intern;
                    this.getInstructorReceipts();
                })
            } else {
                Intern.get(this.id as number).then(intern => {
                    this.intern = intern;
                    this.getInternReceipts();
                    this.getInternTraining();
                    this.getSessions();
                    this.pvName === 'form' && JsBarcode("#barcode2", this.intern.id.toString().padStart(10, '0'), {width:2,
                        height:40});
                })
            }
        }
    }

    getInternTraining() {
        this.block = true;
        Session.get(this.intern.id).then(session =>
            Training.get(session.training_id as number).then(
                training => {
                    this.block = false;
                    this.training = training
                }));
    }

    getInternReceipts() {
        this.block = true;
        Payment.getAllByIntern(this.intern.id).then(payments => {
            this.block = false;
            this.payments = payments;
            this.payments.forEach(payment => payment.date = new Date(Number(payment.date)).toLocaleDateString('fr-FR') as any);
            if(this.payments.length) {
                this.payment = this.payments[0];
            }
            this.onPaymentChange();
        })
    }

    getInstructorReceipts() {
        this.block = true;
        Payment_instructor.getAllByInstructor(this.instructor.id).then((payments: any) => {
            this.block = false;
            this.payments = payments;
            this.payments.forEach(payment => payment.date = new Date(Number(payment.date)).toLocaleDateString('fr-FR') as any);
            if(this.payments.length) {
                this.payment = this.payments[0];
            }
            this.onPaymentChange();
        })
    }

    getDataTableByDate() {
        this.interns = [];
        this.block = true;
        Promise.all([Enrollment.getAllBySession(this.id), Attendance.getAllBySession(this.id)])
            .then(values => {
                this.attendances = values[1].slice(0,5);
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
            this.for = res.for;
            this.id = res.id;
            if(res.name === 'card'){
                this.internsCard = res.interns;
            }
            this.title = this.pvName === 'intern' ? this.translate.instant('pv.student_list') : this.title;
            this.getIntern();
        });
    }

    print() {
        let modal = window.open('', 'modal');
        modal!.document.write(document.getElementById(this.pvName)!.outerHTML );
        modal!.document.close();
        setTimeout(() => {modal!.print();}, 100);
    }

    goBack() {
        this.router.navigate(['document']);
    }

    getDate(date: number) {

        return date && Number(date) ? new Date(Number(date)).toISOString().slice(0, 10) : ''

    }

}


