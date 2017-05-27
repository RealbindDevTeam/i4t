import { Component, OnInit, OnDestroy, NgZone, Input } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { OrderToTranslateComponent } from './order-to-translate/order-to-translate.component';
import { Order, OrderTranslateInfo } from '../../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../../both/collections/restaurant/order.collection';
import { Currency } from '../../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../../both/collections/general/currency.collection';

import template from './order-payment-translate.component.html';
import style from './order-payment-translate.component.scss';

@Component({
    selector: 'order-payment-translate',
    template,
    styles: [ style ]
})
export class OrderPaymentTranslateComponent implements OnInit, OnDestroy {

    @Input() resId: string;
    @Input() currId: string;
    @Input() tabId: string;

    private _user = Meteor.userId();
    public _dialogRef: MdDialogRef<any>;
    private _currencyCode: string;

    private _ordersSub: Subscription;
    private _currencySub: Subscription;
    private _ordersToConfirm: Observable<Order[]>;
    private _ordersWithPendingConfirmation: Observable<Order[]>;

    /**
     * OrderPaymentTranslateComponent Constructor
     * @param { TranslateService } _translate 
     * @param { NgZone } _ngZone 
     */
    constructor( private _translate: TranslateService, private _ngZone: NgZone, public _dialog: MdDialog ) {
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._ordersSub = MeteorObservable.subscribe( 'getOrdersWithConfirmationPending', this.resId, this.tabId ).subscribe( () => {
            this._ngZone.run( () => {
                this._ordersToConfirm = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                       'translateInfo.firstOrderOwner': this._user, 
                                                       'translateInfo.lastOrderOwner': { $not: '' } } ).zone();
                this._ordersWithPendingConfirmation = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                                     'translateInfo.lastOrderOwner': this._user } ).zone();
            });
        });
        this._currencySub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.resId ] ).subscribe( () => {
            this._ngZone.run( () => {
                let _lCurrency: Currency = Currencies.findOne( { _id: this.currId } );
                this._currencyCode = _lCurrency.code;
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
        this._dialogRef.componentInstance._restaurantId = this.resId;
        this._dialogRef.componentInstance._tableId = this.tabId;
        this._dialogRef.componentInstance._currencyId = this.currId;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * Function to confirm order pay translate
     * @param {Order} _pOrder 
     */
    confirmOrderToPay( _pOrder: Order ):void{
        if( confirm( 'El usuario ' + _pOrder.translateInfo.lastOrderOwner + ' desea pagar la orden ' + _pOrder.code + ', usted esta de acuerdo?' ) ) {
            let _lUser = _pOrder.translateInfo.lastOrderOwner;
            Orders.update( { _id: _pOrder._id }, { $set: { creation_user: _lUser, modification_user: this._user, modification_date: new Date(), 
                                                           'translateInfo.confirmedToTranslate': true, status: 'ORDER_STATUS.DELIVERED'
                                                         } 
                                                 } 
                         );
        } else {
            let _lOrderTranslate: OrderTranslateInfo = { firstOrderOwner: _pOrder.creation_user, markedToTranslate: false, lastOrderOwner: '', confirmedToTranslate: false };
            Orders.update( { _id: _pOrder._id }, { $set: { modification_user: this._user, modification_date: new Date(), 
                                                           translateInfo: _lOrderTranslate, status: 'ORDER_STATUS.DELIVERED'
                                                         } 
                                                 } 
                         );
        }
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._ordersSub.unsubscribe();
        this._currencySub.unsubscribe();
    }
}