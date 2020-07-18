import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {Observable} from "rxjs";
import {Prompt} from "../model/prompt";
import {PromptDialogComponent} from "../prompt-dialog/prompt-dialog.component";

@Injectable({providedIn: 'root'})
export class PromptService {

    constructor(private dialog: MatDialog) { }

    public confirm(data: Prompt): Observable<any> {

        let dialogRef: MatDialogRef<PromptDialogComponent>;
        dialogRef = this.dialog.open(PromptDialogComponent);
        dialogRef.componentInstance.data = data;
        return dialogRef.afterClosed();
    }
}
