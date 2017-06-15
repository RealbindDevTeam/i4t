import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { Payment } from '../../../../../../both/models/restaurant/payment.model';
import { Payments } from '../../../../../../both/collections/restaurant/payment.collection';
import { Order } from '../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../both/collections/restaurant/order.collection';
import { Users } from '../../../../../../both/collections/auth/user.collection';
import { User } from '../../../../../../both/models/auth/user.model';
import { Currency } from '../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../both/collections/general/currency.collection';
import { Item } from '../../../../../../both/models/administration/item.model';
import { Items } from '../../../../../../both/collections/administration/item.collection'; 
import { PaymentMethod } from '../../../../../../both/models/general/paymentMethod.model';
import { PaymentMethods } from '../../../../../../both/collections/general/paymentMethod.collection';

import template from './payment-confirm.component.html';
import style from './payment-confirm.component.scss';

@Component({
    selector: 'payment-confirm',
    template,
    styles: [ style ]
})
export class PaymentConfirmComponent implements OnInit, OnDestroy{

    public restId   : string;
    public tabId    : string;

    private _paymentsSub    : Subscription;
    private _ordersSub      : Subscription;
    private _usersSub       : Subscription;
    private _currencySub    : Subscription;
    private _itemsSub       : Subscription;
    private _paymentMethodsSub: Subscription;

    private _payments       : Observable<Payment[]>;
    private _orders         : Observable<Order[]>;
    private _items          : Observable<Item[]>;
    private _paymentMethods : Observable<PaymentMethod[]>;

    private _orderIndex     : number = -1;
    private _paymentIndex   : number = -1;

    /**
     * PaymentConfirmComponent constructor
     * @param {TranslateService} translate
     * @param {MdDialogRef<any>} _dialogRef
     * @param {NgZone} _ngZone
     */
    constructor( private _translate: TranslateService, public _dialogRef: MdDialogRef<any>, private _ngZone: NgZone ){
        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);  
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._paymentsSub = MeteorObservable.subscribe( 'getPaymentsToWaiter', this.restId, this.tabId ).subscribe( () => {
            this._ngZone.run( () => {
                this._payments = Payments.find( { } ).zone();
            });
        });
        this._ordersSub = MeteorObservable.subscribe( 'getOrdersByTableId', this.restId, this.tabId, ['ORDER_STATUS.DELIVERED'] ).subscribe( () => {
            this._ngZone.run( () => {
                this._orders = Orders.find( { } ).zone();
            });
        });

        this._currencySub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe();

        this._usersSub = MeteorObservable.subscribe('getUserByTableId', this.restId, this. tabId ).subscribe();

        this._itemsSub = MeteorObservable.subscribe( 'itemsByRestaurant', this.restId ).subscribe( () => {
            this._ngZone.run( () => {
                this._items = Items.find( { } ).zone();
            });
        });

        this._paymentMethodsSub = MeteorObservable.subscribe( 'paymentMethods' ).subscribe( () => {
            this._ngZone.run( () => {
                this._paymentMethods = PaymentMethods.find( { } ).zone();
            });
        });
    }

    /**
     * Return User Name
     * @param {string} _pUserId 
     */
    getUserName( _pUserId:string ):string{
        let _user:User = Users.collection.find( { } ).fetch().filter( u => u._id === _pUserId )[0];
        if( _user ){
            if( _user.username ){
                return _user.username;
            }
            else if( _user.profile.name ){
                return _user.profile.name;
            }
        }
    }

    /**
     * Return Payment Currency
     * @param {string} _pCurrencyId 
     */
    getPaymentCurrency( _pCurrencyId:string ):string{ 
        let _lCurrency: Currency = Currencies.findOne( { _id: _pCurrencyId } );
        if( _lCurrency ){ return _lCurrency.code; }   
    }

    /**
     * Allow User Show order Detail
     * @param {Order} _pOrder
     * @param {number} _pPaymentIndex 
     * @param {number} _pOrderIndex 
     */
    showOrderDetail( _pOrder:Order, _pPaymentIndex:number, _pOrderIndex: number ):void{
        this._paymentIndex = _pPaymentIndex;

        if ( this._orderIndex === _pOrderIndex ) {
            this._orderIndex = -1;
        } else {
            this._orderIndex = _pOrderIndex;
        }
    }

    /**
     * Close PaymentConfirm Dialog
     */
    close():void{
        this._dialogRef.close();
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._paymentsSub.unsubscribe();
        this._ordersSub.unsubscribe();
        this._usersSub.unsubscribe();
        this._currencySub.unsubscribe();
        this._itemsSub.unsubscribe();
        this._paymentMethodsSub.unsubscribe();
    }
}