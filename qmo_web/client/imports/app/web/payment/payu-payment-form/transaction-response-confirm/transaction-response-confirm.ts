import { Component, NgZone, Inject, OnInit, OnDestroy } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate';

import template from './transaction-response-confirm.html';
import style from './transaction-response-confirm.html';


@Component({
    selector: 'transaction-response-confirm',
    template,
    styles: [style]
})

export class TransactionResponseConfirmComponent implements OnInit, OnDestroy {

    /**
     * CallCloseConfirmComponent constructor
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor(public _dialogRef: MdDialogRef<any>, private _zone: NgZone, @Inject(MD_DIALOG_DATA) public data: any, private translate: TranslateService) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
    }

    ngOnInit() {

    }

    ngOnDestroy() {

    }
}