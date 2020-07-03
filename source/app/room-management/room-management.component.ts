import { Component, OnInit } from '@angular/core';
import {MessagesService} from "../_services/messages.service";
import {ActivatedRoute, Router} from '@angular/router';
import './room-management.component.scss';
import {Room} from "../model/room";
@Component({
  selector: 'app-room-management',
  templateUrl: './room-management.component.html',
})
export class RoomManagementComponent implements OnInit {

    public room: Room;
    public tabSelected: number = 0;
    public block: boolean;
    public isOnEdit: boolean;
    public color: string = 'warn';
    public mode: string = 'indeterminate';
    public value: number = 100;

    constructor(public messagesService: MessagesService,
                private route: ActivatedRoute,
                private router: Router
    ) {
    }

    public ngOnInit(): void {
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
                this.room = new Room();
            }
        });
    }

    public onTabChange(): void {}

    /**
     * get data
     *
     * @param  {string} name room name
     * @returns void
     */
    public getData(id: number): void {
        Room
            .get(id)
            .then((val: Room) => {
                this.room = val;
            });
    }

    goBack() {
        this.router.navigate(['room']);
    }

}
