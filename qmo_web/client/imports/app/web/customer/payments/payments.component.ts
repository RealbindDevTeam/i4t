import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
//import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { TranslateService } from 'ng2-translate';
//import { PaymentDetailsComponent } from "./payment-details/payment-details.component";

import template from './payments.component.html';
import style from './payments.component.scss';

@Component({
    selector: 'payments',
    template,
    styles: [ style ]
})
export class PaymentsComponent implements OnInit, OnDestroy {

    //private _mdDialogRef : MdDialogRef<any>;
    
    /**
     * PaymentsComponent Constructor
     * @param { TranslateService } _translate 
     * @param { NgZone } _ngZone 
     */
    constructor( private _translate: TranslateService, 
                 private _ngZone: NgZone ) {
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){

    }

    /**
     * This function show the Payment details
     
    showPaymentDetails() {
        this._mdDialogRef = this._mdDialog.open(PaymentDetailsComponent, {
            disableClose : false,
            height : '80%',
            width  : '450px',
        });
        this._mdDialogRef.componentInstance._totalValue = 22200;
        this._mdDialogRef.componentInstance._tipPorcentage = 0;
        this._mdDialogRef.afterClosed();
    }*/

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){

    }
}