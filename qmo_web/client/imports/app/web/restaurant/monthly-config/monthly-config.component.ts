import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialogRef, MdDialog, MdSnackBar } from '@angular/material';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Meteor } from 'meteor/meteor';
import { generateQRCode, createTableCode } from '../../../../../../both/methods/restaurant/restaurant.methods';

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

import template from './monthly-config.component.html';
import style from './monthly-config.component.scss';

@Component({
    selector: 'monthly-config',
    template,
    styles: [style]
})

export class MonthlyConfigComponent implements OnInit, OnDestroy {

    private _tableForm: FormGroup;
    private _restaurants: Observable<Restaurant[]>;
    private _restaurantSub: Subscription;
    private _currencies: Observable<Currency[]>;
    private _currencySub: Subscription;
    private _tables: Observable<Table[]>;
    private _tableSub: Subscription;
    private _countrySub: Subscription;
    private _selectedRestaurantValue: string;
    private _showRestaurantList: boolean = false;
    private _showEnableDisable: boolean = false;
    private _currentDate: Date;
    private _parameterSub: Subscription;
    private _restaurantId: string = "";

    constructor(private translate: TranslateService, private _router: Router, public snackBar: MdSnackBar) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
        this._selectedRestaurantValue = "";
    }

    ngOnInit() {
        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe(() => {
            this._restaurants = Restaurants.find({}).zone();
            if (this._restaurants) {
                this._showRestaurantList = true;
            }
        });
        this._parameterSub = MeteorObservable.subscribe('getParameters').subscribe();
    }

    goToEnableDisable(event) {
        this._restaurantId = event;
        this._showEnableDisable = true;
        this._showRestaurantList = false;
    }

    ngOnDestroy() {
        this._restaurantSub.unsubscribe();
        this._parameterSub.unsubscribe();
    }
}