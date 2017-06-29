import { Component, OnInit, OnDestroy } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';

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

    private _restaurants: Observable<Restaurant[]>;
    private _restaurantSub: Subscription;
    private _showRestaurantList: boolean = false;
    private _showEnableDisable: boolean = false;
    private _parameterSub: Subscription;
    private _restaurantId: string = "";

    constructor(private translate: TranslateService) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
    }

    ngOnInit() {
        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe(() => {
            this._restaurants = Restaurants.find({}).zone();
            if (this._restaurants) {
                this._showRestaurantList = true;
            }
        });
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
    goToRestaurantList($event) {
        this._showEnableDisable = false;
        this._showRestaurantList = true;
    }

    ngOnDestroy() {
        this._restaurantSub.unsubscribe();
    }
}