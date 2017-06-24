import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MdSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { generateQRCode, createTableCode } from '../../../../../../both/methods/restaurant/restaurant.methods';

import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Table } from '../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../both/collections/restaurant/table.collection';

import template from './enable-disable.component.html';
import style from './enable-disable.component.scss';

import * as QRious from 'qrious';

@Component({
    selector: 'enable-disable',
    template,
    styles: [style]
})

export class EnableDisableComponent implements OnInit, OnDestroy {

    private _tableForm: FormGroup;
    private _restaurants: Observable<Restaurant[]>;
    private _restaurantSub: Subscription;
    private _tables: Observable<Table[]>;
    private _tableSub: Subscription;
    private selectedRestaurantValue: string;
    private restaurantCode: string = '';
    private tables_count: number = 0;

    constructor(private translate: TranslateService, private _router: Router, public snackBar: MdSnackBar) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
        this.selectedRestaurantValue = "";
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
    }

    changeRestaurant(_pRestaurant) {
        this.selectedRestaurantValue = _pRestaurant;
        this._tableForm.controls['restaurant'].setValue(_pRestaurant);
    }

    addTables() {
        if (!Meteor.userId()) {
            alert('Please log in to add a restaurant');
            return;
        }

        if (this._tableForm.valid) {
            let _lRestau: Restaurant = Restaurants.findOne({ _id: this._tableForm.value.restaurant });
            let _lTableNumber: number = this._tableForm.value.tables_number;
            this.restaurantCode = _lRestau.restaurant_code;
            this.tables_count = Tables.collection.find({ restaurantId: this._tableForm.value.restaurant }).count();

            for (let _i = 0; _i < _lTableNumber; _i++) {
                let _lRestaurantTableCode: string = '';
                let _lTableCode: string = '';

                _lTableCode = this.generateTableCode();

                _lRestaurantTableCode = this.restaurantCode + _lTableCode;
                let _lCodeGenerator = generateQRCode(_lRestaurantTableCode);

                let _lQrCode = new QRious({
                    background: 'white',
                    backgroundAlpha: 1.0,
                    foreground: 'black',
                    foregroundAlpha: 1.0,
                    level: 'H',
                    mime: 'image/svg',
                    padding: null,
                    size: 150,
                    value: _lCodeGenerator.getQRCode()
                });

                let _lNewTable: Table = {
                    creation_user: Meteor.userId(),
                    creation_date: new Date(),
                    restaurantId: this._tableForm.value.restaurant,
                    table_code: _lTableCode,
                    is_active: true,
                    QR_code: _lCodeGenerator.getQRCode(),
                    QR_information: {
                        significativeBits: _lCodeGenerator.getSignificativeBits(),
                        bytes: _lCodeGenerator.getFinalBytes()
                    },
                    amount_people: 0,
                    status: 'FREE',
                    QR_URI: _lQrCode.toDataURL(),
                    _number: this.tables_count + (_i + 1)
                };
                Tables.insert(_lNewTable);
                Restaurants.update({ _id: this._tableForm.value.restaurant }, { $set: { tables_quantity: _lRestau.tables_quantity + (_i + 1) } })
            }
            this._tableForm.reset();
            this.snackBar.open('Mesas creadas', '', {
                duration: 1000,
            });
        }
    }

    generateTableCode(): string {
        let _lCode: string = '';

        while (true) {
            _lCode = createTableCode();
            if (Tables.find({ table_code: _lCode }).cursor.count() === 0) {
                break;
            }
        }
        return _lCode;
    }

    cancel(): void {
        if (this.selectedRestaurantValue !== "") { this.selectedRestaurantValue = ""; }
        this._tableForm.controls['tables_number'].reset();
    }

    ngOnDestroy() {
        this._restaurantSub.unsubscribe();
        this._tableSub.unsubscribe();
    }
}