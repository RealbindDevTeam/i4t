import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Router } from '@angular/router';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { OrderToTranslateComponent } from './order-to-translate/order-to-translate.component';
import { Order, OrderTranslateInfo } from '../../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../../both/collections/restaurant/order.collection';
import { Currency } from '../../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../../both/collections/general/currency.collection';
import { UserDetails } from '../../../../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../../../../both/models/auth/user-detail.model';
import { Table } from '../../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../../both/collections/restaurant/table.collection';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';


import template from './order-payment-translate.component.html';
import style from './order-payment-translate.component.scss';

@Component({
    selector: 'order-payment-translate',
    template,
    styles: [ style ]
})
export class OrderPaymentTranslateComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    private _userDetailsSub                     : Subscription;
    private _restaurantSub                      : Subscription;
    private _tableSub                           : Subscription;
    private _ordersSub                          : Subscription;
    private _currencySub                        : Subscription;
    
    private _ordersToConfirm                    : Observable<Order[]>;
    private _ordersWithPendingConfirmation      : Observable<Order[]>;

    public _dialogRef                           : MdDialogRef<any>;
    private _restaurantId                       : string;
    private _currencyCode                       : string;
    private _tableId                            : string;
    private _currencyId                         : string;
    private _showPaymentInfo                    : boolean = false;

    /**
     * OrderPaymentTranslateComponent Constructor
     * @param { TranslateService } _translate 
     * @param { NgZone } _ngZone 
     * @param { MdDialog } _dialog
     * @param { Router } _router
     */
    constructor( private _translate: TranslateService, 
                 private _ngZone: NgZone, 
                 public _dialog: MdDialog,
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
                                    this._ordersSub = MeteorObservable.subscribe( 'getOrdersWithConfirmationPending', this._restaurantId, this._tableId ).subscribe( () => {
                                        this._ngZone.run( () => {
                                            this._ordersToConfirm = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                                                'translateInfo.firstOrderOwner': this._user, 
                                                                                'translateInfo.lastOrderOwner': { $not: '' } } ).zone();
                                            this._ordersWithPendingConfirmation = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                                                                'translateInfo.lastOrderOwner': this._user } ).zone();
                                        });
                                    });                                                    
                                });
                            });
                        });
                    });
                    this._showPaymentInfo = true;
                } else {
                    this._showPaymentInfo = false;
                }
            });
        });
    }

    /**
     * When user wants edit Addition, this function open dialog with Addition information
     * @param {Addition} _addition
     */
    open(){
        this._dialogRef = this._dialog.open( OrderToTranslateComponent, {
            disableClose : true,
            width: '70%'
        });
        this._dialogRef.componentInstance._restaurantId = this._restaurantId;
        this._dialogRef.componentInstance._tableId = this._tableId;
        this._dialogRef.componentInstance._currencyId = this._currencyId;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * Function to confirm order pay translate
     * @param {Order} _pOrder 
     */
    confirmOrderToPay( _pOrder: Order ):void{
        let _lMessageUSer: string = this.itemNameTraduction( 'ORDER_PAYMENT_TRANS.THE_USER' );
        let _lMessageWantsToPay: string = this.itemNameTraduction( 'ORDER_PAYMENT_TRANS.WANTS_PAY' );
        let _lMessageAgree: string = this.itemNameTraduction( 'ORDER_PAYMENT_TRANS.AGREE' );
        if( confirm( _lMessageUSer + _pOrder.translateInfo.lastOrderOwner + _lMessageWantsToPay + _pOrder.code + _lMessageAgree ) ) {
            let _lUser = _pOrder.translateInfo.lastOrderOwner;
            Orders.update( { _id: _pOrder._id }, { $set: { creation_user: _lUser, modification_user: this._user, modification_date: new Date(), 
                                                           'translateInfo.confirmedToTranslate': true, status: 'ORDER_STATUS.DELIVERED'
                                                         } 
                                                 } 
                         );
        } else {
            let _lOrderTranslate: OrderTranslateInfo = { firstOrderOwner: _pOrder.translateInfo.firstOrderOwner, markedToTranslate: false, lastOrderOwner: '', confirmedToTranslate: false };
            Orders.update( { _id: _pOrder._id }, { $set: { modification_user: this._user, modification_date: new Date(), 
                                                           translateInfo: _lOrderTranslate, status: 'ORDER_STATUS.DELIVERED'
                                                         } 
                                                 } 
                         );
        }
    }

    /**
     * Return To Payments Component
     */
    returnToPaymentsComponent():void{
        this._router.navigate(['app/payments']);
    }

    /**
     * Return traduction
     * @param {string} itemName 
     */
    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._userDetailsSub.unsubscribe();
        if( this._restaurantSub ){ this._restaurantSub.unsubscribe(); }
        if( this._tableSub ){ this._tableSub.unsubscribe(); }
        if( this._ordersSub ){ this._ordersSub.unsubscribe(); }
        if( this._currencySub ){ this._currencySub.unsubscribe(); }
    }
}