import { Component, NgZone, OnInit, OnDestroy} from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { Observable, Subscription } from 'rxjs';
import { Parameter } from '../../../../../../../../both/models/general/parameter.model';
import { Parameters } from '../../../../../../../../both/collections/general/parameter.collection';

import template from './create-confirm.component.html';
import style from './create-confirm.component.scss';

@Component({
    selector: 'create-confirm',
    template,
    styles: [style]
})
export class CreateConfirmComponent implements OnInit, OnDestroy{

     private _parameterSub: Subscription;

    /**
     * CallCloseConfirmComponent constructor
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor(public _dialogRef: MdDialogRef<any>, private _zone: NgZone) {
        
    }

    ngOnInit() {
        this._parameterSub = MeteorObservable.subscribe('getParameters').subscribe();
    }

    getDiscountPercent(){
        let discount = Parameters.findOne({name: 'first_pay_discount'});
        if(discount){
            return discount.value;
        }
    }

    /**
     * Function to gets de first day of charge
     */
    getFirstDay(): string{
        let firstDay = Parameters.findOne({ name: 'start_payment_day' });
        if(firstDay){
            return firstDay.value;
        }
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

    ngOnDestroy(){
        this._parameterSub.unsubscribe();
    }
}