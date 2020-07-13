import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './session-management.component.scss';
import {Session} from "../model/session";
import {AuthenticationService} from "../_services/authentication.service";
@Component({
  selector: 'app-session-management',
  templateUrl: './session-management.component.html',
})
export class SessionManagementComponent implements OnInit, OnChanges {

    public session: Session;
    @Input() session_id: number;
    public tabSelected: number = 0;
    public block: boolean;
    public isOnEdit: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;
    public isAdmin: boolean;
    public weekdayImage = `${this.getPath()}dist/assets/images/weekdayImage.png`;
    public infoImage = `${this.getPath()}dist/assets/images/infoImage.png`;
    public internImage = `${this.getPath()}dist/assets/images/internImage.png`;
    public examImage = `${this.getPath()}dist/assets/images/examImage.png`;
    public attendanceImage = `${this.getPath()}dist/assets/images/attendanceImage.png`;
    public backImage = `${this.getPath()}dist/assets/images/backImage.png`;

    constructor(public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router,
                private authService: AuthenticationService
                ) {
    }

    getPath(){
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if(changes.hasOwnProperty('session_id')) {
            this.ngOnInit();
        }
    }

    public ngOnInit(): void {
        this.isAdmin = this.authService.getCurrentUser().role === 'admin';
        this.getParams();
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }    }

    /**
     * getParams
     */
    public getParams(): void {
        this.route.params.subscribe(res => {
            if (this.session_id) {
                this.getData(this.session_id);
                this.isOnEdit = true;
            }else if (res.id) {
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
