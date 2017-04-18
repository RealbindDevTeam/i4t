import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { Order, OrderItem } from '../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../both/collections/restaurant/order.collection';
import { Item } from '../../../../../../both/models/administration/item.model';
import { Items } from '../../../../../../both/collections/administration/item.collection';
import { Table } from '../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../both/collections/restaurant/table.collection';

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
    private _tablesSub: Subscription;

    private _ordersConfirmed: Observable<Order[]>;
    private _ordersConfirmedDetail: Observable<Order[]>;
    private _ordersInProcess: Observable<Order[]>;    
    private _ordersInProcessDetail: Observable<Order[]>;
    private _items: Observable<Item[]>;
    private _tables: Observable<Table[]>;

    private _showDetails: boolean = false;
    private _showDetailsInProcess: boolean = false;

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
        this._tablesSub = MeteorObservable.subscribe( 'getTablesByRestaurantWork', Meteor.userId() ).subscribe();
        this._tables = Tables.find( { } ).zone();
    }

    /**
     * Show Order confirmed Details
     * @param {Order} _pOrder 
     */
    showOrderConfirmedDetail( _pOrder: Order ):void{
        this._ordersConfirmedDetail = Orders.find( { _id: _pOrder._id } );
        this._showDetails = true;
    }

    /**
     * Set status order to IN_PROCESS
     * @param {Order} _pOrder 
     */
    setInProcessState( _pOrder: Order ):void{
        Orders.update( { _id: _pOrder._id }, 
                       { $set: { status: 'IN_PROCESS',
                                 modification_user: Meteor.userId(), 
                                 modification_date: new Date() 
                               } 
                       }
                     );
        this._showDetails = false;
    }

    /**
     * Show Order In Process Details
     * @param {Order} _pOrder 
     */
    showOrderInProcessDetail( _pOrder: Order ):void{
        this._ordersInProcessDetail = Orders.find( { _id: _pOrder._id } );
        this._showDetailsInProcess = true;
    }

    /**
     * Set status order to PREPARED
     * @param {Order} _pOrder 
     */
    setPreparedState( _pOrder: Order ):void{
        Orders.update( { _id: _pOrder._id }, 
                       { $set: { status: 'PREPARED',
                                 modification_user: Meteor.userId(), 
                                 modification_date: new Date() 
                               } 
                       }
                     );
        this._showDetailsInProcess = false;
    }

    /**
     * ngOnDestory Implementation
     */
    ngOnDestroy(){
        this._ordersSub.unsubscribe();
        this._itemsSub.unsubscribe();
        this._tablesSub.unsubscribe();
    }
}