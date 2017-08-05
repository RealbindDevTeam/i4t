import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { WaiterCallDetail } from '../../../../../../../both/models/restaurant/waiter-call-detail.model';
import { Order } from '../../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../../both/collections/restaurant/order.collection';
import { Users } from '../../../../../../../both/collections/auth/user.collection';
import { User } from '../../../../../../../both/models/auth/user.model';
import { Item } from '../../../../../../../both/models/administration/item.model';
import { Items } from '../../../../../../../both/collections/administration/item.collection'; 
import { Table } from '../../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../../both/collections/restaurant/table.collection';
import { Addition } from '../../../../../../../both/models/administration/addition.model';
import { Additions } from '../../../../../../../both/collections/administration/addition.collection';
import { GarnishFood } from '../../../../../../../both/models/administration/garnish-food.model';
import { GarnishFoodCol } from '../../../../../../../both/collections/administration/garnish-food.collection';

import template from './send-order-confirm.component.html';
import style from './send-order-confirm.component.scss';

@Component({
    selector: 'send-order-confirm',
    template,
    styles: [ style ],
    providers: [ UserLanguageService ]
})
export class SendOrderConfirmComponent implements OnInit, OnDestroy{

    public call                 : WaiterCallDetail;

    private _ordersSub          : Subscription;
    private _usersSub           : Subscription;
    private _itemsSub           : Subscription;
    private _tablesSub          : Subscription;
    private _additionsSub       : Subscription;
    private _garnishFoodSub     : Subscription;

    private _orders             : Observable<Order[]>;
    private _items              : Observable<Item[]>;
    private _additions          : Observable<Addition[]>;
    private _garnishFood        : Observable<GarnishFood[]>;

    private _tableNumber        : string;
    private _tableQRCode        : string;
    private _loading            : boolean = false;

    /**
     * SendOrderConfirmComponent constructor
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
        this._ordersSub = MeteorObservable.subscribe( 'getOrderById', this.call.order_id ).subscribe( () => {
            this._ngZone.run( () => {
                this._orders = Orders.find( { } ).zone();
            });
        });

        this._usersSub = MeteorObservable.subscribe('getUserByTableId', this.call.restaurant_id, this.call.table_id ).subscribe();
        
        this._itemsSub = MeteorObservable.subscribe( 'itemsByRestaurant', this.call.restaurant_id ).subscribe( () => {
            this._ngZone.run( () => {
                this._items = Items.find( { } ).zone();
            });
        });

        this._tablesSub = MeteorObservable.subscribe( 'getTablesByRestaurant', this.call.restaurant_id ).subscribe( () => {
            this._ngZone.run( () => {
                let _lTable:Table = Tables.collection.find( { _id : this.call.table_id } ).fetch()[0];
                this._tableNumber = _lTable._number + '';
                this._tableQRCode = _lTable.QR_code;
            });
        });

        this._additionsSub = MeteorObservable.subscribe( 'additionsByRestaurant', this.call.restaurant_id ).subscribe( () => {
            this._ngZone.run( () => {
                this._additions = Additions.find( { } ).zone();
            });
        });

        this._garnishFoodSub = MeteorObservable.subscribe( 'garnishFoodByRestaurant', this.call.restaurant_id ).subscribe( () => {
            this._ngZone.run( () => {
                this._garnishFood = GarnishFoodCol.find( { } ).zone();
            });
        });   
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
     * Close PaymentConfirm Dialog
     */
    close():void{
        this._dialogRef.close();
    }

    /**
     * Function set order status to delivered
     */
    closeCall():void{
        this._loading = true;
        setTimeout(() => {
            MeteorObservable.call( 'closeCall', this.call, Meteor.userId() ).subscribe(() => {
                this._loading = false;
                this.close();
            });
        }, 1500);
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._ordersSub.unsubscribe();
        this._usersSub.unsubscribe();
        this._itemsSub.unsubscribe();
        this._tablesSub.unsubscribe();
        this._additionsSub.unsubscribe();
        this._garnishFoodSub.unsubscribe();
    }
}