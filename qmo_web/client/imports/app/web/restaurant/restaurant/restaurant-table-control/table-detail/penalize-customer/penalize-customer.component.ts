import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { UserLanguageService } from '../../../../../../shared/services/user-language.service';
import { Order } from '../../../../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../../../../both/collections/restaurant/order.collection';
import { User } from '../../../../../../../../../both/models/auth/user.model';

import template from './penalize-customer.component.html';
import style from './penalize-customer.component.scss';

@Component({
    selector: 'penalize-customer',
    template,
    styles: [ style ],
    providers: [ UserLanguageService ]
})
export class PenalizeCustomerComponent implements OnInit, OnDestroy {

    private _user               : User;
    private _restaurantId       : string;
    private _tableId            : string;
    private _urlImage           : string;
    private _tableNumber        : string;

    /**
     * PenalizeCustomerComponent Constructor
     * @param {TranslateService} _translate
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _translate: TranslateService,
                 private _userLanguageService: UserLanguageService,
                 public _dialogRef: MdDialogRef<any> ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){

    }

    /**
     * Create customer penalization
     */
    PenalizeCustomerComponent():void{

    }

    /**
     * Return orders in registered status
     * @param {string} _pUserId 
     */
    getOrdersRegisteredStatus( ):number{
        return Orders.collection.find( { creation_user: this._user._id, status: 'ORDER_STATUS.REGISTERED', restaurantId: this._restaurantId, tableId: this._tableId } ).count();
    }

    /**
     * Return orders in process status
     * @param {status} _pUserId 
     */
    getOrdersInProcessStatus( ):number{
        return Orders.collection.find( { creation_user: this._user._id, status: 'ORDER_STATUS.IN_PROCESS', restaurantId: this._restaurantId, tableId: this._tableId } ).count();        
    }

    /**
     * Return orders in prepared status
     * @param {status} _pUserId 
     */
    getOrdersInPreparedStatus( ):number{
        return Orders.collection.find( { creation_user: this._user._id, status: 'ORDER_STATUS.PREPARED', restaurantId: this._restaurantId, tableId: this._tableId } ).count();        
    }

    /**
     * Return orders in delivered status
     * @param {status} _pUserId 
     */
    getOrdersDeliveredStatus( ):number{
        return Orders.collection.find( { creation_user: this._user._id, status: 'ORDER_STATUS.DELIVERED', restaurantId: this._restaurantId, tableId: this._tableId } ).count();        
    }

    /**
     * Return orders in pending confirm status
     * @param {status} _pUserId 
     */
    getOrdersPendingConfirmStatus( ):number{
        return Orders.collection.find( { creation_user: this._user._id, status: 'ORDER_STATUS.PENDING_CONFIRM', restaurantId: this._restaurantId, tableId: this._tableId } ).count();        
    }

    /**
     * Close penalize customer dialog
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