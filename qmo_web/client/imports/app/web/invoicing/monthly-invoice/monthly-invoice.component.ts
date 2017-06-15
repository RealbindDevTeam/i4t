import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';

import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Currencies } from '../../../../../../both/collections/general/currency.collection';
import { Currency } from '../../../../../../both/models/general/currency.model';
import { Countries } from '../../../../../../both/collections/settings/country.collection';
import { Country } from '../../../../../../both/models/settings/country.model';
import { Tables } from '../../../../../../both/collections/restaurant/table.collection';
import { Table } from '../../../../../../both/models/restaurant/table.model';

import template from './monthly-invoice.component.html';
import style from './monthly-invoice.component.scss';

@Component({
    selector: 'billing',
    template,
    styles: [style]
})

export class MonthlyInvoiceComponent implements OnInit, OnDestroy {

    private _restaurants: Observable<Restaurant[]>;
    private _restaurantSub: Subscription;
    private _currencies: Observable<Currency[]>;
    private _currencySub: Subscription;
    private _countries: Observable<Country[]>;
    private _countrySub: Subscription;
    private _tables: Observable<Table[]>;
    private _tableSub: Subscription;

    constructor(private router: Router,
        private _formBuilder: FormBuilder,
        private translate: TranslateService) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
    }

    ngOnInit() {
        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe();
        this._restaurants = Restaurants.find({}).zone();

        this._currencySub = MeteorObservable.subscribe('getCurrenciesByUserId').subscribe();
        this._currencies = Currencies.find({}).zone();

        this._countrySub = MeteorObservable.subscribe('countries').subscribe();
        this._countries = Countries.find({}).zone();

        this._tableSub = MeteorObservable.subscribe('tables', Meteor.userId()).subscribe();
    }

/*
    getRestaurantPrice(_countryId: string) {

        console.log('%%%%%%%%%%' + _countryId);
        let country_price: Country;
        country_price = Countries.findOne({ _id: _countryId });
        console.log(country_price.restaurantPrice);
    }
*/

    getActiveTables(_restaurantId: string) {
        let tables_length: number;
        tables_length  = Tables.find({restaurantId: _restaurantId, is_active: true}).fetch().length;
        return tables_length;
    }

    getTablePrice(_restaurantId: string){
        let tables_length: number;
        let country: Country;
        let restaurant

        restaurant= Restaurants.findOne({_id: _restaurantId});
        tables_length  = Tables.find({restaurantId: _restaurantId, is_active: true}).fetch().length;
        




        return restaurant.email;
    }

    ngOnDestroy() {

    }
}

