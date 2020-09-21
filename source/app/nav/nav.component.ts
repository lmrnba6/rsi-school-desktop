import {Component, EventEmitter, NgZone, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../_services/authentication.service';
import {TranslateService} from '@ngx-translate/core';
import './nav.component.scss';
import {User} from "../model/user";
import {School} from "../model/school";
import {Inbox} from "../model/inbox";
import {MessagesService} from "../_services/messages.service";
import {NetworkService} from "../_services/network.service";
import {Settings} from "../model/settings";
import {InboxRemote} from "../model/inboxRemote";
import {Client} from "pg";
import {Questionnaire} from "../model/questionnaire";
import {Training} from "../model/training";
import {MarkRemote} from "../model/markRemote";
import {Instructor} from "../model/instructor";
import {Session} from "../model/session";
import {Room} from "../model/room";
import {Weekday} from "../model/weekday";
import {Intern} from "../model/intern";
import {Visitor} from "../model/visitor";
import {CommentIntern} from "../model/commentIntern";
import {CommentInstructor} from "../model/commentInstructor";
import {Payment_instructor} from "../model/paymentInstructor";
import {Exam} from "../model/exam";
import {Attendance} from "../model/attendance";
import {Enrollment} from "../model/enrollment";
import {Charge} from "../model/charge";
import {Payment} from "../model/payment";
import {Register} from "../model/register";
import {Car} from "../model/car";
import {Transport} from "../model/transport";
import {Commute} from "../model/commute";
import {Question} from "../model/question";
import {Answer} from "../model/answer";
import {Mark} from "../model/mark";
import {DialogsService} from "../_services/dialogs.service";


@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html'
})
export class NavComponent implements OnInit {
    @Output() public menu: EventEmitter<boolean> = new EventEmitter<boolean>();
    lang = 'fr';
    languageText = "Fr";
    center: string;
    pathForward: Array<string> = [];
    date = new Date().toLocaleDateString("en-US");
    user: User;
    messages: number = 0;
    connected = true;
    isTeacher = false;
    isIntern = false;
    isParent = false;
    isUser = false;
    isAdmin = false;
    isCloud = false;
    public block: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 0;
    public inboxImage = `${this.getPath()}dist/assets/images/inboxImage.png`;
    public userImage = `${this.getPath()}dist/assets/images/userImage.png`;
    public powerImage = `${this.getPath()}dist/assets/images/powerImage.png`;
    public homeImage = `${this.getPath()}dist/assets/images/homeImage.png`;
    public cloudImage = `${this.getPath()}dist/assets/images/cloudImage.png`;
    public cloudSync = `${this.getPath()}dist/assets/images/cloudSync.gif`;

    constructor(private authService: AuthenticationService,
                private router: Router,
                private translate: TranslateService,
                private messagesService: MessagesService,
                private network: NetworkService,
                private dialogsService: DialogsService,
                private _ngZone: NgZone
    ) {
        this.lang = this.translate.currentLang;
        this.languageText = this.lang === 'fr' ? 'English' : 'Français';
        this.user = authService.getCurrentUser();
        this.isIntern = this.user.role === 'student';
        this.isUser = this.user.role === 'user';
        this.isParent = this.user.role === 'parent';
        this.isAdmin = this.user.role === 'admin';
        this.isTeacher = this.user.role === 'teacher'
        this.getCenter();
        this.getMessages();
        this.messagesService.messagesSubject.subscribe(() => this.getMessages());
        this.network.connectedObservable.subscribe(connected => {
            this._ngZone.run(() => {
                !connected && alert(this.translate.instant('messages.network.offline'))
                this.connected = connected;
            });
        });
    }

    ngOnInit() {
        School.getAll().then(s => {
            const school: School = s && s[0];
            Settings.isCloud = (school && school.password && school.host && school.user && school.db) ? true : false;
            this.isCloud = Settings.isCloud;
            if (Settings.isCloud) {
                Settings.cloudClient = new Client({
                    user: school.user,
                    host: school.host,
                    database: school.db,
                    password: school.password,
                    port: 5432,
                    ssl: true,
                });
            }
        })
    }

    getPath() {
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }

    getMessages() {
        Inbox.getCountUnread(this.user.id).then(inbox => this.messages = (inbox[0] as any).count);
    }

