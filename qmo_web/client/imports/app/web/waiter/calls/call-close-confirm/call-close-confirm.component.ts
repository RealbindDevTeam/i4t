import { Component, NgZone } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { TranslateService } from 'ng2-translate';
import { UserLanguageService } from '../../../../shared/services/user-language.service';

import template from './call-close-confirm.component.html';
import style from './call-close-confirm.component.scss';

@Component({
    selector: 'call-close-confirm',
    template,
    styles: [ style ],
    providers: [ UserLanguageService ]
})
export class CallCloseConfirmComponent{

    /**
     * CallCloseConfirmComponent constructor
     * @param {MdDialogRef<any>} _dialogRef 
     * @param {NgZone} _zone 
     * @param {TranslateService} _translate 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( public _dialogRef: MdDialogRef<any>,  
                 private _zone: NgZone,
                 public _translate: TranslateService,
                 private _userLanguageService: UserLanguageService ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
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