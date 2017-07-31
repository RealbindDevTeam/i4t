import { Component, NgZone, Inject, OnInit, OnDestroy } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate';

import template from './trn-response-confirm.component.html';
import style from './trn-response-confirm.component.scss';


@Component({
    selector: 'transaction-response-confirm',
    template,
    styles: [style]
})

export class TrnResponseConfirmComponent implements OnInit, OnDestroy {

    private showCancelButton: boolean;

    /**
     * CallCloseConfirmComponent constructor
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor(public _dialogRef: MdDialogRef<any>, private _zone: NgZone, @Inject(MD_DIALOG_DATA) public data: any, private translate: TranslateService) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);

        this.showCancelButton = data.showCancel;
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