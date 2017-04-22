import { Component, NgZone } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";

import template from './call-close-confirm.component.html';
import style from './call-close-confirm.component.scss';

@Component({
    selector: 'call-close-confirm',
    template,
    styles: [ style ]
})
export class CallCloseConfirmComponent{

    /**
     * CallCloseConfirmComponent constructor
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor( public _dialogRef: MdDialogRef<any>,  private _zone: NgZone ){

    }

    /**
     * Function that returns true to Parent component
     */
    closeWaiterCall(){
        this._dialogRef.close({success : true});
    }

    /**
     * This function allow closed the modal dialog
     */
    cancel() {
        this._dialogRef.close({success : false});
    }
}