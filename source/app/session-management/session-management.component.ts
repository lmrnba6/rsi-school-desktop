import { Component, OnInit } from '@angular/core';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './session-management.component.scss';
import {Session} from "../model/session";
import {AuthenticationService} from "../_services/authentication.service";
@Component({
  selector: 'app-session-management',
  templateUrl: './session-management.component.html',
})
export class SessionManagementComponent implements OnInit {

    public session: Session;
    public tabSelected: number = 0;
    public block: boolean;
    public isOnEdit: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public isAdmin: boolean;

    constructor(public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private authService: AuthenticationService
                ) {
    }

    public ngOnInit(): void {
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
        this.getParams();
    }

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (res.id) {
                this.getData(res.id);
                this.isOnEdit = true;
            } else {
                this.isOnEdit = false;
                this.session = new Session();
            }
        });
    }

    goBack() {
        this.router.navigate(['session']);
    }

    public onTabChange(): void {}

    /**
     * get data
     *
     * @param  {string} name session name
     * @returns void
     */
    public getData(id: number): void {
        Session
            .get(id)
            .then((val: Session) => {
                this.session = val;
            });
    }

}
