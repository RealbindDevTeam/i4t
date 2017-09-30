import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { UserLanguageService } from '../../../../../shared/services/user-language.service';
import { User } from '../../../../../../../../both/models/auth/user.model';
import { UserProfileImage } from '../../../../../../../../both/models/auth/user-profile.model';
import { Users, UserImages } from '../../../../../../../../both/collections/auth/user.collection';
import { UserDetail } from '../../../../../../../../both/models/auth/user-detail.model';
import { UserDetails } from '../../../../../../../../both/collections/auth/user-detail.collection';
import { Order } from '../../../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../../../both/collections/restaurant/order.collection';
import { Currency } from '../../../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../../../both/collections/general/currency.collection';

import template from './table-detail.component.html';
import style from './table-detail.component.scss';

@Component({
    selector: 'table-detail',
    template,
    styles: [ style ],
    providers:[ UserLanguageService ]
})
export class TableDetailComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    private _restaurantId           : string;
    private _tableId                : string;
    private _tableNumber            : string;
    private _currencyId             : string;
    private _userDetails            : Observable<UserDetail[]>;
    private _users                  : Observable<User[]>;
    private _currencyCode           : string;

    /**
     * TableDetailComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     * @param {UserLanguageService} _userLanguageService 
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor( private _translate: TranslateService,
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService,
                 public _dialogRef: MdDialogRef<any> ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._userDetails = UserDetails.find( { current_restaurant: this._restaurantId, current_table: this._tableId } ).zone();
        this._users = Users.find( { } ).zone();
        let _lCurrency:Currency = Currencies.findOne( { _id: this._currencyId } );
        this._currencyCode = _lCurrency.code;
    }

    /**
     * Return user image
     * @param {User} _pUser 
     */
    getUserImage( _pUser:User ):string{
        if( _pUser.services.facebook ){
            return "http://graph.facebook.com/" + _pUser.services.facebook.id + "/picture/?type=large";
        } else {
            let _lUserImage: UserProfileImage = UserImages.findOne( { userId: _pUser._id });
            if( _lUserImage ){
                return _lUserImage.url;
            } 
            else {
                return '/images/user_default_image.png';
            }
        }
    }

    /**
     * Return orders in registered status
     * @param {string} _pUserId 
     */
    getOrdersRegisteredStatus( _pUserId:string ):number{
        return Orders.collection.find( { creation_user: _pUserId, status: 'ORDER_STATUS.REGISTERED', restaurantId: this._restaurantId, tableId: this._tableId } ).count();
    }

    /**
     * Return orders in process status
     * @param {status} _pUserId 
     */
    getOrdersInProcessStatus( _pUserId:string ):number{
        return Orders.collection.find( { creation_user: _pUserId, status: 'ORDER_STATUS.IN_PROCESS', restaurantId: this._restaurantId, tableId: this._tableId } ).count();        
    }

    /**
     * Return orders in prepared status
     * @param {status} _pUserId 
     */
    getOrdersInPreparedStatus( _pUserId:string ):number{
        return Orders.collection.find( { creation_user: _pUserId, status: 'ORDER_STATUS.PREPARED', restaurantId: this._restaurantId, tableId: this._tableId } ).count();        
    }

    /**
     * Return orders in delivered status
     * @param {status} _pUserId 
     */
    getOrdersDeliveredStatus( _pUserId:string ):number{
        return Orders.collection.find( { creation_user: _pUserId, status: 'ORDER_STATUS.DELIVERED', restaurantId: this._restaurantId, tableId: this._tableId } ).count();        
    }

    /**
     * Return orders in pending confirm status
     * @param {status} _pUserId 
     */
    getOrdersPendingConfirmStatus( _pUserId:string ):number{
        return Orders.collection.find( { creation_user: _pUserId, status: 'ORDER_STATUS.PENDING_CONFIRM', restaurantId: this._restaurantId, tableId: this._tableId } ).count();        
    }

    /**
     * Return Total Consumption
     * @param {string} _pUserId 
     */
    getTotalConsumption( _pUserId:string ):number{
        let _lConsumption: number = 0;
        Orders.collection.find( { creation_user: _pUserId, status: { $in: [ 'ORDER_STATUS.DELIVERED', 'ORDER_STATUS.PENDING_CONFIRM' ] }, restaurantId: this._restaurantId, tableId: this._tableId } ).fetch().forEach( ( order ) => {
            _lConsumption += order.totalPayment;
        });
        return _lConsumption;
    }

    /**
     * Close Dialog
     */
    close():void{
        this._dialogRef.close();
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){

    }
}