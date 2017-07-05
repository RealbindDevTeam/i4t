import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { Order, OrderTranslateInfo } from '../../../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../../../both/collections/restaurant/order.collection';
import { Item, ItemImage, ItemImageThumb } from '../../../../../../../../both/models/administration/item.model';
import { Items, ItemImages, ItemImagesThumbs } from '../../../../../../../../both/collections/administration/item.collection';
import { Currency } from '../../../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../../../both/collections/general/currency.collection';
import { Addition } from '../../../../../../../../both/models/administration/addition.model';
import { Additions } from '../../../../../../../../both/collections/administration/addition.collection';

import template from './order-to-translate.component.html';
import style from './order-to-translate.component.scss';

@Component({
    selector: 'order-to-translate',
    template,
    styles: [ style ]
})
export class OrderToTranslateComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    public _restaurantId                : string;
    public _tableId                     : string;
    public _currencyId                  : string;

    private _ordersSub                  : Subscription;
    private _itemsSub                   : Subscription;
    private _itemImageThumbsSub         : Subscription;
    private _currencySub                : Subscription;
    private _additionsSub               : Subscription;

    private _ordersTable                : Observable<Order[]>;
    private _items                      : Observable<Item[]>;
    private _additions                  : Observable<Addition[]>;
    
    private _orderOthersIndex           : number = -1;
    private _currencyCode               : string;

    /**
     * OrderToTranslateComponent constructor
     * @param {TranslateService} translate
     * @param {MdDialogRef<any>} _dialogRef
     * @param {NgZone} _ngZone
     */
    constructor( private _translate: TranslateService, 
                 public _dialogRef: MdDialogRef<any>, 
                 private _ngZone: NgZone ){
        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);  
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._ordersSub = MeteorObservable.subscribe( 'getOrdersByTableId', this._restaurantId, this._tableId,[ 'ORDER_STATUS.DELIVERED' ] ).subscribe( () => {
            this._ngZone.run( () => {
                this._ordersTable = Orders.find( { creation_user: { $not: this._user }, status: 'ORDER_STATUS.DELIVERED', 'translateInfo.lastOrderOwner': '',
                                                   'translateInfo.markedToTranslate': false, 'translateInfo.confirmedToTranslate': false } ).zone();
            });
        });
        this._itemsSub = MeteorObservable.subscribe( 'itemsByRestaurant', this._restaurantId ).subscribe( () => {
            this._ngZone.run( () => {
                this._items = Items.find( { } ).zone();
            });
        });
        this._itemImageThumbsSub = MeteorObservable.subscribe( 'itemImageThumbsByRestaurant', this._restaurantId ).subscribe();
        this._currencySub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this._restaurantId ] ).subscribe( () => {
            this._ngZone.run( () => {
                let _lCurrency: Currency = Currencies.findOne( { _id: this._currencyId } );
                this._currencyCode = _lCurrency.code;
            });
        });
        this._additionsSub = MeteorObservable.subscribe( 'additionsByRestaurant', this._restaurantId ).subscribe( () => {
            this._ngZone.run( () => {
                this._additions = Additions.find( { } ).zone();
            });
        });
    }

    /**
     * Get Item Image
     * @param {string} _pItemId
     */
    getItemImage( _pItemId: string ):string{
        let _lItemImage: ItemImageThumb = ItemImagesThumbs.findOne( { itemId: _pItemId } );
        if( _lItemImage ){
            return _lItemImage.url;
        } else{
            return '/images/default-plate.png';
        }
    }

    /**
     * Show table order detail
     * @param {Order} _pOrder 
     * @param {number} _pIndex
     */
    showOthersOrderDetail( _pOrder: Order, _pIndex:number ):void{
        if ( this._orderOthersIndex == _pIndex ) {
            this._orderOthersIndex = -1;
        } else {
            this._orderOthersIndex = _pIndex;
        }
    }

    /**
     * 
     */
    close():void{
        this._dialogRef.close();
    }

    /**
     * Mark order to confirm if is accepted to translate payment
     * @param {Order} _pOrder
     */
    markOrderToPay( _pOrder: Order ):void{
        let _lMessagePay:string = this.itemNameTraduction( 'ORDER_TRANS.ORDER_PAY' );
        let _lMessageUser: string = this.itemNameTraduction( 'ORDER_TRANS.USER_CONFIRM' );
        let _lMessageNoPay: string = this.itemNameTraduction( 'ORDER_TRANS.NO_PAY_POSSIBLE' );
        if( confirm( _lMessagePay + _pOrder.code + '?' ) ) {
            if( _pOrder.status === 'ORDER_STATUS.DELIVERED' ){
                let _lOrderTranslate: OrderTranslateInfo = { firstOrderOwner: _pOrder.creation_user, markedToTranslate: true, lastOrderOwner: this._user, confirmedToTranslate: false };
                Orders.update( { _id: _pOrder._id }, { $set: { status: 'ORDER_STATUS.PENDING_CONFIRM', modification_user: this._user,
                                                               modification_date: new Date(), translateInfo: _lOrderTranslate 
                                                             } 
                                                     } 
                             );
                alert( _lMessageUser );
            }else {
                alert( _lMessageNoPay );
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
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._ordersSub.unsubscribe();
        this._itemsSub.unsubscribe();
        this._itemImageThumbsSub.unsubscribe();
        this._currencySub.unsubscribe();
        this._additionsSub.unsubscribe();
    }
}