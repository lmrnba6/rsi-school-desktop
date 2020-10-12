import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {routing} from './app.routing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppComponent} from './app.component';
import {LoginComponent} from "./login/login.component";
import {NavComponent} from "./nav/nav.component";
import {FooterComponent} from "./footer/footer.component";
import {LayoutComponent} from "./layout/layout.component";
import {HomeComponent} from "./home/home.component";
import {
    MAT_DATE_LOCALE,
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatOptionModule,
    MatPaginatorIntl,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
} from "@angular/material";
import {UserComponent} from "./user/user.component";
import {UserFormComponent} from "./user-form/user-form.component";
import {RoleComponent} from "./role/role.component";
import {AdministrationComponent} from "./administration/administration.component";
import {AbstractTableComponent} from "./abstract-table/abstract-table.component";
import {LoaderComponent} from "./loader/loader.component";
import {CdkTableModule} from "@angular/cdk/table";
import {CommonModule} from "@angular/common";
import {ConfirmDialogComponent} from "./confirm-dialog/confirm-dialog.component";
import {InfoDialogComponent} from "./info-dialog/info-dialog.component";
import {MatPaginatorClass} from "./abstract-table/matPaginatorIntl";
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
import {ChartsModule} from "ng2-charts";
import {ChartComponent} from "./chart/chart.component";
import {InternEnrollFormComponent} from "./intern-enroll-form/intern-enroll-form.component";
import {VisitorComponent} from "./visitor/visitor.component";
import {VisitorFormComponent} from "./visitor-form/visitor-form.component";
import {PaymentInstructorFormComponent} from "./payment-instructor-form/payment-instructor-form.component";
import {PaymentsComponent} from "./payments/payments.component";
import {PaymentInstructorComponent} from "./payment-instructor/payment-instructor.component";
import {AccountingComponent} from "./accounting/accounting.component";
import {ButtonModule} from "primeng/button";
import {TableModule} from "primeng/table";
import {InputTextModule} from 'primeng/inputtext';
import {MessageModule, MessageService, MessagesModule, MultiSelectModule} from "primeng/primeng";
import {SchoolComponent} from "./school/school.component";
import {DatabaseComponent} from "./database/database.component";
import {InboxComponent} from "./inbox/inbox.component";
import {InboxFormComponent} from "./inbox-form/inbox-form.component";
import {IndicatorComponent} from "./indicator/indicator.component";
import {ToastModule} from "primeng/toast";
import {FabComponent} from "./fab/fab.component";
import {FloatingActionMenuModule} from "ng2-floating-action-menu";
import {MessagesComponent} from "./messages/messages.component";
import {SafePipe} from "./_pipes/safe.pipe";
import {RegisterComponent} from "./register/register.component";
import {RegisterFormComponent} from "./register-form/register-form.component";
import {ChargeComponent} from "./charge/charge.component";
import {ChargeFormComponent} from "./charge-form/charge-form.component";
import {CommentInternComponent} from "./comment-intern/comment-intern.component";
import {CommentInternFormComponent} from "./comment-intern-form/comment-intern-form.component";
import {CarComponent} from "./car/car.component";
import {CarFormComponent} from "./car-form/car-form.component";
import {TransportationComponent} from "./transportation/transportation.component";
import {TransportComponent} from "./transport/transport.component";
import {TransportFormComponent} from "./transport-form/transport-form.component";
import {CommuteComponent} from "./commute/commute.component";
import {CommuteFormComponent} from "./commute-form/commute-form.component";
import {CommutingComponent} from "./commuting/commuting.component";
import {PromptDialogComponent} from "./prompt-dialog/prompt-dialog.component";
import {CommentInstructorComponent} from "./comment-instructor/comment-instructor.component";
import {CommentInstructorFormComponent} from "./comment-instructor-form/comment-instructor-form.component";
import {AssessmentComponent} from "./assessment/assessment.component";
import {QuestionnaireComponent} from "./questionnaire/questionnaire.component";
import {QuestionnaireFormComponent} from "./questionnaire-form/questionnaire-form.component";
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {TestComponent} from "./test/test.component";
import {ReportComponent} from "./report/report.component";
import {LogsComponent} from "./logs/logs.component";


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            },
            isolate: true
        }),
        routing,
        MatTableModule,
        MatPaginatorModule,
        CdkTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatSortModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatDatepickerModule,
        CommonModule,
        MatButtonModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        MatOptionModule,
        MatCardModule,
        MatRadioModule,
        MatToolbarModule,
        MatMenuModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatListModule,
        MatExpansionModule,
        MatSelectModule,
        MatTabsModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatGridListModule,
        MatAutocompleteModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        ChartsModule,
        MatProgressBarModule,
        MatStepperModule,
        ButtonModule,
        TableModule,
        MultiSelectModule,
        InputTextModule,
        MatBadgeModule,
        MatChipsModule,
        MessageModule,
        MessagesModule,
        ToastModule,
        FloatingActionMenuModule,
        CKEditorModule,
        DragDropModule,
    ],
    declarations: [
        SafePipe,
        AppComponent,
        LoginComponent,
        NavComponent,
        FooterComponent,
        LayoutComponent,
        HomeComponent,
        UserComponent,
        UserFormComponent,
        RoleComponent,
        AdministrationComponent,
        AbstractTableComponent,
        LoaderComponent,
        ConfirmDialogComponent,
        InfoDialogComponent,
        InternComponent,
        InternFormComponent,
        InstructorComponent,
        InstructorFormComponent,
        PaymentComponent,
        PaymentFormComponent,
        SessionComponent,
        SessionFormComponent,
        TrainingComponent,
        TrainingFormComponent,
        RoomComponent,
        RoomFormComponent,
        ExamComponent,
        ExamFormComponent,
        CourseComponent,
        CourseFormComponent,
        AttendanceFormComponent,
        AttendanceComponent,
        EnrollmentComponent,
        EnrollmentFormComponent,
        InternManagementComponent,
        DocumentComponent,
        PvComponent,
        ResultComponent,
        WeekdayComponent,
        WeekdayFormComponent,
        InstructorManagementComponent,
        SessionManagementComponent,
        WeekdayManagementComponent,
        RoomManagementComponent,
        ChartComponent,
        InternEnrollFormComponent,
        VisitorComponent,
        VisitorFormComponent,
        PaymentInstructorComponent,
        PaymentInstructorFormComponent,
        PaymentsComponent,
        AccountingComponent,
        SchoolComponent,
        DatabaseComponent,
        InboxComponent,
        InboxFormComponent,
        IndicatorComponent,
        FabComponent,
        MessagesComponent,
        RegisterComponent,
        RegisterFormComponent,
        ChargeComponent,
        ChargeFormComponent,
        CommentInternComponent,
        CommentInternFormComponent,
        CarComponent,
        CarFormComponent,
        TransportationComponent,
        TransportComponent,
        TransportFormComponent,
        CommuteComponent,
        CommuteFormComponent,
        CommutingComponent,
        PromptDialogComponent,
        CommentInstructorComponent,
        CommentInstructorFormComponent,
        AssessmentComponent,
        QuestionnaireComponent,
        QuestionnaireFormComponent,
        TestComponent,
        ReportComponent,
        LogsComponent
    ],
    entryComponents: [ConfirmDialogComponent, InfoDialogComponent, PromptDialogComponent],
    providers: [
        { provide: MatPaginatorIntl, useClass: MatPaginatorClass },
        {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'},
        MessageService
    ],
    bootstrap: [
        AppComponent
    ],
})

export class AppModule {
}

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
