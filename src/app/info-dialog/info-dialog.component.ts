import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import './info-dialog.component.scss';
@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
})
export class InfoDialogComponent {

  public title: string;
  public message: string;

  constructor(public dialogRef: MatDialogRef<InfoDialogComponent>) {

  }
}