    getCenter() {
        School.getAll().then(school => {
            if (school.length) {
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

    connectDbServer() {
        return new Promise((resolve, reject) => {
            if (!Settings.cloudClient['_connected'] && !Settings.cloudClient['_connecting']) {
                Settings.cloudClient.connect().then(() => {
                    resolve()
                }, (e) => {
                    reject(e);
                });
            } else {
                resolve()
            }
        });
    }

    syncDbServer() {
        this.dialogsService
            .confirm('messages.warning_title', 'messages.sync_warning_message', true, 'warning-sign')
            .subscribe(confirm => {
                if (confirm) {
                    this.block = true;
                    this.connectDbServer().then(async () => {
                            try {
                                if (Settings.cloudClient['_connected']) {
                                    const createPromises: Array<Promise<any>> = [];
                                    createPromises.push(Settings.createAll());
                                    createPromises.push(Settings.createAllRemote());
                                    createPromises.push(Settings.updateAll());
                                    await Promise.all(createPromises);
                                    this._ngZone.run(() => {
                                        this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    });
                                    const inboxesRemote = await InboxRemote.getAll();
                                    const inboxPromises: Array<Promise<any>> = [];
                                    inboxesRemote.forEach(m => {
                                        const message = new Inbox();
                                        Object.keys(m).forEach(s => message[s] = m[s]);
                                        inboxPromises.push(message.insert());
                                    });
                                    await Promise.all(inboxPromises);
                                    this._ngZone.run(() => {
                                        this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    });
                                    const marksRemote = await MarkRemote.getAll();
                                    const markPromises: Array<Promise<any>> = [];
                                    marksRemote.forEach(m => {
                                        const mark = new Mark();
                                        Object.keys(m).forEach(s => mark[s] = m[s]);
                                        markPromises.push(mark.insert());
                                    });
                                    await Promise.all(inboxPromises);
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    const promises: Array<Promise<any>> = [];
                                    promises.push(Settings.dropAll());
                                    promises.push(Settings.createAll());
                                    promises.push(Settings.createAllRemote());
                                    promises.push(Settings.updateAll());
                                    await Promise.all(promises);
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let users = await User.getAll();
                                    await Promise.all(users.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let trainings = await Training.getAll();
                                    await Promise.all(trainings.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let questionnaires = await Questionnaire.getAll();
                                    await Promise.all(questionnaires.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let instructors = await Instructor.getAll();
                                    await Promise.all(instructors.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let sessions = await Session.getAllNoException();
                                    await Promise.all(sessions.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let inboxes = await Inbox.getAll();
                                    await Promise.all(inboxes.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let rooms = await Room.getAll();
                                    await Promise.all(rooms.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let weekdays = await Weekday.getAll();
                                    await Promise.all(weekdays.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let interns = await Intern.getAll();
                                    await Promise.all(interns.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let visitors = await Visitor.getAll();
                                    await Promise.all(visitors.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let commentInterns = await CommentIntern.getAll();
                                    await Promise.all(commentInterns.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let commentInstructors = await CommentInstructor.getAll();
                                    await Promise.all(commentInstructors.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let schools = await School.getAll();
                                    await Promise.all(schools.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let paymentInstructors = await Payment_instructor.getAll();
                                    await Promise.all(paymentInstructors.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let exams = await Exam.getAll();
                                    await Promise.all(exams.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let attendances = await Attendance.getAll();
                                    await Promise.all(attendances.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let enrollments = await Enrollment.getAll();
                                    await Promise.all(enrollments.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let charges = await Charge.getAll();
                                    await Promise.all(charges.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let payments = await Payment.getAll();
                                    await Promise.all(payments.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let registers = await Register.getAll();
                                    await Promise.all(registers.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let cars = await Car.getAll();
                                    await Promise.all(cars.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let transports = await Transport.getAllNoException();
                                    await Promise.all(transports.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let commutes = await Commute.getAll();
                                    await Promise.all(commutes.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let questions = await Question.getAll();
                                    await Promise.all(questions.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let answers = await Answer.getAll();
                                    await Promise.all(answers.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    let marks = await Mark.getAll();
                                    await Promise.all(marks.map(u => u.insertWithId(true)));
                                    this._ngZone.run(() => {
                                        this.value = this.value + 3.33;
                                    });
                                    this.messagesService.notifyMessage(this.translate.instant('messages.operation_success_message'), '', 'success');
                                    this.block = false;
                                    this.value = 0;
                                }
                                this.block = false;
                                this.value = 0;
                            } catch (e) {
                                this.block = false;
                                this.value = 0;
                                this.messagesService.notifyMessage(this.translate.instant('messages.something_went_wrong_message'), '', 'error');
                            }
                        }, () => {
                        this.value = 0;
                        this.block = false;
                        this.messagesService.notifyMessage(this.translate.instant('Can\'t connect'), '', 'error');
                        }
                    );
                }
            });
    }

    goBack() {
        let url = '';
        const paths = window.location.pathname.split('/');
        let forward = paths.pop();
        forward = typeof (Number(forward)) === 'number' ? paths.pop() : forward;
        forward && this.pathForward.push(forward);
        paths.reverse();
        while (paths.pop() !== 'index.html') {
        }
        paths.forEach(path => url = path + '/' + url);
        this.router.navigate([url]);
    }

    goForward() {
        let url = '';
        const paths = window.location.pathname.split('/');
        paths.reverse();
        while (paths.pop() !== 'index.html') {
        }
        paths.forEach(path => url = path + '/' + url);
        this.router.navigate([url + this.pathForward.pop()]);
    }


    /**
     * hideOrShowMenu
     */
    public

    toggleMenu()
        :
        void {
        this.menu.emit();
    }

    languageChange() {
        this.lang = this.lang === 'en' ? 'fr' : 'en';
        this.languageText = this.lang === 'fr' ? 'English' : 'Français';
        this.translate.use(this.lang);
    }

}
