import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import './confirm-dialog.component.scss';
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {

  public title: string;
  public message: string;
  public icon: string;
  public isConfirm: boolean;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}
}
