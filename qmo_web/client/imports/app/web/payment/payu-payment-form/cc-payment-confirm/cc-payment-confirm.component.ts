import { Component, NgZone, Inject, OnInit, OnDestroy } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { Observable, Subscription } from 'rxjs';

import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';

import template from './cc-payment-confirm.component.html';
import style from './cc-payment-confirm.component.scss';

@Component({
    selector: 'disable-confirm',
    template,
    styles: [style]
})

export class CcPaymentConfirmComponent implements OnInit, OnDestroy {

    /**
     * CallCloseConfirmComponent constructor
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor(public _dialogRef: MdDialogRef<any>, private _zone: NgZone, @Inject(MD_DIALOG_DATA) public data: any) {

    }

    ngOnInit() {

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

    ngOnDestroy() {

    }
}