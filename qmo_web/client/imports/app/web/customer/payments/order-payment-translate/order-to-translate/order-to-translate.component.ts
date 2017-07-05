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

    private _ordersTable                : Observable<Order[]>;
    private _items                      : Observable<Item[]>;
    
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
     */
    markOrderToPay( _pOrder: Order ):void{
        if( confirm( 'Desea realizar el pago de la orden ' + _pOrder.code + '?' ) ) {
            if( _pOrder.status === 'ORDER_STATUS.DELIVERED' ){
                let _lOrderTranslate: OrderTranslateInfo = { firstOrderOwner: _pOrder.creation_user, markedToTranslate: true, lastOrderOwner: this._user, confirmedToTranslate: false };
                Orders.update( { _id: _pOrder._id }, { $set: { status: 'ORDER_STATUS.PENDING_CONFIRM', modification_user: this._user,
                                                               modification_date: new Date(), translateInfo: _lOrderTranslate 
                                                             } 
                                                     } 
                             );
                alert( 'El usuario que creo la orden debe confirmar que tu la pagaras' );
            }else {
                alert( 'No es posible pagar una orden que no se haya entregado aun' );
            }
        }
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._ordersSub.unsubscribe();
        this._itemsSub.unsubscribe();
        this._itemImageThumbsSub.unsubscribe();
        this._currencySub.unsubscribe();
    }
}