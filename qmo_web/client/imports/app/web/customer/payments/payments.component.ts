import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { UserDetails } from '../../../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../../../both/models/auth/user-detail.model';

import template from './payments.component.html';
import style from './payments.component.scss';

@Component({
    selector: 'payments',
    template,
    styles: [ style ]
})
export class PaymentsComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    private _userDetailsSub: Subscription;
    private _restaurantSub: Subscription;

    private _currentRestaurant: Restaurant;
    private _currentTable: string;
    private _showInitCard: boolean = false;
    private _showPaymentInfo: boolean = false;

    /**
     * PaymentsComponent Constructor
     * @param { TranslateService } _translate 
     * @param { NgZone } _ngZone 
     */
    constructor( private _translate: TranslateService, 
                 private _ngZone: NgZone ) {
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._userDetailsSub = MeteorObservable.subscribe( 'getUserDetailsByUser', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                let _lUserDetail: UserDetail = UserDetails.findOne( { user_id: this._user } );
                if( _lUserDetail.current_restaurant !== "" && _lUserDetail.current_table !== "" ){
                    this._restaurantSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', this._user ).subscribe( () => {
                        this._ngZone.run( () => {
                            let _lRestaurant: Restaurant = Restaurants.findOne( { _id: _lUserDetail.current_restaurant } );
                            this._currentRestaurant = _lRestaurant;
                            this._currentTable = _lUserDetail.current_table;
                            this._showInitCard = false;
                            this._showPaymentInfo = true;
                        });
                    });
                } else {
                    this._showInitCard = true;
                    this._showPaymentInfo = false;
                }
            });
        });
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._userDetailsSub.unsubscribe();
        this._restaurantSub.unsubscribe();
    }
}