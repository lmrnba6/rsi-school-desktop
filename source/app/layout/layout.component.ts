import {Component, OnInit} from '@angular/core';
import './layout.component.scss';
import {AuthenticationService} from "../_services/authentication.service";
import {FloatingActionButton} from "ng2-floating-action-menu";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {Intern} from "../model/intern";
import {MessagesService} from "../_services/messages.service";
import {Visitor} from "../model/visitor";
import {DialogsService} from "../_services/dialogs.service";

declare var $: any;

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {

    public options: any;
    public isSideNavOpened: boolean = true;
    public user: any;
    public isInstructor: boolean;
    public isIntern: boolean;
    public isParent: boolean;
    public iconsShown: boolean = true;

    public buttons: Array<FloatingActionButton> = [];

    constructor(private auth: AuthenticationService,
                private router: Router,
                private translate: TranslateService,
                private messagesService: MessagesService,
                private dialogsService: DialogsService,
    ) {
        let pressed = false;
        let chars: any = [];
        const This: any = this;
        $(window).keypress(function (e: any) {
            if (e.which >= 48 && e.which <= 57) {
                chars.push(String.fromCharCode(e.which));
            }
            if (pressed == false) {
                setTimeout(function () {
                    if (chars.length === 10) {
                        const barcode = chars.join("");
                        console.log("Barcode Scanned: " + barcode);
                        This.goToIntern(barcode);
                        // assign value to some input (or do whatever you want)
                        $("#barcode").val(barcode);
                    }
                    chars = [];
                    pressed = false;
                }, 500);
            }
            pressed = true;
        });
        $("#barcode").keypress(function (e: any) {
            if (e.which === 13) {
                console.log("Prevent form submit.");
                e.preventDefault();
            }
        });
    }

    goToIntern(code: any) {
        Intern.get(Number(code)).then(i => {
            this.router.navigate(['intern-management/' + i.id]);
        }).catch(
            () => this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error')
        );
    }

    notifyVisitorCount() {
        Visitor.getCount('').then((c: any) => {
            const exist = c && c[0] && Number(c[0].count);
            if(exist){
                this.dialogsService
                    .confirm('messages.warning_title', 'messages.visitor_remaining_message', true, 'warning-sign')
                    .subscribe(confirm => {
                        if (confirm) {
                            this.router.navigate(['visitor'])
                        }
                    });
            }
        })
    }


    ngOnInit(): void {
        this.notifyVisitorCount();
        this.user = this.auth.getCurrentUser();
        this.isInstructor = this.user.role === 'teacher';
        this.isIntern = this.user.role === 'student';
        this.isParent = this.user.role === 'parent';
        this.options = {
            fixed: false,
            top: 0,
            bottom: 0,
        };
        const _this = this;
        this.buttons = [
            {
                iconClass: 'glyphicon glyphicon-user',
                label: this.translate.instant('intern.title'),
                onClick: function () {
                    _this.router.navigate(['intern/form']);
                }
            },
            {
                iconClass: 'glyphicon glyphicon-shopping-cart',
                label: this.translate.instant('register.title'),
                onClick: function () {
                    _this.router.navigate(['register/form']);
                }
            },
            {
                iconClass: 'glyphicon glyphicon-usd',
                label: this.translate.instant('payment.title'),
                onClick: function () {
                    _this.router.navigate(['payment/form']);
                }
            },
            {
                iconClass: 'glyphicon glyphicon-envelope',
                label: this.translate.instant('inbox.title'),
                onClick: function () {
                    _this.router.navigate(['inbox/form']);
                }
            }
        ];
    }

    /**
     * toggleMenu
     */
    public toggleMenu(): void {
        this.isSideNavOpened = !this.isSideNavOpened;
    }

    public menuMouseEnter(e: any) {
        console.log(e);
        this.iconsShown = true;
        (document.getElementsByClassName('example-sidenav')[0] as HTMLElement).style.width = '20%';
    }

    public menuMouseLeave(e: any) {
        console.log(e);
        this.iconsShown = false;
        (document.getElementsByClassName('example-sidenav')[0] as HTMLElement).style.width = '6%';
    }


}
