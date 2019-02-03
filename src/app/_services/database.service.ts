import { Injectable } from '@angular/core';
import  {Client} from 'pg';
import {BehaviorSubject} from "rxjs";

@Injectable({providedIn: 'root'})
export class DatabaseService {

    connectionString = 'postgres://zkcifzjnxennwp:27fd3afaee1400adf047901988dd1acfab9fc0cbe13bea789b2421b04415ead3@ec2-54-204-41-148.compute-1.amazonaws.com:5432/dd5c0617s1h5d2';
    client: Client;
    isLocal: boolean = true;
    databaseLocalSubject = new BehaviorSubject(true);


    constructor() {
        this.databaseLocalLinstener();
    }

    private databaseLocalLinstener() {
        this.databaseLocalSubject.subscribe(val => {
            this.isLocal = val;
            if (!val) {
                this.client = new Client({
                    connectionString: this.connectionString,
                    ssl: true
                });
                this.client.connect();
            } else {
                this.client && this.client.end();
                (this.client as any) = null;
            }
        });
    }

}
