import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MeteorObservable } from "meteor-rxjs";
import { TranslateService } from 'ng2-translate';
import { Subscription, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Payment } from '../../../../../../../../../both/models/restaurant/payment.model';
import { Payments } from '../../../../../../../../../both/collections/restaurant/payment.collection';
import { Orders } from '../../../../../../../../../both/collections/restaurant/order.collection';
import { Order } from '../../../../../../../../../both/models/restaurant/order.model';
import { UserDetails } from '../../../../../../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../../../../../../both/models/auth/user-detail.model';
import { Table } from '../../../../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../../../../both/collections/restaurant/table.collection';
import { Restaurant } from '../../../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../../../both/collections/restaurant/restaurant.collection';
import { Currency } from '../../../../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../../../../both/collections/general/currency.collection';
import { Users } from '../../../../../../../../../both/collections/auth/user.collection';
import { User } from '../../../../../../../../../both/models/auth/user.model';
import { PaymentMethod } from '../../../../../../../../../both/models/general/paymentMethod.model';
import { PaymentMethods } from '../../../../../../../../../both/collections/general/paymentMethod.collection';

import template from './colombia-pay-info.component.html';
import style from './colombia-pay-info.component.scss';

@Component({
    selector: 'colombia-pay-info',
    template,
    styles: [ style ]
})
export class ColombiaPayInfoComponent implements OnInit, OnDestroy{

    private _user = Meteor.userId();
    private _paymentsSub        : Subscription;
    private _userDetailsSub     : Subscription;
    private _restaurantSub      : Subscription;
    private _currencySub        : Subscription;
    private _tableSub           : Subscription;
    private _usersSub           : Subscription;
    private _paymentMethodsSub  : Subscription;

    private _payments           : Observable<Payment[]>;
    private _paymentMethods     : Observable<PaymentMethod[]>;

    private _showPaymentsInfo   : boolean = false;
    private _restaurantId       : string;
    private _tableId            : string;
    private _currencyId         : string;
    private _currencyCode       : string;

    /**
     * ColombiaPayInfoComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     * @param {Router} _router
     */
    constructor( private _translate: TranslateService, 
                 private _ngZone:NgZone,
                 private _router: Router ) {
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._userDetailsSub = MeteorObservable.subscribe( 'getUserDetailsByUser', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                let _lUserDetail: UserDetail = UserDetails.findOne( { user_id: this._user } );
                if( _lUserDetail.current_restaurant !== "" && _lUserDetail.current_table !== "" ){
                    this._restaurantSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', this._user ).subscribe( () => {
                        this._ngZone.run( () => {
                            let _lRestaurant: Restaurant = Restaurants.findOne( { _id: _lUserDetail.current_restaurant } );
                            this._restaurantId = _lRestaurant._id;
                            this._currencyId = _lRestaurant.currencyId;
                            this._currencySub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this._restaurantId ] ).subscribe( () => {
                                this._ngZone.run( () => {
                                    let _lCurrency: Currency = Currencies.findOne( { _id: _lRestaurant.currencyId } );
                                    this._currencyCode = _lCurrency.code;
                                });
                            });
                            this._tableSub = MeteorObservable.subscribe( 'getTableByCurrentTable', this._user ).subscribe( () => {
                                this._ngZone.run( () => {
                                    let _lTable:Table = Tables.findOne( { _id: _lUserDetail.current_table } );    
                                    this._tableId = _lTable._id; 
                                    this._paymentsSub = MeteorObservable.subscribe( 'getUserPaymentsByRestaurantAndTable', this._user, this._restaurantId, this._tableId, ['PAYMENT.NO_PAID', 'PAYMENT.PAID'] ).subscribe( () => {
                                        this._ngZone.run( () => {
                                            this._payments = Payments.find( { } ).zone();
                                        });
                                    });
                                    this._usersSub = MeteorObservable.subscribe('getUserByTableId', this._restaurantId, this._tableId ).subscribe();                                               
                                });
                            });
                        });
                    });
                    this._showPaymentsInfo = true;
                } else {
                    this._showPaymentsInfo = false;
                }
            });
        });
        this._paymentMethodsSub = MeteorObservable.subscribe( 'paymentMethods' ).subscribe( () => {
            this._ngZone.run( () => {
                this._paymentMethods = PaymentMethods.find( { } ).zone();
            });
        });
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._userDetailsSub.unsubscribe();
        if( this._paymentsSub ){ this._paymentsSub.unsubscribe(); }
        if( this._restaurantSub ){  this._restaurantSub.unsubscribe(); }
        if( this._currencySub ){ this._currencySub.unsubscribe(); }
        if( this._tableSub ){ this._tableSub.unsubscribe(); }
        if( this._usersSub ){ this._usersSub.unsubscribe(); }
        this._paymentMethodsSub.unsubscribe();
    }
}
