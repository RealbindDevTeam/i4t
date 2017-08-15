import { Component, OnInit, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Table } from '../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../both/collections/restaurant/table.collection';
import { Currencies } from '../../../../../../both/collections/general/currency.collection';
import { Currency } from '../../../../../../both/models/general/currency.model';
import { Countries } from '../../../../../../both/collections/settings/country.collection';
import { Country } from '../../../../../../both/models/settings/country.model';
import { Parameters } from '../../../../../../both/collections/general/parameter.collection';
import { Parameter } from '../../../../../../both/models/general/parameter.model';

import template from './restaurant-list.component.html';
import style from './restaurant-list.component.scss';

@Component({
    selector: 'restaurant-list',
    template,
    styles: [style]
})
export class RestaurantListComponent implements OnInit, OnDestroy {

    @Output('gotoenabledisabled')
    restaurantId: EventEmitter<any> = new EventEmitter<any>();

    private _tableForm              : FormGroup;
    private _restaurants            : Observable<Restaurant[]>;
    private _restaurantSub          : Subscription;
    private _currencies             : Observable<Currency[]>;
    private _currencySub            : Subscription;
    private _tables                 : Observable<Table[]>;
    private _tableSub               : Subscription;
    private _countrySub             : Subscription;
    private _currentDate            : Date;
    private _parameters             : Observable<Parameter[]>;
    private _parameterSub           : Subscription;

    /**
     * RestaurantListComponent Constructor
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
        this._tableForm = new FormGroup({
            restaurant: new FormControl('', [Validators.required]),
            tables_number: new FormControl('', [Validators.required])
        });
        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe(() => {
            this._restaurants = Restaurants.find({}).zone();
        });
        this._tableSub = MeteorObservable.subscribe('tables', Meteor.userId()).subscribe(() => {
            this._tables = this._tables = Tables.find({}).zone();
        });
        this._currencySub = MeteorObservable.subscribe('getCurrenciesByUserId').subscribe(() => {
            this._currencies = Currencies.find({}).zone();
        });
        this._countrySub = MeteorObservable.subscribe('countries').subscribe();
        this._parameterSub = MeteorObservable.subscribe('getParameters').subscribe();

        this._currentDate = new Date(2017, 6, 5);
    }

    /**
    * This function gets the coutry according to currency
    * @param {string} _currencyId
    * @return {string}
    */
    getCountryByCurrency(_currencyId: string): string {
        let country_name: Country;
        country_name = Countries.findOne({ currencyId: _currencyId });
        if (country_name) {
            return country_name.name;
        } else {
            return "";
        }
    }

    /**
     * This function gets all tables by restaurant
     * @param {Restaurant} _restaurant
     * @return {number}
     */
    getAllTables(_restaurant: Restaurant): number {
        let tables_length: number;
        tables_length = Tables.find({ restaurantId: _restaurant._id }).fetch().length;
        if (tables_length) {
            return tables_length;
        } else {
            return 0;
        }
    }

    /**
     * This function gets the active tables by restaurant
     * @param {Restaurant} _restaurant
     * @return {number}
     */
    getActiveTables(_restaurant: Restaurant): number {
        let tables_length: number;
        tables_length = Tables.find({ restaurantId: _restaurant._id, is_active: true }).fetch().length;
        if (tables_length) {
            return tables_length;
        } else {
            return 0;
        }
    }

    /**
     * This function gets the restaurant status
     * @param {Restaurant} _restaurant
     * @return {string}
     */
    getRestaurantStatus(_restaurant: Restaurant): string {
        if (_restaurant.isActive === true) {
            return 'MONTHLY_CONFIG.STATUS_ACTIVE';
        } else {
            return 'MONTHLY_CONFIG.STATUS_INACTIVE';
        }
    }

    /**
     * This function goes to the enable disable component
     * @param {string} _restaurant
     */
    goToEnableDisable(restaurantId: string) {
        this.restaurantId.emit(restaurantId);
    }

    /**
     * This function validate the current day to return or not the customer payment
     * @return {boolean}
     */
    validatePeriodDays(): boolean {
        let startDay = Parameters.findOne({ name: 'start_payment_day' });
        let endDay = Parameters.findOne({ name: 'end_payment_day' });
        let currentDay = this._currentDate.getDate();
        let restaurants = Restaurants.collection.find({ creation_user: Meteor.userId() }).fetch();

        if (startDay && endDay && restaurants) {
            if (currentDay >= Number(startDay.value) && currentDay <= Number(endDay.value) && (restaurants.length > 0)) {
                return true;
            } else {
                return false;
            }
        }
    }

    ngOnDestroy() {
        this._restaurantSub.unsubscribe();
        this._tableSub.unsubscribe();
        this._currencySub.unsubscribe();
        this._countrySub.unsubscribe();
        this._parameterSub.unsubscribe();
    }
}