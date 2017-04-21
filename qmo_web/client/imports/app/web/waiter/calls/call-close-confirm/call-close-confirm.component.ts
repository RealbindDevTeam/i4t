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

    public _callParam : any;

    /**
     * CallCloseConfirmComponent constructor
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor( public _dialogRef: MdDialogRef<any>,  private _zone: NgZone ){

    }

    /**
     * Function that allows remove a job of the Waiter Calls queue
     */
    closeWaiterCall(){
        console.log('--> ' + this._callParam)
        if (this._callParam){
            setTimeout(() => {
                this._zone.run(() => {
                    MeteorObservable.call('closeCall', this._callParam._id, Meteor.userId()).subscribe(() => {
                    });
                });
            }, 1500);
            this._dialogRef.close({success : true});
        }
    }

    /**
     * This function allow closed the modal dialog
     */
    cancel() {
        this._dialogRef.close({success : false});
    }
}