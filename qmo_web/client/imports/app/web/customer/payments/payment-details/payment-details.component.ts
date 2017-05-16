import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';
import { Orders } from "../../../../../../../both/collections/restaurant/order.collection";

import template from './payment-details.component.html';
import style from './payment-details.component.scss';

@Component({
    selector: 'payment-details',
    template,
    styles: [ style ]
})
export class PaymentDetailsComponent implements OnInit, OnDestroy {

    public _totalValue    : number = 0;
    public _tipPorcentage : number = 0;

    private _ordersSubscription : Subscription;
    private _tipTotal           : number = 0;
    private _subTotal           : number = 0;
    private _ipoCom             : number = 0.08;
    private _ipoComValue     : number = 0;
    private _ipoComBaseValue : number = 0;
    private _userLang           : string;
    private _orders             : any;

    /**
     * PaymentDetailsComponent Constructor
     * @param { TranslateService } _translate 
     * @param { NgZone } _ngZone 
     */
    constructor( private _translate: TranslateService, 
                 public _dialogRef: MdDialogRef<any>) {
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        //console.log(this._totalValue);
        //console.log(this._tipPorcentage);
        this._ordersSubscription  = MeteorObservable.subscribe('getOrdersByAccount', Meteor.userId()).subscribe();
        this._orders = Orders.find({}).zone();
        this._tipTotal        = this._totalValue * this._tipPorcentage;
        this._subTotal        = this._totalValue - this._tipTotal;

        this._ipoComValue     = this._subTotal * this._ipoCom;
        this._ipoComBaseValue = this._subTotal - this._ipoComValue;
    }

    cancel() {
        this._dialogRef.close({success : false});
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._ordersSubscription.unsubscribe();
    }
}