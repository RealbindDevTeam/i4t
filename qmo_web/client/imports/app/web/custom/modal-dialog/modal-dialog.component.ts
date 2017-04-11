import { Component, ViewContainerRef } from '@angular/core';
import { MdDialogRef } from '@angular/material';

import template from './modal-dialog.component.html';
import style from './modal-dialog.component.scss';

@Component({
  selector: 'modal-dialog',
  template,
  styles: [ style ]
})
export class ModalDialogComponent {
  param1: any;
  param2: any;
  constructor(public dialogRef: MdDialogRef<any>) { }
}