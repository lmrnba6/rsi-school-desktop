import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {AuthenticationService} from '../_services/authentication.service';
import './login.component.scss';
import {Instructor} from "../model/instructor";
import {School} from "../model/school";
import {Intern} from "../model/intern";
import {Settings} from "../model/settings";
const {sql} = require('../../assets/data/sql-update.js');
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
    public username: FormControl;
    public password: FormControl;
    loginForm: FormGroup;
    submitted = false;
    error = '';
    logo: string;
    image: string;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService
    ) {
    }

    updateDatabase() {
        this.asyncForEach(sql , async (query: any) =>{
            try {
                await Settings.client.query(query);
            }catch (e) {
                console.error(e);
            }
        })
    }

    async asyncForEach(array: any, callback: any) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    ngOnInit() {
        this.updateDatabase();
        this.image = `../../dist/assets/images/${Math.floor(Math.random() * 5) + 1 }.jpg`;
        (document.getElementById('clouds') as HTMLElement).style.backgroundImage = `url(${this.image})`;
        this.initForm();
        if (!this.authenticationService.isTokenExpired()) {
            this.router.navigate(['/home']);
        }
        this.getLogo();
    }

    getLogo() {
        this.block = true;
        setTimeout(() =>
        School.getAll().then(school => {
            this.block = false;
            if(school.length) {
                this.logo = 'data:image/png;base64,' + school[0].photo;
            }
        }), 500);
    }

    public initForm(): void {
        this.username = new FormControl(null, [Validators.required]);
        this.password = new FormControl(null, [Validators.required]);
        this.loginForm = this.formBuilder.group({
            username: this.username,
            password: this.password
        });
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.loginForm.controls;
    }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.block = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .then(
                user => {
                    this.block = false;
                    this.authenticationService.setToken(user);
                    if (user.role === 'teacher') {
                        Instructor.getByPhone(Number(user.username)).then(
                            instructor => {
                                instructor ? this.router.navigate(['instructor/' + instructor.id]) :
                                    this.error = 'error';
                            });
                    } else if(user.role === 'student') {
                        Intern.get(Number(user.username)).then(
                            intern => {
                                intern ? this.router.navigate(['interns/' + intern.id]) :
                                    this.error = 'error';
                            });

                    } else {
                        this.router.navigate(['']);
                    }
                },
                error => {
                    this.error = error;
                    this.block = false;
                });
    }
}
