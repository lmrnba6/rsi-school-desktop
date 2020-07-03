import { Injectable } from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialogRef, MatDialog } from '@angular/material';
import {Observable} from "rxjs";

@Injectable({providedIn: 'root'})
export class DialogsService {

    constructor(private dialog: MatDialog) { }

    public confirm(title: string, message: string, isConfirm: boolean, icon: string): Observable<boolean> {

        let dialogRef: MatDialogRef<ConfirmDialogComponent>;
        dialogRef = this.dialog.open(ConfirmDialogComponent);
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;
        dialogRef.componentInstance.isConfirm = isConfirm;
        dialogRef.componentInstance.icon = icon;

        return dialogRef.afterClosed();
    }
}
