import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import './prompt-dialog.component.scss';
import {Prompt} from "../model/prompt";
@Component({
  selector: 'app-propmpt-dialog',
  templateUrl: './prompt-dialog.component.html'
})
export class PromptDialogComponent {

  public data : Prompt

  constructor(public dialogRef: MatDialogRef<PromptDialogComponent>) {}
}
