import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MeteorObservable } from "meteor-rxjs";
import { TranslateService } from 'ng2-translate';
import { Subscription, Observable } from 'rxjs';
import { MdDialogRef } from '@angular/material';
import { Orders } from "../../../../../../../../../both/collections/restaurant/order.collection";
import { Order } from '../../../../../../../../../both/models/restaurant/order.model';

import template from './colombia-payment-detail.component.html';
import style from './colombia-payment-detail.component.scss';

@Component({
    selector: 'co-payment-detail',
    template,
    styles: [ style ]
})
export class ColombiaPaymentDetailComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    public currId: string;
    public currencyCode: string;
    public restId: string;
    public tabId: string;

    private _orders: Observable<Order[]>;
    private _ordersSubscription : Subscription;

    private _totalValue         : number = 0;
    private _ipoComBaseValue    : number = 0;
    private _ipoComValue        : number = 0;
    private _ipoCom             : number = 108;
    private _ipoComBaseString   : string;
    private _ipoComString       : string;
    private _tipTotalString     : string;

    /**
     * ColombiaPaymentDetailComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     */
    constructor( private _translate: TranslateService, public _dialogRef: MdDialogRef<any>, private _ngZone:NgZone ) {
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit Implementation.
     */
    ngOnInit(){
        this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersByAccount', this._user ).subscribe( () => {
           this._ngZone.run( () => {
                this._orders = Orders.find( { creation_user: this._user, restaurantId: this.restId, tableId: this.tabId, status: { $in: [ 'ORDER_STATUS.DELIVERED','ORDER_STATUS.PENDING_CONFIRM' ] } } ).zone();
                this._orders.subscribe( () => { this.calculateValues(); });
           }); 
        });
    }

    /**
     * Function to calculate this values corresponding to Payment
     */
    calculateValues():void{
        this._totalValue = 0;
        Orders.collection.find( { creation_user: this._user, restaurantId: this.restId, tableId: this.tabId, status: { $in: [ 'ORDER_STATUS.DELIVERED','ORDER_STATUS.PENDING_CONFIRM' ] } } ).fetch().forEach( ( order ) => {
            this._totalValue += order.totalPayment;
        });
        this._ipoComBaseValue  = (this._totalValue * 100 ) / this._ipoCom;
        this._ipoComBaseString = (this._ipoComBaseValue).toFixed(2);

        this._ipoComValue      = this._totalValue - this._ipoComBaseValue;
        this._ipoComString     = (this._ipoComValue).toFixed(2);
    }

    /**
     * Close Dialog
     */
    close():void{
        this._dialogRef.close();
    }

    ngOnDestroy(){
        this._ordersSubscription.unsubscribe();
    }
}