import { Component, OnInit, OnDestroy, NgZone, Input } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { TranslateService } from 'ng2-translate';
import { Subscription, Observable } from 'rxjs';
import { Orders } from "../../../../../../../../both/collections/restaurant/order.collection";
import { Order } from '../../../../../../../../both/models/restaurant/order.model';
import { Currency } from '../../../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../../../both/collections/general/currency.collection';
import { Restaurant } from '../../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../../both/collections/restaurant/restaurant.collection';

import template from './colombia-payment.component.html';
import style from './colombia-payment.component.scss';

@Component({
    selector: 'iu-colombia-payment',
    template,
    styles: [ style ]
})
export class ColombiaPaymentComponent implements OnInit, OnDestroy {

    @Input() restId: string;
    @Input() currId: string;
    @Input() tabId: string;

    private _user = Meteor.userId();
    private _totalValue    : number = 0;

    private _ordersSubscription : Subscription;
    private _currencySub        : Subscription;
    private _restaurantsSub     : Subscription;
    
    private _orders             : Observable<Order[]>;

    private _tipTotal           : number = 0;
    private _ipoCom             : number = 108;
    private _ipoComValue        : number = 0;
    private _ipoComBaseValue    : number = 0;
    private _totalToPayment     : number = 0;
    private _ipoComBaseString   : string;
    private _ipoComString       : string;
    private _tipTotalString     : string;
    private _currencyCode       : string;
    private _tipValue           : string;

    /**
     * ColombiaPaymentComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     */
    constructor( private _translate: TranslateService, private _ngZone:NgZone ) {
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
                this._orders = Orders.find( { creation_user: this._user, status: 'ORDER_STATUS.DELIVERED' } ).zone();
                this._orders.subscribe( () => { this.calculateValues(); });
           }); 
        });
        this._restaurantsSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', this._user ).subscribe();
        this._currencySub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe( () => {
            this._ngZone.run( () => {
                let _lCurrency: Currency = Currencies.findOne( { _id: this.currId } );
                this._currencyCode = _lCurrency.code;
            });
        });
    }

    /**
     * Function to calculate this values corresponding to Payment
     */
    calculateValues():void{
        this._totalValue = 0;
        Orders.collection.find( { creation_user: this._user, status: 'ORDER_STATUS.DELIVERED' } ).fetch().forEach( ( order ) => {
            this._totalValue += order.totalPayment;
        });
        let _lRestaurant:Restaurant = Restaurants.findOne( { _id: this.restId } );
        if( _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ] > 0 ){
            this._tipValue = _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ];
            this._tipTotal = this._totalValue * ( _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ] / 100 );
        }

        this._ipoComBaseValue  = (this._totalValue * 100 ) / this._ipoCom;
        this._ipoComBaseString = (this._ipoComBaseValue).toFixed(2);

        this._ipoComValue      = this._totalValue - this._ipoComBaseValue;
        this._ipoComString     = (this._ipoComValue).toFixed(2);

        this._tipTotalString   = (this._tipTotal).toFixed(2);
        this._totalToPayment   = this._totalValue + this._tipTotal;
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._ordersSubscription.unsubscribe();
        this._currencySub.unsubscribe();
        this._restaurantsSub.unsubscribe();
    }
}