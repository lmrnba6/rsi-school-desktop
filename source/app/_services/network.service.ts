import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({providedIn: 'root'})
export class NetworkService {

    connected: boolean = true;
    connectedSubject: BehaviorSubject<boolean> = new BehaviorSubject(true);
    connectedObservable = this.connectedSubject.asObservable();

    constructor() {
        const _this = this;
        window.addEventListener('online',  this.updateOnlineStatus.bind(_this));
        window.addEventListener('offline', this.updateOnlineStatus.bind(_this));
    }

    updateOnlineStatus() {
        this.connected = navigator.onLine;
        this.connectedSubject.next(this.connected);
    }
}
