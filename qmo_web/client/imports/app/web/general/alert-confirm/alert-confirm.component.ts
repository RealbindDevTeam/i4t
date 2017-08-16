import { Component, NgZone, Inject, OnInit, OnDestroy } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { UserLanguageService } from '../../../shared/services/user-language.service';

import template from './alert-confirm.component.html';
import style from './alert-confirm.component.scss';

@Component({
    selector: 'alert-confirm',
    template,
    styles: [style],
    providers: [UserLanguageService]
})

export class AlertConfirmComponent implements OnInit, OnDestroy {

    private showCancelButton: boolean;

    constructor(public _dialogRef: MdDialogRef<any>, private _zone: NgZone, @Inject(MD_DIALOG_DATA) public data: any, private translate: TranslateService, private _userLanguageService: UserLanguageService, ) {
        this.showCancelButton = data.showCancel;
        if (Meteor.user()) {
            translate.use(this._userLanguageService.getLanguage(Meteor.user()));
        } else {
            translate.use(this._userLanguageService.getNavigationLanguage());
        }
        translate.setDefaultLang('en');
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