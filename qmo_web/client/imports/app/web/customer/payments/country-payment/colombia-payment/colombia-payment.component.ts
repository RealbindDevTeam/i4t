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

    @Input() restaurantId: string;
    @Input() currencyId: string;

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
     * ngOnInit Implementation. That allow calculate this values corresponding to Payment
     */
    ngOnInit(){
        this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersByAccount', this._user ).subscribe( () => {
           this._ngZone.run( () => {
                this._orders = Orders.find( { } ).zone();
                Orders.collection.find( { } ).fetch().forEach( ( order ) => {
                    this._totalValue += order.totalPayment;
                });
                this._restaurantsSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', this._user ).subscribe( () => {
                    this._ngZone.run( () => {
                        let _lRestaurant:Restaurant = Restaurants.findOne( { _id: this.restaurantId } );
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
                    });
                });
           }); 
        });
        this._currencySub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restaurantId ] ).subscribe( () => {
            this._ngZone.run( () => {
                let _lCurrency: Currency = Currencies.findOne( { _id: this.currencyId } );
                this._currencyCode = _lCurrency.code;
            });
        });
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