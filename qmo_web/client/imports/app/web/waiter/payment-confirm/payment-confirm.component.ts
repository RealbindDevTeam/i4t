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

    private _payments       : Observable<Payment[]>;
    private _orders         : Observable<Order[]>;

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
    }
}