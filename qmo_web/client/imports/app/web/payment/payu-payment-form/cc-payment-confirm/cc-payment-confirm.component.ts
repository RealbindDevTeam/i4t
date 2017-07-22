import { Component, NgZone, Inject, OnInit, OnDestroy } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate';

import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';

import template from './cc-payment-confirm.component.html';
import style from './cc-payment-confirm.component.scss';

@Component({
    selector: 'cc-payment-confirm',
    template,
    styles: [style]
})

export class CcPaymentConfirmComponent implements OnInit, OnDestroy {

    private _restaurants: Observable<Restaurant[]>;
    private _restaurantSub: Subscription;
    private _cardNumber: string;

    /**
     * CallCloseConfirmComponent constructor
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor(public _dialogRef: MdDialogRef<any>, private _zone: NgZone, @Inject(MD_DIALOG_DATA) public data: any, private translate: TranslateService) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);

        this._cardNumber =  data.cardnumber.substring(data.cardnumber.length - 4);
    }

    ngOnInit() {
        this._restaurantSub = MeteorObservable.subscribe('currentRestaurantsNoPayed', Meteor.userId()).subscribe(() => {
            this._restaurants = Restaurants.find({ creation_user: Meteor.userId(), isActive: true }).zone();
        });
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