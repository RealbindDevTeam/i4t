import { Component, OnInit, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';

import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Table } from '../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../both/collections/restaurant/table.collection';
import { Currencies } from '../../../../../../both/collections/general/currency.collection';
import { Currency } from '../../../../../../both/models/general/currency.model';
import { Countries } from '../../../../../../both/collections/settings/country.collection';
import { Country } from '../../../../../../both/models/settings/country.model';

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

    private _tableForm: FormGroup;
    private _restaurants: Observable<Restaurant[]>;
    private _restaurantSub: Subscription;
    private _currencies: Observable<Currency[]>;
    private _currencySub: Subscription;
    private _tables: Observable<Table[]>;
    private _tableSub: Subscription;
    private _countrySub: Subscription;

    constructor(private translate: TranslateService, private _router: Router) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
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
    }

    /**
    * This function gets the coutry accordint to currency
    * @param {string} _currencyId
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

    goToEnableDisable(restaurantId: string){
        this.restaurantId.emit(restaurantId);
    }

    ngOnDestroy() {
        this._restaurantSub.unsubscribe();
        this._tableSub.unsubscribe();
        this._currencySub.unsubscribe();
        this._countrySub.unsubscribe();
    }
}