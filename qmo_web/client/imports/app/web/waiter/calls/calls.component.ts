import { Component } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from "meteor-rxjs";
import { Subscription } from "rxjs";

import { Restaurants, RestaurantImages } from "../../../../../../both/collections/restaurant/restaurant.collection";
import { Tables } from '../../../../../../both/collections/restaurant/table.collection';
import { WaiterCallDetail } from '../../../../../../both/models/restaurant/waiter-call-detail.model';
import { WaiterCallDetails } from '../../../../../../both/collections/restaurant/waiter-call-detail.collection';
import { User } from '../../../../../../both/models/auth/user.model';
import { Users } from '../../../../../../both/collections/auth/user.collection';
import { CallCloseConfirmComponent } from './call-close-confirm/call-close-confirm.component';

import template from './calls.component.html';
import style from './calls.component.scss';

@Component({
    selector: 'calls',
    template,
    styles: [ style ]
})
export class CallsComponent {

    private _userRestaurantSubscription : Subscription;
    private _userSubscription           : Subscription;
    private _callsDetailsSubscription   : Subscription;
    private _tableSubscription          : Subscription;
    private _imgRestaurantSubscription  : Subscription;

    private _mdDialogRef : MdDialogRef<any>;

    private _restaurants                : any;
    private _waiterCallDetail           : any;
    private _tables                     : any;
    private _waiterCallDetailCollection : any;
    private _imgRestaurant              : any;

    private _userLang : string;
    private _loading  : boolean;

    /**
     * Constructor Implementation
     */
    constructor(public _translate: TranslateService,
                public _mdDialog: MdDialog){
        this._userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(this._userLang);
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._userRestaurantSubscription = MeteorObservable.subscribe('getRestaurantByRestaurantWork', Meteor.userId()).subscribe(() => {
            this._restaurants = Restaurants.find({});
        });
        
        this._imgRestaurantSubscription = MeteorObservable.subscribe('restaurantImagesByRestaurantWork', Meteor.userId()).subscribe(() => {
            this._imgRestaurant = RestaurantImages.find({});
        });

        this._userSubscription = MeteorObservable.subscribe('getUserSettings').subscribe();

        this._callsDetailsSubscription = MeteorObservable.subscribe('waiterCallDetailByWaiterId', Meteor.userId()).subscribe(() => {
            this._waiterCallDetail = WaiterCallDetails.find({});
            this._waiterCallDetailCollection = WaiterCallDetails.collection.find({}).fetch()[0];
        });

        this._tableSubscription = MeteorObservable.subscribe('getTablesByRestaurantWork', Meteor.userId()).subscribe(() => {
            this._tables = Tables.find({});
        });

    }

    /**
     * This function show a modal dialog to confirm the operation
     * @param {any} _call
     */
    showConfirm( _call : WaiterCallDetail ) {
        this._mdDialogRef = this._mdDialog.open(CallCloseConfirmComponent, {
            disableClose : true 
        });
        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = result;
            if(result.success){
                this._loading = true;
                setTimeout(() => {
                    MeteorObservable.call('closeCall', _call, Meteor.userId()).subscribe(() => {
                        this._loading = false;
                    });
                }, 1500);
            }
        });
    }

    /**
     * NgOnDestroy Implementation
     */
    ngOnDestroy(){
        this._userRestaurantSubscription.unsubscribe();
        this._userSubscription.unsubscribe();
        this._callsDetailsSubscription.unsubscribe();
        this._tableSubscription.unsubscribe();
    }
}