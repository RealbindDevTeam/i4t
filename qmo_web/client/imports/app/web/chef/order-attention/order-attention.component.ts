import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { Order, OrderItem } from '../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../both/collections/restaurant/order.collection';
import { Item } from '../../../../../../both/models/administration/item.model';
import { Items } from '../../../../../../both/collections/administration/item.collection';

import template from './order-attention.component.html';
import style from './order-attention.component.scss';

@Component({
    selector: 'order-attention',
    template,
    styles: [ style ]
})
export class OrderAttentionComponent implements OnInit, OnDestroy {

    private _ordersSub: Subscription;
    private _itemsSub: Subscription;

    private _ordersConfirmed: Observable<Order[]>;
    private _ordersInProcess: Observable<Order[]>;    
    private _items: Observable<Item[]>;

    private _ordersConfirmedIndex: number = -1;

    /**
     * OrderAttentionComponent Constructor
     * @param {TranslateService} _translate 
     */
    constructor( private _translate: TranslateService ) {
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._ordersSub = MeteorObservable.subscribe( 'getOrdersByRestaurantWork', Meteor.userId(), [ 'CONFIRMED', 'IN_PROCESS' ] ).subscribe();
        this._ordersConfirmed = Orders.find( { status: 'CONFIRMED' } ).zone();
        this._ordersInProcess = Orders.find( { status: 'IN_PROCESS' } ).zone();
        this._itemsSub = MeteorObservable.subscribe( 'getItemsByRestaurantWork', Meteor.userId() ).subscribe();
        this._items = Items.find( { } ).zone();
    }

    showOrderConfirmedDetail( _pOrder: Order, _pIndex:number ):void{
        if ( this._ordersConfirmedIndex == _pIndex ) {
            this._ordersConfirmedIndex = -1;
        } else {
            this._ordersConfirmedIndex = _pIndex;
        }
    }

    /**
     * ngOnDestory Implementation
     */
    ngOnDestroy(){
        this._ordersSub.unsubscribe();
        this._itemsSub.unsubscribe();
    }
}