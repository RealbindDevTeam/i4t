import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { TranslateService } from 'ng2-translate';
import { Subscription, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Orders } from '../../../../../../../../../both/collections/restaurant/order.collection';
import { Order, OrderTranslateInfo } from '../../../../../../../../../both/models/restaurant/order.model';
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
import { ColombiaPaymentDetailComponent } from './colombia-payment-detail/colombia-payment-detail.component';

import template from './colombia-order-info.component.html';
import style from './colombia-order-info.component.scss';

@Component({
    selector: 'colombia-order-info',
    template,
    styles: [ style ]
})
export class ColombiaOrderInfoComponent implements OnInit, OnDestroy{

    private _user = Meteor.userId();
    private _ordersSub          : Subscription;
    private _userDetailsSub     : Subscription;
    private _restaurantSub      : Subscription;
    private _currencySub        : Subscription;
    private _tableSub           : Subscription;
    private _usersSub           : Subscription;

    private _orders             : Observable<Order[]>;
    
    public _dialogRef           : MdDialogRef<any>;
    private _restaurantId       : string;
    private _tableId            : string;
    private _currencyId         : string;
    private _currencyCode       : string;
    private _showPaymentInfo    : boolean = false;
    private _showOrderDetails   : boolean = false;

    private _totalValue         : number = 0;
    private _ipoComBaseValue    : number = 0;
    private _ipoComValue        : number = 0;
    private _ipoCom             : number = 108;
    private _ipoComBaseString   : string;
    private _ipoComString       : string;

    /**
     * ColombiaOrderInfoComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     * @param {MdDialog} _dialog
     * @param {Router} _router
     */
    constructor( private _translate: TranslateService, 
                 private _ngZone:NgZone, 
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
                                    this._ordersSub = MeteorObservable.subscribe( 'getOrdersByAccount', this._user ).subscribe( () => {
                                        this._ngZone.run( () => {
                                            this._orders = Orders.find( { creation_user: this._user, restaurantId: this._restaurantId, tableId: this._tableId, status: { $in: [ 'ORDER_STATUS.DELIVERED','ORDER_STATUS.PENDING_CONFIRM' ] }, toPay : false } ).zone();
                                            this._orders.subscribe( () => { this.calculateValues(); });
                                        }); 
                                    });
                                    this._usersSub = MeteorObservable.subscribe('getUserByTableId', this._restaurantId, this._tableId ).subscribe();                                               
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
     * Function to calculate this values corresponding to Payment
     */
    calculateValues():void{
        this._totalValue = 0;
        Orders.collection.find( { creation_user: this._user, restaurantId: this._restaurantId, tableId: this._tableId, status: { $in: [ 'ORDER_STATUS.DELIVERED','ORDER_STATUS.PENDING_CONFIRM' ] }, toPay : false } ).fetch().forEach( ( order ) => {
            this._totalValue += order.totalPayment;
        });
        this._ipoComBaseValue  = (this._totalValue * 100 ) / this._ipoCom;
        this._ipoComBaseString = (this._ipoComBaseValue).toFixed(2);

        this._ipoComValue      = this._totalValue - this._ipoComBaseValue;
        this._ipoComString     = (this._ipoComValue).toFixed(2);
        this._totalValue > 0 ? this._showOrderDetails = true : this._showOrderDetails = false;
    }

    /**
     * When user wants see payment detail, this function open dialog with orders information
     */
    openDetail(){
        this._dialogRef = this._dialog.open( ColombiaPaymentDetailComponent, {
            disableClose : true,
            width: '50%',
            height: '85%'
        });
        this._dialogRef.componentInstance.currId = this._currencyId;
        this._dialogRef.componentInstance.currencyCode = this._currencyCode;
        this._dialogRef.componentInstance.restId = this._restaurantId;
        this._dialogRef.componentInstance.tabId = this._tableId;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * Function to evaluate if the order is available to return to the first owner
     * @param {Order} _pOrder
     */
    isAvailableToReturn( _pOrder:Order ):boolean{
        if( _pOrder.translateInfo.firstOrderOwner !== '' && _pOrder.translateInfo.lastOrderOwner !== '' 
            && _pOrder.translateInfo.confirmedToTranslate && _pOrder.translateInfo.markedToTranslate
            && _pOrder.status === 'ORDER_STATUS.DELIVERED' ){
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
        let _lMessage:string = this.itemNameTraduction( 'PAYMENTS.COLOMBIA.RETURN_ORDER_USER' );
        if( confirm( _lMessage + this.getUserName( _pOrder.translateInfo.firstOrderOwner ) + ' ?' ) ) {
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
     * Return To Payments Component
     */
    returnToPaymentsComponent():void{
        this._router.navigate(['app/payments']);
    }

    /**
     * This function allow go to Orders
     */
    goToOrders(){
        this._router.navigate(['/app/orders']);
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._userDetailsSub.unsubscribe();
        if( this._ordersSub ){ this._ordersSub.unsubscribe(); }
        if( this._restaurantSub ){  this._restaurantSub.unsubscribe(); }
        if( this._currencySub ){ this._currencySub.unsubscribe(); }
        if( this._tableSub ){ this._tableSub.unsubscribe(); }
        if( this._usersSub ){ this._usersSub.unsubscribe(); }
    }
}