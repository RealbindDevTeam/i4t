import { Component } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from "meteor-rxjs";
import { Subscription } from "rxjs";

import { Restaurants } from "../../../../../../both/collections/restaurant/restaurant.collection";
import { Tables } from '../../../../../../both/collections/restaurant/table.collection';
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
    private _userSubscription : Subscription;
    private _callsDetailsSubscription : Subscription;
    private _tableSubscription : Subscription;

    private _mdDialogRef: MdDialogRef<any>;

    private _restaurants : any;
    private _waiterCallDetail : any;
    private _tables : any;
    private _waiterCallDetailCollection : any;

    private _userLang: string;

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
    showConfirm( _call : any ) {
        console.log(_call);
        this._mdDialogRef = this._mdDialog.open(CallCloseConfirmComponent, {
            disableClose : true 
        });
        this._mdDialogRef.componentInstance._callParam = _call;
        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = result;
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