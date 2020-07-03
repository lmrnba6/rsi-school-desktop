import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {MessagesService} from "../_services/messages.service";
import { DialogsService } from '../_services/dialogs.service';
import { FormControl } from '@angular/forms';
import './role.component.scss';
import {User} from "../model/user";
@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
})
export class RoleComponent implements OnInit {

  public user: User;
  public users: Array<User>;
  public usersFiltered: Array<User>;
  public color: string = 'warn';
  public mode: string = 'indeterminate';
  public value: number = 100;
  public active: Array<boolean>;
  public myControl: FormControl = new FormControl();
  public roles = [ 'user',  'admin']

  constructor(private location: Location,
              public messagesService: MessagesService,
              private dialogsService: DialogsService) { }

  ngOnInit(): void {
    this.active = new Array<boolean>();
  }

  public saveOrUpdateRole(): void {
    this.user.update().then(
        () => {
            this.messagesService.notifyMessage('Success: ', '', 'success');
            this.location.back();
            },
        err => this.messagesService.notifyMessage('Erreur: ' + err._body, '', 'error')
    );
  }

  /**
   * onCancel
   */
  public onCancel(): void {
    this.location.back();
  }

  /**
   * onSave
   */
  public onSave(): void {
    this.dialogsService
    .confirm('Attention', 'Voulez-vous vraiment changer les rôle de l\'utilisateur ' + this.user.username + ' ?', true, 'people')
    .subscribe(confirm => {
      if (confirm) {
        this.saveOrUpdateRole();
      }
    });
  }


  /**
   * filter
   */
  public filter(name: string): Array<User> {
      return this.users.filter(user =>
          user.name.includes(name) ||
          user.username.includes(name));
  }

  /**
   * userOnChange
   */
  public userOnChange(user: User): void {
    this.user = user;
    this.active = new Array<boolean>();
    this.active[user.id] = true;
  }

  public displayFn(user?: User): string | undefined {
    return user ? `${user.name}` : undefined;
  }

}
