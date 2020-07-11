import {RouterModule, Routes} from '@angular/router';


import {LoginComponent} from './login/login.component';
import {LayoutComponent} from "./layout/layout.component";
import {HomeComponent} from "./home/home.component";
import {AuthGuard} from './_guards/auth.guard';
import {AdministrationComponent} from "./administration/administration.component";
import {UserComponent} from "./user/user.component";
import {UserFormComponent} from "./user-form/user-form.component";
import {InternComponent} from "./intern/intern.component";
import {InternFormComponent} from "./intern-form/intern-form.component";
import {InstructorComponent} from "./instructor/instructor.component";
import {InstructorFormComponent} from "./instructor-form/instructor-form.component";
import {PaymentComponent} from "./payment/payment.component";
import {PaymentFormComponent} from "./payment-form/payment-form.component";
import {SessionComponent} from "./session/session.component";
import {SessionFormComponent} from "./session-form/session-form.component";
import {TrainingComponent} from "./training/training.component";
import {TrainingFormComponent} from "./training-form/training-form.component";
import {RoomComponent} from "./room/room.component";
import {RoomFormComponent} from "./room-form/room-form.component";
import {ExamComponent} from "./exam/exam.component";
import {ExamFormComponent} from "./exam-form/exam-form.component";
import {CourseComponent} from "./course/course.component";
import {CourseFormComponent} from "./course-form/course-form.component";
import {AttendanceFormComponent} from "./attendance-form/attendance-form.component";
import {InternManagementComponent} from "./intern-management/intern-management.component";
import {AttendanceComponent} from "./attendance/attendance.component";
import {EnrollmentComponent} from "./enrollment/enrollment.component";
import {EnrollmentFormComponent} from "./enrollment-form/enrollment-form.component";
import {DocumentComponent} from "./document/document.component";
import {PvComponent} from "./pv/pv.component";
import {ResultComponent} from "./result/result.component";
import {WeekdayComponent} from "./weekday/weekday.component";
import {WeekdayFormComponent} from "./weekday-form/weekday-form.component";
import {InstructorManagementComponent} from "./instructor-management/instructor-management.component";
import {SessionManagementComponent} from "./session-management/session-management.component";
import {WeekdayManagementComponent} from "./weekday-management/weekday-management.component";
import {RoomManagementComponent} from "./room-management/room-management.component";
import {InternEnrollFormComponent} from "./intern-enroll-form/intern-enroll-form.component";
import {VisitorComponent} from "./visitor/visitor.component";
import {VisitorFormComponent} from "./visitor-form/visitor-form.component";
import {PaymentsComponent} from "./payments/payments.component";
import {PaymentInstructorComponent} from "./payment-instructor/payment-instructor.component";
import {PaymentInstructorFormComponent} from "./payment-instructor-form/payment-instructor-form.component";
import {AccountingComponent} from "./accounting/accounting.component";
import {DatabaseComponent} from "./database/database.component";
import {SchoolComponent} from "./school/school.component";
import {InboxComponent} from "./inbox/inbox.component";
import {InboxFormComponent} from "./inbox-form/inbox-form.component";
import {MessagesComponent} from "./messages/messages.component";
import {RegisterComponent} from "./register/register.component";
import {RegisterFormComponent} from "./register-form/register-form.component";
import {ChargeFormComponent} from "./charge-form/charge-form.component";

