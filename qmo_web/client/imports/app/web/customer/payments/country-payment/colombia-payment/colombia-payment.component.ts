import { Component, OnInit, OnDestroy, NgZone, Input } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { TranslateService } from 'ng2-translate';
import { Subscription, Observable } from 'rxjs';
import { Orders } from "../../../../../../../../both/collections/restaurant/order.collection";
import { Order, OrderTranslateInfo } from '../../../../../../../../both/models/restaurant/order.model';
import { Currency } from '../../../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../../../both/collections/general/currency.collection';
import { Restaurant } from '../../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../../both/collections/restaurant/restaurant.collection';
import { ColombiaPaymentDetailComponent } from './colombia-payment-detail/colombia-payment-detail.component';

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
    public _dialogRef      : MdDialogRef<any>;

    private _ordersSubscription : Subscription;
    private _currencySub        : Subscription;
    private _restaurantsSub     : Subscription;
    
    private _orders             : Observable<Order[]>;

    private _tipTotal           : number = 0;
    private _ipoCom             : number = 108;
    private _ipoComValue        : number = 0;
    private _ipoComBaseValue    : number = 0;
    private _totalToPayment     : number = 0;
    private _otherTip           : number = 0;
    private _oldOtherTip        : number = 0;
    private _ipoComBaseString   : string;
    private _ipoComString       : string;
    private _tipTotalString     : string;
    private _currencyCode       : string;
    private _tipValue           : string;
    private _otherTipAllowed    : boolean = true;

    /**
     * ColombiaPaymentComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     */
    constructor( private _translate: TranslateService, private _ngZone:NgZone, public _dialog: MdDialog ) {
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
        this._totalToPayment   = this._totalValue;
    }

    /**
     * Function to evaluate if the order is available to return to the first owner
     * @param {Order} _pOrder
     */
    isAvailableToReturn( _pOrder:Order ):boolean{
        if( _pOrder.translateInfo.firstOrderOwner !== '' && _pOrder.translateInfo.lastOrderOwner !== '' 
            && _pOrder.translateInfo.confirmedToTranslate && _pOrder.translateInfo.markedToTranslate ){
            return true;
        } else {
            return false;
        }
    }

    /**
     * When this user want return the order, this function allow return the order with the original owner
     * @param {Order} _pOrder 
     */
    returnOrderToFirstOwner( _pOrder:Order ):void{
        if( confirm( 'Desea devolver la orden al usuario ' + _pOrder.translateInfo.firstOrderOwner + ' ?' ) ) {
            let _lOrderTranslateInfo: OrderTranslateInfo = { firstOrderOwner: _pOrder.translateInfo.firstOrderOwner, confirmedToTranslate: false, 
                                                             lastOrderOwner: '', markedToTranslate: false };
            Orders.update( { _id: _pOrder._id }, { $set: { creation_user: _pOrder.translateInfo.firstOrderOwner,
                                                           modification_user: this._user,
                                                           translateInfo: _lOrderTranslateInfo 
                                                         } 
                                                 }
                         );
        }
    }

    /**
     * When user wants see payment detail, this function open dialog with orders information
     */
    open(){
        this._dialogRef = this._dialog.open( ColombiaPaymentDetailComponent, {
            disableClose : true,
            width: '50%',
            height: '85%'
        });
        this._dialogRef.componentInstance.currId = this.currId;
        this._dialogRef.componentInstance.currencyCode = this._currencyCode;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * Allow user add tip in total payment
     * @param {any} _event 
     */
    allowTip( _event:any ):void{
        if( _event.checked ){
            this._totalToPayment = this._totalToPayment + this._tipTotal;
        } else {
            this._totalToPayment = this._totalToPayment - this._tipTotal;
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
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._ordersSubscription.unsubscribe();
        this._currencySub.unsubscribe();
        this._restaurantsSub.unsubscribe();
    }
}