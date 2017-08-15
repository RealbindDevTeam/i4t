import { Component, NgZone, Inject, OnInit, OnDestroy } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { UserLanguageService } from '../../../../shared/services/user-language.service';

import template from './verify-result.component.html';
import style from './verify-result.component.scss';

@Component({
    selector: 'verify-result-confirm',
    template,
    styles: [style],
    providers: [ UserLanguageService ]
})
export class VerifyResultComponent implements OnInit, OnDestroy {

    /**
     * VerifyResultComponent Constructor
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

    ngOnInit() {

    }

    ngOnDestroy() {

    }

}