const appRoutes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                component: HomeComponent
            },
            {
                path: 'instructor/:instructor',
                component: HomeComponent
            },
            {
                path: 'interns/:intern',
                component: HomeComponent
            },
            {
                path: 'settings',
                component: AdministrationComponent
            },
            {
                path: 'inbox',
                component: InboxComponent
            },
            {
                path: 'inbox/form',
                component: InboxFormComponent
            },
            {
                path: 'inbox/form/:id',
                component: InboxFormComponent
            },
            {
                path: 'settings/database',
                component: DatabaseComponent
            },
            {
                path: 'settings/school',
                component: SchoolComponent
            },
            {
                path: 'settings/users',
                component: UserComponent
            },
            {
                path: 'settings/users/form',
                component: UserFormComponent
            },
            {
                path: 'settings/users/form/:id',
                component: UserFormComponent
            },
            {
                path: 'intern',
                component: InternComponent
            },
            {
                path: 'intern/form',
                component: InternFormComponent
            },
            {
                path: 'intern/form/:id',
                component: InternFormComponent
            },
            {
                path: 'intern-transfer/:name/:phone/:visitor',
                component: InternFormComponent
            },
            {
                path: 'visitor',
                component: VisitorComponent
            },
            {
                path: 'visitor/form',
                component: VisitorFormComponent
            },
            {
                path: 'visitor/form/:id',
                component: VisitorFormComponent
            },
            {
                path: 'instructor',
                component: InstructorComponent
            },
            {
                path: 'instructors/forms',
                component: InstructorFormComponent
            },
            {
                path: 'instructors/forms/:id',
                component: InstructorFormComponent
            },
            {
                path: 'payment',
                component: PaymentComponent
            },
            {
                path: 'payment/form',
                component: PaymentFormComponent
            },
            {
                path: 'payment/form/:id',
                component: PaymentFormComponent
            },
            {
                path: 'charge/form/:id',
                component: ChargeFormComponent
            },
            {
                path: 'charge/form/:id/:charge',
                component: ChargeFormComponent
            },
            {
                path: 'payment/express/:in/:tr',
                component: PaymentFormComponent
            },
            {
                path: 'session',
                component: SessionComponent
            },
            {
                path: 'session/form',
                component: SessionFormComponent
            },
            {
                path: 'session/form/:id',
                component: SessionFormComponent
            },
            {
                path: 'training',
                component: TrainingComponent
            },
            {
                path: 'training/form',
                component: TrainingFormComponent
            },
            {
                path: 'training/form/:id',
                component: TrainingFormComponent
            },
            {
                path: 'room',
                component: RoomComponent
            },
            {
                path: 'room/form',
                component: RoomFormComponent
            },
            {
                path: 'room/form/:id',
                component: RoomFormComponent
            },
            {
                path: 'exam',
                component: ExamComponent
            },
            {
                path: 'exam/form',
                component: ExamFormComponent
            },
            {
                path: 'exam/form/:id',
                component: ExamFormComponent
            },
            {
                path: 'course',
                component: CourseComponent
            },
            {
                path: 'course/form',
                component: CourseFormComponent
            },
            {
                path: 'course/form/:id',
                component: CourseFormComponent
            },
            {
                path: 'attendance',
                component: AttendanceComponent
            },
            {
                path: 'attendance-instructor/:instructorId',
                component: AttendanceComponent
            },
            {
                path: 'attendance/form-instructor/:instructorId',
                component: AttendanceFormComponent
            },
            {
                path: 'attendance/form/:id',
                component: AttendanceFormComponent
            },
            {
                path: 'attendance/form',
                component: AttendanceFormComponent
            },
            {
                path: 'intern-management/:id',
                component: InternManagementComponent
            },
            {
                path: 'instructor-management/:id',
                component: InstructorManagementComponent
            },
            {
                path: 'session-management/:id',
                component: SessionManagementComponent
            },
            {
                path: 'weekday-management/:id',
                component: WeekdayManagementComponent
            },
            {
                path: 'room-management/:id',
                component: RoomManagementComponent
            },
            {
                path: 'enrollment',
                component: EnrollmentComponent
            },
            {
                path: 'enrollment/form',
                component: EnrollmentFormComponent
            },
            {
                path: 'enrollment/express/:in',
                component: EnrollmentFormComponent
            },
            {
                path: 'enrollment/form/:id',
                component: EnrollmentFormComponent
            },
            {
                path: 'weekday',
                component: WeekdayComponent
            },
            {
                path: 'weekday/form',
                component: WeekdayFormComponent
            },
            {
                path: 'weekday/form/:id',
                component: WeekdayFormComponent
            },
            {
                path: 'document',
                component: DocumentComponent
            },
            {
                path: 'document/pv/:name/:id',
                component: PvComponent
            },
            {
                path: 'result',
                component: ResultComponent
            },
            {
                path: 'messages',
                component: MessagesComponent
            },
            {
                path: 'messages/inbox/:type',
                component: InboxComponent
            },
            {
                path: 'payments',
                component: PaymentsComponent
            },
            {
                path: 'register',
                component: RegisterComponent
            },
            {
                path: 'register/form',
                component: RegisterFormComponent
            },
            {
                path: 'register/form/type/:type',
                component: RegisterFormComponent
            },
            {
                path: 'register/form/:id',
                component: RegisterFormComponent
            },
            {
                path: 'payments/intern',
                component: PaymentComponent
            },
            {
                path: 'payments/instructors',
                component: PaymentInstructorComponent
            },
            {
                path: 'payments/instructors/form',
                component: PaymentInstructorFormComponent
            },
            {
                path: 'payments/instructors/:id',
                component: PaymentInstructorFormComponent
            },
            {
                path: 'accounting',
                component: AccountingComponent
            },
        ]
    },
    //{path: 'unauthorized', component: LoginComponent},
    {path: 'login', component: LoginComponent},
    {path: 'intern-enroll', component: InternEnrollFormComponent},
    // otherwise redirect to home
    {path: '**', redirectTo: ''}
];

export const routing = RouterModule.forRoot(appRoutes, {enableTracing: false});
