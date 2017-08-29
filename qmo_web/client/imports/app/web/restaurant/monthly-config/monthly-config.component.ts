import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Parameter } from '../../../../../../both/models/general/parameter.model';

import template from './monthly-config.component.html';
import style from './monthly-config.component.scss';

@Component({
    selector: 'monthly-config',
    template,
    styles: [style]
})

export class MonthlyConfigComponent implements OnInit, OnDestroy {

    private _restaurants            : Observable<Restaurant[]>;
    private _restaurantSub          : Subscription;
    private _showRestaurantList     : boolean = false;
    private _showEnableDisable      : boolean = false;
    private _restaurantId           : string = "";

    /**
     * MonthlyConfigComponent Constructor
     * @param {TranslateService} translate 
     * @param {Router} _router 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( private translate: TranslateService, 
                 private _router: Router, 
                 private _userLanguageService: UserLanguageService ) {
        translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        translate.setDefaultLang( 'en' );
    }

    ngOnInit() {
        this.removeSubscriptions();
        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe(() => {
            this._restaurants = Restaurants.find({}).zone();
            if (this._restaurants) {
                this._showRestaurantList = true;
            }
        });
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._restaurantSub ){ this._restaurantSub.unsubscribe(); }
    }

    /**
     * This function go to enable disable component
     * @param {$event} event
     */
    goToEnableDisable(event) {
        this._restaurantId = event;
        this._showEnableDisable = true;
        this._showRestaurantList = false;
    }

    /**
     * This function go torestaurant list component
     * @param {$event} event
     */
    goToRestaurantList(event) {
        this._showEnableDisable = false;
        this._showRestaurantList = event;
    }

    goToAddRestaurant(){
        this._router.navigate(['/app/restaurant-register']);
    }

    ngOnDestroy() {
        this.removeSubscriptions();
    }
}