import {Component, OnInit, ViewChild} from '@angular/core';
import './intern-enroll-form.component.scss';
import {MatStepper} from "@angular/material";
import {EnrollmentFormComponent} from "../enrollment-form/enrollment-form.component";
import {AuthenticationService} from "../_services/authentication.service";
import {Router} from "@angular/router";
import {School} from "../model/school";

@Component({
    selector: 'app-intern-enroll-form',
    templateUrl: './intern-enroll-form.component.html'
})
export class InternEnrollFormComponent implements OnInit {

    @ViewChild(EnrollmentFormComponent) enrollmentComponent: EnrollmentFormComponent;
    logo = ''
    public internSaved: boolean;

    constructor(private authService: AuthenticationService,
                private router: Router) {
    }

    ngOnInit() {
        this.getLogo()
    }

    getLogo() {
        School.getAll().then(school => {
            if(school.length) {
                this.logo = 'data:image/png;base64,' + school[0].photo;
            }
        })
    }

    goBack(stepper: MatStepper) {
        stepper.previous();
    }

    goForward(stepper: MatStepper) {
        // stepper.selectedIndex === 1 && this.enrollmentComponent.getInterns();
        stepper.next();
    }

    reset(stepper: MatStepper) {
        this.authService.logout();
        this.router.navigate(['/login']);
        stepper.reset();
    }


}
