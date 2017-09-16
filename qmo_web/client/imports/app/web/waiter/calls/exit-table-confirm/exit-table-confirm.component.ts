import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MdDialogRef } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { WaiterCallDetail } from '../../../../../../../both/models/restaurant/waiter-call-detail.model';
import { Order } from '../../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../../both/collections/restaurant/order.collection';
import { Item } from '../../../../../../../both/models/administration/item.model';
import { Items } from '../../../../../../../both/collections/administration/item.collection'; 
import { Table } from '../../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../../both/collections/restaurant/table.collection';
import { Additions } from '../../../../../../../both/collections/administration/addition.collection';
import { Addition } from '../../../../../../../both/models/administration/addition.model';
import { GarnishFood } from '../../../../../../../both/models/administration/garnish-food.model';
import { GarnishFoodCol } from '../../../../../../../both/collections/administration/garnish-food.collection';
import { UserDetails } from '../../../../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../../../../both/models/auth/user-detail.model';
import { Users } from '../../../../../../../both/collections/auth/user.collection';
import { User } from '../../../../../../../both/models/auth/user.model';

import template from './exit-table-confirm.component.html';
import style from './exit-table-confirm.component.scss';

@Component({
    selector: 'exit-table-confirm',
    template,
    styles: [ style ],
    providers: [ UserLanguageService ]
})
export class ExitTableConfirmComponent implements OnInit, OnDestroy {

    public call                 : WaiterCallDetail;

    private _user = Meteor.userId();
    private _userDetailsSub     : Subscription;
    private _usersSub           : Subscription;
    private _ordersSub          : Subscription;
    private _itemsSub           : Subscription;
    private _tablesSub          : Subscription;
    private _additionsSub       : Subscription;
    private _garnishFoodSub     : Subscription;

    private _orders             : Observable<Order[]>;
    private _items              : Observable<Item[]>;
    private _additions          : Observable<Addition[]>;
    private _garnishFood        : Observable<GarnishFood[]>;
    private _usersDetails       : Observable<UserDetail[]>;

    private _tableNumber        : string;

    /**
     * ExitTableConfirmComponent constructor
     * @param {TranslateService} translate
     * @param {MdDialogRef<any>} _dialogRef
     * @param {NgZone} _ngZone
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _translate: TranslateService, 
        public _dialogRef: MdDialogRef<any>, 
        private _ngZone: NgZone,
        private _userLanguageService: UserLanguageService ){
            _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
            _translate.setDefaultLang( 'en' );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this.removeSubscriptions();
        this._userDetailsSub = MeteorObservable.subscribe( 'getUserDetailsByCurrentTable', this.call.restaurant_id, this.call.table_id ).subscribe( () => {
            this._ngZone.run( () => {
                this._usersDetails = UserDetails.find( { } ).zone();
            });
        });
        this._usersSub = MeteorObservable.subscribe('getUserByTableId', this.call.restaurant_id, this.call.table_id ).subscribe();
        this._ordersSub = MeteorObservable.subscribe( 'getOrdersByTableId', this.call.restaurant_id, this.call.table_id, 
                                                     ['ORDER_STATUS.IN_PROCESS', 'ORDER_STATUS.PREPARED'] ).subscribe( () => {
            this._ngZone.run( () => {
                this._orders = Orders.find( { } ).zone();
            });
        });
        this._itemsSub = MeteorObservable.subscribe( 'itemsByRestaurant', this.call.restaurant_id ).subscribe( () => {
            this._ngZone.run( () => {
                this._items = Items.find( { } ).zone();
            });
        });
        this._tablesSub = MeteorObservable.subscribe( 'getTablesByRestaurant', this.call.restaurant_id ).subscribe( () => {
            this._ngZone.run( () => {
                let _lTable:Table = Tables.collection.find( { _id : this.call.table_id } ).fetch()[0];
                this._tableNumber = _lTable._number + '';
            });
        });
        this._additionsSub = MeteorObservable.subscribe( 'additionsByRestaurantWork', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._additions = Additions.find( { } ).zone();
            });
        });
        this._garnishFoodSub = MeteorObservable.subscribe( 'garnishFoodByRestaurantWork', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._garnishFood = GarnishFoodCol.find( { } ).zone();
            });
        });
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._userDetailsSub ){ this._userDetailsSub.unsubscribe(); }
        if( this._ordersSub ){ this._ordersSub.unsubscribe(); }
        if( this._itemsSub ){ this._itemsSub.unsubscribe(); }
        if( this._tablesSub ){ this._tablesSub.unsubscribe(); }
        if( this._additionsSub ){ this._additionsSub.unsubscribe(); }
        if( this._garnishFoodSub ){ this._garnishFoodSub.unsubscribe(); }
    }

    /**
     * Return User Name
     * @param {string} _pUserId 
     */
    getUserName( _pUserId:string ):string{
        let _user:User = Users.findOne( { _id: _pUserId } );
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
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this.removeSubscriptions();
    }
}