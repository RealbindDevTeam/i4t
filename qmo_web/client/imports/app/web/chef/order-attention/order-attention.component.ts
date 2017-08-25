import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Order, OrderItem } from '../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../both/collections/restaurant/order.collection';
import { Item } from '../../../../../../both/models/administration/item.model';
import { Items } from '../../../../../../both/collections/administration/item.collection';
import { Table } from '../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../both/collections/restaurant/table.collection';
import { GarnishFood } from '../../../../../../both/models/administration/garnish-food.model';
import { GarnishFoodCol } from '../../../../../../both/collections/administration/garnish-food.collection';
import { Addition } from '../../../../../../both/models/administration/addition.model';
import { Additions } from '../../../../../../both/collections/administration/addition.collection';

import template from './order-attention.component.html';
import style from './order-attention.component.scss';

@Component({
    selector: 'order-attention',
    template,
    styles: [ style ]
})
export class OrderAttentionComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    private _ordersSub                      : Subscription;
    private _itemsSub                       : Subscription;
    private _tablesSub                      : Subscription;
    private _garnishFoodSub                 : Subscription;
    private _additionsSub                   : Subscription;

    private _ordersInProcess                : Observable<Order[]>;    
    private _ordersInProcessDetail          : Observable<Order[]>;
    private _items                          : Observable<Item[]>;
    private _tables                         : Observable<Table[]>;
    private _garnishFoodCol                 : Observable<GarnishFood[]>;
    private _additions                      : Observable<Addition[]>;

    private _showDetails                    : boolean = false;
    private _loading                        : boolean;
    private _showDetailsInProcess           : boolean = false;

    /**
     * OrderAttentionComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _translate: TranslateService, 
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService ) {
                    _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
                    _translate.setDefaultLang( 'en' );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this.removeSubscriptions();
        this._ordersSub = MeteorObservable.subscribe( 'getOrdersByRestaurantWork', this._user, [ 'ORDER_STATUS.IN_PROCESS' ] ).subscribe( () => {
            this._ngZone.run( () => {
                this._ordersInProcess = Orders.find( { } ).zone();
            });
        });
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
        this._garnishFoodSub = MeteorObservable.subscribe( 'garnishFoodByRestaurantWork', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._garnishFoodCol = GarnishFoodCol.find( { } ).zone();
            });
        });
        this._additionsSub = MeteorObservable.subscribe( 'additionsByRestaurantWork', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._additions = Additions.find( { } ).zone();
            });
        });
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._ordersSub ){ this._ordersSub.unsubscribe(); }
        if( this._itemsSub ){ this._itemsSub.unsubscribe(); }
        if( this._tablesSub ){ this._tablesSub.unsubscribe(); }
        if( this._garnishFoodSub ){ this._garnishFoodSub.unsubscribe(); }
        if( this._additionsSub ){ this._additionsSub.unsubscribe(); }
    }

    /**
     * Show Order In Process Details
     * @param {Order} _pOrder 
     */
    showOrderInProcessDetail( _pOrder: Order ):void{
        this._ordersInProcessDetail = Orders.find( { _id: _pOrder._id } ).zone();
        this._showDetailsInProcess = true;
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
        this.removeSubscriptions();    
    }
}