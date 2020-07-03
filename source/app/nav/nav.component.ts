import {Component, EventEmitter, Output} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../_services/authentication.service';
import {TranslateService} from '@ngx-translate/core';
import './nav.component.scss';
import {User} from "../model/user";
import {School} from "../model/school";
import {Inbox} from "../model/inbox";
import {MessagesService} from "../_services/messages.service";
import {NetworkService} from "../_services/network.service";


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html'
})
export class NavComponent{
    @Output() public menu: EventEmitter<boolean> = new EventEmitter<boolean>();
    lang = 'fr';
  languageText = "Fr";
  center: string;
  pathForward:Array<string> = [];
  date = new Date().toLocaleDateString("en-US");
  user: User;
  messages: number = 0;
  connected = true;
  isTeacher = false;
  isIntern = false;
    isParent = false;
    isUser = false;

  constructor(private authService: AuthenticationService,
              private router: Router,
              private translate: TranslateService,
              private messagesService: MessagesService,
              private network: NetworkService
              ) {
    this.lang = this.translate.currentLang;
    this.languageText = this.lang === 'fr' ? 'English' : 'Français';
    this.user = authService.getCurrentUser();
    this.isIntern = this.user.role === 'student';
      this.isUser = this.user.role === 'user';
      this.isParent = this.user.role === 'parent';
    this.isTeacher = this.user.role === 'teacher'
    this.getCenter();
    this.getMessages();
    this.messagesService.messagesSubject.subscribe(() => this.getMessages());
    this.network.connectedObservable.subscribe(connected => {
        !connected && alert(this.translate.instant('messages.network.offline'))
        this.connected = connected;
    });

  }

  getMessages() {
      Inbox.getCountUnread( this.user.id).then(inbox => this.messages = (inbox[0] as any).count);
  }

    getCenter() {
    School.getAll().then(school => {
        if(school.length) {
            this.center = school[0].name;
        }
    })
  }



  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

    inbox() {
        this.router.navigate(['/messages/inbox/inbox']);
    }

    goHome() {
        this.router.navigate(['/']);
    }

    isRoot() {
        const paths = window.location.pathname.split('/');
        const test = paths.pop();
        return paths.pop() === 'index.html' && test === '';
    }

  goBack() {
      let url = '';
      const paths = window.location.pathname.split('/');
      let forward = paths.pop();
      forward = typeof(Number(forward)) === 'number' ? paths.pop() : forward;
      forward && this.pathForward.push(forward);
      paths.reverse();
      while(paths.pop() !== 'index.html'){}
      paths.forEach(path => url = path + '/' + url);
      this.router.navigate([url]);
  }

  goForward() {
      let url = '';
      const paths = window.location.pathname.split('/');
      paths.reverse();
      while(paths.pop() !== 'index.html'){}
      paths.forEach(path => url = path + '/' + url);
      this.router.navigate([url + this.pathForward.pop()]);
  }


    /**
     * hideOrShowMenu
     */
    public toggleMenu(): void {
        this.menu.emit();
    }

  languageChange() {
    this.lang = this.lang === 'en' ? 'fr' : 'en';
    this.languageText = this.lang === 'fr' ? 'English' : 'Français';
    this.translate.use(this.lang);
  }

}
