import { Component, OnInit, OnDestroy, NgZone, Input } from '@angular/core';
import { MeteorObservable } from "meteor-rxjs";
import { TranslateService } from 'ng2-translate';
import { Subscription, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MdSnackBar } from '@angular/material';
import { Orders } from "../../../../../../../../both/collections/restaurant/order.collection";
import { Order, OrderTranslateInfo } from '../../../../../../../../both/models/restaurant/order.model';
import { Currency } from '../../../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../../../both/collections/general/currency.collection';
import { Restaurant } from '../../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../../both/collections/restaurant/restaurant.collection';
import { PaymentMethod } from '../../../../../../../../both/models/general/paymentMethod.model';
import { PaymentMethods } from '../../../../../../../../both/collections/general/paymentMethod.collection';
import { WaiterCallDetails } from '../../../../../../../../both/collections/restaurant/waiter-call-detail.collection';
import { Payment } from '../../../../../../../../both/models/restaurant/payment.model';
import { Payments } from '../../../../../../../../both/collections/restaurant/payment.collection';

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
    private _totalValue                         : number = 0;

    private _ordersSubscription                 : Subscription;
    private _currencySub                        : Subscription;
    private _restaurantsSub                     : Subscription;
    private _paymentMethodsSub                  : Subscription;
    private _paymentsSub                        : Subscription;
    private _ordersTransfSub                    : Subscription;
    
    private _orders                             : Observable<Order[]>;
    private _paymentMethods                     : Observable<PaymentMethod[]>;
    private _paymentsNoPaid                     : Observable<Payment[]>;
    private _paymentsPaid                       : Observable<Payment[]>;
    private _ordersToConfirm                    : Observable<Order[]>;
    private _ordersWithPendingConfirmation      : Observable<Order[]>;

    private _tipTotal                           : number = 0;
    private _ipoCom                             : number = 108;
    private _ipoComValue                        : number = 0;
    private _ipoComBaseValue                    : number = 0;
    private _totalToPayment                     : number = 0;
    private _otherTip                           : number = 0;
    private _oldOtherTip                        : number = 0;
    private _ipoComBaseString                   : string;
    private _ipoComString                       : string;
    private _tipTotalString                     : string;
    private _currencyCode                       : string;
    private _tipValue                           : string;

    private _otherTipAllowed                    : boolean = true;
    private _paymentMethodId                    : string;
    private _userIncludeTip                     : boolean = false;
    private _paymentCreated                     : boolean = false;
    private _OutstandingBalance                 : boolean = true;
    private _showAlertToConfirm                 : boolean = false;
    private _showAlertWithPendingConf           : boolean = false;

    /**
     * ColombiaPaymentComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     * @param {Router} _router
     * @param {MdSnackBar} _snackBar
     */
    constructor( private _translate: TranslateService, 
                 private _ngZone: NgZone,
                 private _router: Router,
                 public _snackBar: MdSnackBar ) {
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
        this._restaurantsSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', this._user ).subscribe();
        this._currencySub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe( () => {
            this._ngZone.run( () => {
                let _lCurrency: Currency = Currencies.findOne( { _id: this.currId } );
                this._currencyCode = _lCurrency.code;
            });
        });
        this._paymentMethodsSub = MeteorObservable.subscribe( 'paymentMethods' ).subscribe( () => {
            this._ngZone.run( () => {
                this._paymentMethods = PaymentMethods.find( { } ).zone();
            });
        });
        this._paymentsSub = MeteorObservable.subscribe( 'getUserPaymentsByRestaurantAndTable', this._user, this.restId, this.tabId, ['PAYMENT.NO_PAID', 'PAYMENT.PAID'] ).subscribe( () => {
            this._ngZone.run( () => {
                this._paymentsNoPaid = Payments.find( { status: 'PAYMENT.NO_PAID' } ).zone();
                this._paymentsNoPaid.subscribe( () => { this.validateUserPayments() } );
                this._paymentsPaid = Payments.find( { status: 'PAYMENT.PAID' } ).zone();
            });
        });
        this._ordersTransfSub = MeteorObservable.subscribe( 'getOrdersWithConfirmationPending', this.restId, this.tabId ).subscribe( () => {
            this._ngZone.run( () => {
                this._ordersToConfirm = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                    'translateInfo.firstOrderOwner': this._user, 
                                                    'translateInfo.lastOrderOwner': { $not: '' } } ).zone();
                this._ordersToConfirm.subscribe( () => { this.showAlertOrdersToConfirm(); });
                this._ordersWithPendingConfirmation = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                                    'translateInfo.lastOrderOwner': this._user } ).zone();
                this._ordersWithPendingConfirmation.subscribe( () => { this.showAlertOrdersWithPendingConfirm(); });
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

        let _lRestaurant:Restaurant = Restaurants.findOne( { _id: this.restId } );
        if( _lRestaurant ){
            if( _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ] > 0 ){
                this._tipValue = _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ];
                this._tipTotal = this._totalValue * ( _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ] / 100 );
            }
        }

        this._ipoComBaseValue  = (this._totalValue * 100 ) / this._ipoCom;
        this._ipoComBaseString = (this._ipoComBaseValue).toFixed(2);

        this._ipoComValue      = this._totalValue - this._ipoComBaseValue;
        this._ipoComString     = (this._ipoComValue).toFixed(2);

        this._tipTotalString   = (this._tipTotal).toFixed(2);
        this._totalToPayment   = this._totalValue;
        this._totalToPayment > 0 ? this._OutstandingBalance = false : this._OutstandingBalance = true;
    }

    /**
     * Show alert with orders to confirm
     */
    showAlertOrdersToConfirm():void{
        let _lOrdersToConfirmCount: number = Orders.collection.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                                               'translateInfo.firstOrderOwner': this._user, 
                                                                               'translateInfo.lastOrderOwner': { $not: '' } } ).fetch().length;
        if( _lOrdersToConfirmCount > 0 ){
            this._showAlertToConfirm = true;
        } else {
            this._showAlertToConfirm = false;
        }
    }

    /**
     * Show alert with orders with pending confirmation
     */
    showAlertOrdersWithPendingConfirm():void{
        let _lOrdersWithPendingConfirmationCount: number = Orders.collection.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                                                        'translateInfo.lastOrderOwner': this._user } ).fetch().length;
        if( _lOrdersWithPendingConfirmationCount > 0 ){
            this._showAlertWithPendingConf = true;
        } else {
            this._showAlertWithPendingConf = false;
        }
    }

    /**
     * Allow user add tip in total payment
     * @param {any} _event 
     */
    allowTip( _event:any ):void{
        if( _event.checked ){
            this._totalToPayment = this._totalToPayment + this._tipTotal;
            this._userIncludeTip = true;
        } else {
            this._totalToPayment = this._totalToPayment - this._tipTotal;
            this._userIncludeTip = false;
        }
    }

    /**
     * Allow user add other tip in total payment
     * @param {any} _event
     */
    allowOtherTip( _event:any ):void{
        if( _event.checked ){
            this._otherTipAllowed = false;
        } else {
            this._otherTipAllowed = true;            
            this._totalToPayment = this._totalToPayment - this._otherTip;
            this._otherTip = 0;
            this._oldOtherTip = 0;
        }
    }

    /**
     * Sum Other tip in total payment
     * @param {any} _pEvent 
     */
    sumOtherTip( _pEvent: any ):void{
        if( _pEvent !== null ){ 
            this._totalToPayment = this._totalToPayment - this._oldOtherTip;
            this._totalToPayment = this._totalToPayment + this._otherTip;
            this._oldOtherTip = this._otherTip;
        } else {
            this._totalToPayment = this._totalToPayment - this._otherTip;
            this._otherTip = 0;
            this._oldOtherTip = 0;
        }
    }

    /**
     * Set Payment Method Id
     * @param {string} _pPaymentMethod
     */
    setPaymentMethod( _pPaymentMethod:string ):void{
        this._paymentMethodId = _pPaymentMethod;
    }

    /**
     * This function validate the payment method.
     */
    pay(){
        let _lMessage1:string = this.itemNameTraduction( 'PAYMENTS.COLOMBIA.ORDER_PENDING_STATUS' );
        let _lMessage2:string = this.itemNameTraduction( 'PAYMENTS.COLOMBIA.NO_ONLINE_PAYMENT' );
        let _lMessage3:string = this.itemNameTraduction( 'PAYMENTS.COLOMBIA.PLEASE_SELECT_PAYMENT_METHOD' );
        let _lMessage4:string = this.itemNameTraduction( 'PAYMENTS.COLOMBIA.PAYMENT_UNAVAILABLE' );
        if ( this.tabId !== "" && this.restId !== "" ) {
            if ( this._paymentMethodId === '10' || this._paymentMethodId === '20' || this._paymentMethodId === '30' ){
                let _lOrdersWithPendingConfim:number = Orders.collection.find( { creation_user: this._user, restaurantId: this.restId, tableId: this.tabId, 
                                                                                    status: 'ORDER_STATUS.PENDING_CONFIRM' } ).count();
                if( _lOrdersWithPendingConfim === 0 ){
                    let _lOrdersToInsert:string[] = [];
                    let _lTotalValue: number = 0;
                    let _lTotalTip: number = 0;
                    let _lAccountId: string;
                    Orders.collection.find( { creation_user: this._user, restaurantId: this.restId, 
                                              tableId: this.tabId, status: 'ORDER_STATUS.DELIVERED' } ).fetch().forEach( ( order ) => {
                                                  _lAccountId = order.accountId;
                                                  _lOrdersToInsert.push( order._id );
                                                  Orders.update( { _id : order._id },{ $set : { toPay : true } } );
                                                  _lTotalValue += order.totalPayment;
                                              });
                    if( this._userIncludeTip ){ _lTotalTip += this._tipTotal }
                    if( !this._otherTipAllowed ){ _lTotalTip += this._otherTip }
                    Payments.insert( {
                        creation_user: this._user,
                        creation_date: new Date(),
                        modification_user: '-',
                        modification_date: new Date(),
                        restaurantId: this.restId,
                        tableId: this.tabId,
                        accountId:_lAccountId,
                        userId: this._user,
                        orders: _lOrdersToInsert,
                        paymentMethodId: this._paymentMethodId,
                        totalOrdersPrice: _lTotalValue,
                        totalTip: _lTotalTip,
                        totalToPayment: this._totalToPayment,
                        currencyId: this.currId,
                        status: 'PAYMENT.NO_PAID',
                        received : false,
                    });
                    this.waiterCallForPay();
                } else {
                    alert( _lMessage1 );
                } 
            } else {
                if( this._paymentMethodId === '40' ){
                    alert( _lMessage2 );
                } else {
                    alert( _lMessage3 );
                }
            }
        } else {
            alert( _lMessage4 );
        }
    }

    /**
     * Validate the total number of Waiter Call payment by table Id to request the pay
     */
    waiterCallForPay() {
        var data : any = {
            restaurants : this.restId,
            tables : this.tabId,
            user : this._user,
            waiter_id : "",
            status : "waiting",
            type : 'PAYMENT',
        }
        let isWaiterCalls = WaiterCallDetails.collection.find({ restaurant_id : this.restId, 
                                                                table_id : this.tabId, 
                                                                type : data.type }).count();
        if( isWaiterCalls === 0 ){            
            setTimeout(() => {
                MeteorObservable.call( 'findQueueByRestaurant', data ).subscribe( () => {
                    let _lMessage:string = this.itemNameTraduction( 'PAYMENTS.COLOMBIA.PAYMENT_CREATED' );
                    this._snackBar.open( _lMessage, '',{
                        duration: 2500
                    });
                });
            }, 1500 );
        } else {
            let _lMessage:string = this.itemNameTraduction( 'PAYMENTS.COLOMBIA.WAITER_ATTEND' );            
            alert( _lMessage );
        }
    }

    /**
     * Validate User Payments
     */
    validateUserPayments():void{
        let _lPayments: number = Payments.collection.find( { status: 'PAYMENT.NO_PAID' } ).fetch().length;
        _lPayments > 0 ? this._paymentCreated = true : this._paymentCreated = false;
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
     * Show orders details
     */
    viewOrderDetail():void{
        this._router.navigate(['app/colOrdersInfo']);
    }

    /**
     * Show Orders Translate
     */
    viewOrderTranslate():void{
        this._router.navigate(['app/OrdersTranslate']);
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._ordersSubscription.unsubscribe();
        this._currencySub.unsubscribe();
        this._restaurantsSub.unsubscribe();
        this._paymentMethodsSub.unsubscribe();
        this._paymentsSub.unsubscribe();
        this._ordersTransfSub.unsubscribe();
    }
}