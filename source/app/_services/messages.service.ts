import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {MessageService} from "primeng/api";


@Injectable({providedIn: 'root'})
export class MessagesService {

    public messagesSubject = new BehaviorSubject(null);
    public msgs: any = [];
    constructor(public snackBar: MessageService) {
    }

    /**
     * notifyMessage
     */
    public notifyMessage(message: string, action: string, result: string): void {
        this.snackBar.add({severity:result, summary:action, detail: message});
    }

    public messageBar(message: {severity: string, summary: string, detail: string}) {
        this.msgs = [];
        this.msgs.push(message);
    }

}
