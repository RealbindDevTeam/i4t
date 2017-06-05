import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { Order, OrderItem } from '../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../both/collections/restaurant/order.collection';
import { Item, ItemImageThumb } from '../../../../../../both/models/administration/item.model';
import { Items, ItemImagesThumbs } from '../../../../../../both/collections/administration/item.collection';
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

    private _user = Meteor.userId();
    private _ordersSub: Subscription;
    private _itemsSub: Subscription;
    private _tablesSub: Subscription;
    private _itemImageThumbsSub: Subscription;

    private _ordersInProcess: Observable<Order[]>;    
    private _ordersInProcessDetail: Observable<Order[]>;
    private _items: Observable<Item[]>;
    private _tables: Observable<Table[]>;

    private _showDetails: boolean = false;
    private _loading: boolean;
    private _showDetailsInProcess: boolean = false;

    /**
     * OrderAttentionComponent Constructor
     * @param {TranslateService} _translate 
     */
    constructor( private _translate: TranslateService, private _ngZone: NgZone ) {
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._ordersSub = MeteorObservable.subscribe( 'getOrdersByRestaurantWork', this._user, [ 'ORDER_STATUS.IN_PROCESS' ] ).subscribe( () => {
            this._ngZone.run( () => {
                this._ordersInProcess = Orders.find( { } ).zone();
            });
        });
        this._itemImageThumbsSub = MeteorObservable.subscribe( 'getItemImageThumbsByRestaurantWork', this._user ).subscribe();
        this._itemsSub = MeteorObservable.subscribe( 'getItemsByRestaurantWork', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._items = Items.find( { } ).zone();
            });
        });
        this._tablesSub = MeteorObservable.subscribe( 'getTablesByRestaurantWork', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._tables = Tables.find( { } ).zone();
            });
        });
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
     * Get Item Image Thumb
     * @param {string} _pItemId
     */
    getItemImage( _pItemId: string ):string{
        let _lItemImage: ItemImageThumb = ItemImagesThumbs.findOne( { itemId: _pItemId } );
        if( _lItemImage ){
            return _lItemImage.url;
        }
    }

    /**
     * Set status order to PREPARED
     * @param {Order} _pOrder 
     */
    setPreparedState( _pOrder: Order ):void{
        this._showDetailsInProcess = false;
        var restaurant_id = _pOrder.restaurantId;
        var table_id = _pOrder.tableId;

        var data : any = {
          restaurants : restaurant_id,
          tables : table_id,
          user : this._user,
          waiter_id : "",
          status : "PREPARED",
          type : "SEND_ORDER",
          order_id : _pOrder._id
        }
        
        this._loading = true;
        setTimeout(() => {
          MeteorObservable.call('findQueueByRestaurant', data).subscribe(() => {
            Orders.update( { _id: _pOrder._id }, 
                           { $set: { status: 'ORDER_STATUS.PREPARED',
                                     modification_user: this._user, 
                                     modification_date: new Date() 
                                   } 
                           }
                         );
            this._loading = false;
          });
        }, 1500);
    }
    
    /**
     * ngOnDestory Implementation
     */
    ngOnDestroy(){
        this._ordersSub.unsubscribe();
        this._itemsSub.unsubscribe();
        this._tablesSub.unsubscribe();
        this._itemImageThumbsSub.unsubscribe();
    }
}