import { Component, NgZone, Inject, OnInit, OnDestroy } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate';
import { UserLanguageService } from '../../../../shared/services/user-language.service';

import template from './cc-payment-confirm.component.html';
import style from './cc-payment-confirm.component.scss';

@Component({
    selector: 'cc-payment-confirm',
    template,
    styles: [style],
    providers: [ UserLanguageService ]
})
export class CcPaymentConfirmComponent implements OnInit, OnDestroy {

    private _cardNumber: string;

    /**
     * CcPaymentConfirmComponent Constructor
     * @param {MdDialogRef<any>} _dialogRef 
     * @param {NgZone} _zone 
     * @param {any} data 
     * @param {TranslateService} translate 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( public _dialogRef: MdDialogRef<any>, 
                 private _zone: NgZone, 
                 @Inject(MD_DIALOG_DATA) public data: any, 
                 private translate: TranslateService,
                 private _userLanguageService: UserLanguageService ) {
        translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        translate.setDefaultLang( 'en' );

        this._cardNumber = data.cardnumber.substring(data.cardnumber.length - 4);
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