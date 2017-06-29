import { Component, NgZone, Inject } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { Observable, Subscription } from 'rxjs';

import template from './disable-confirm.component.html';
import style from './disable-confirm.component.scss';

@Component({
    selector: 'disable-confirm',
    template,
    styles: [style]
})

export class DisableConfirmComponent {

    /**
     * CallCloseConfirmComponent constructor
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor(public _dialogRef: MdDialogRef<any>, private _zone: NgZone, @Inject(MD_DIALOG_DATA) public data: any) {
        console.log(data);
    }

    /**
     * Function that returns true to Parent component
     */
    closeConfirm() {
        this._dialogRef.close({ success: true });
    }

    /**
     * This function allow closed the modal dialog
     */
    cancel() {
        this._dialogRef.close({ success: false });
    }
}