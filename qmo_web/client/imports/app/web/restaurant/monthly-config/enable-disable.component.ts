import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { MdSnackBar } from '@angular/material';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { generateQRCode, createTableCode } from '../../../../../../both/methods/restaurant/restaurant.methods';
import { DisableConfirmComponent } from './disable-confirm/disable-confirm.component';

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

    @Input()
    restaurantId: string;

    @Output('gotorestaurantlist')
    restaurantStatus: EventEmitter<any> = new EventEmitter<any>();

    private _tableForm: FormGroup;
    private _restaurants: Observable<Restaurant[]>;
    private _restaurantSub: Subscription;
    private _tables: Observable<Table[]>;
    private _tableSub: Subscription;
    private selectedRestaurantValue: string;
    private restaurantCode: string = '';
    private tables_count: number = 0;

    private _mdDialogRef: MdDialogRef<any>;

    constructor(private translate: TranslateService, public snackBar: MdSnackBar, public _mdDialog: MdDialog) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
        this.selectedRestaurantValue = "";
    }

    ngOnInit() {
        this._tableForm = new FormGroup({
            tables_number: new FormControl('', [Validators.required])
        });
        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe(() => {
            this._restaurants = Restaurants.find({ _id: this.restaurantId }).zone();
        });
        this._tableSub = MeteorObservable.subscribe('tables', Meteor.userId()).subscribe(() => {
            this._tables = this._tables = Tables.find({ restaurantId: this.restaurantId }).zone();
        });
    }

    /**
     * This function adds the number indicated of tables to the restaurant
     */
    addTables() {
        let snackMsg: string = this.itemNameTraduction('MONTHLY_CONFIG.TABLES_CREATE');

        if (!Meteor.userId()) {
            alert('Please log in to add a restaurant');
            return;
        }

        if (this._tableForm.valid) {
            let _lRestau: Restaurant = Restaurants.findOne({ _id: this.restaurantId });
            let _lTableNumber: number = this._tableForm.value.tables_number;
            this.restaurantCode = _lRestau.restaurant_code;
            this.tables_count = Tables.collection.find({ restaurantId: this.restaurantId }).count();

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
                    restaurantId: this.restaurantId,
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
                Restaurants.update({ _id: this.restaurantId }, { $set: { tables_quantity: _lRestau.tables_quantity + (_i + 1) } })
            }
            this._tableForm.reset();
            this.snackBar.open(snackMsg, '', {
                duration: 1500,
            });
        }
    }

    /**
     * This function generates de table code
     * @return {string}
     */
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

    /**
     * This function gets the table status
     * @param {Table} _table
     * @return {string}
     */
    getTableStatus(_table: Table): string {
        if (_table.is_active === true) {
            return 'MONTHLY_CONFIG.STATUS_ACTIVE';
        } else {
            return 'MONTHLY_CONFIG.STATUS_INACTIVE';
        }
    }

    /**
     * This function updates table status
     * @param {Table} _table
     */
    updateTableStatus(_table: Table) {
        let snackMsg: string = this.itemNameTraduction('MONTHLY_CONFIG.TABLE_MODIFIED');
        Tables.update({ _id: _table._id }, {
            $set: {
                is_active: !_table.is_active,
                modification_date: new Date(),
                modification_user: Meteor.userId()
            }
        });
        this.snackBar.open(snackMsg, '', {
            duration: 1000,
        });
    }

    /**
     * This function updates restaurant status and goes to restaurant list component
     * @param {Restaurant} _restaurant
     */
    updateStatus(_restaurant: Restaurant) {

        let titleMsg: string;
        let snackMsg: string = this.itemNameTraduction('MONTHLY_CONFIG.RESTAURANT_MODIFIED');

        if (_restaurant.isActive) {
            titleMsg = 'MONTHLY_CONFIG.DIALOG_INACTIVATE';
        } else {
            titleMsg = 'MONTHLY_CONFIG.DIALOG_ACTIVATE';
        }

        this._mdDialogRef = this._mdDialog.open(DisableConfirmComponent, {
            disableClose: true,
            data: titleMsg
        });

        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = result;

            if (result.success) {
                Restaurants.update({ _id: _restaurant._id }, {
                    $set: {
                        isActive: !_restaurant.isActive,
                        modification_user: Meteor.userId(),
                        modification_date: new Date()
                    }
                });
                this.restaurantStatus.emit(true);

                this.snackBar.open(snackMsg, '', {
                    duration: 1500,
                });
            }
        });
    }

    /**
     * This function cleans the tables_number fields form
     * @param {string} itemName
     * @return {string}
     */
    itemNameTraduction(itemName: string): string {
        var wordTraduced: string;
        this.translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res;
        });
        return wordTraduced;
    }

    /**
     * This function cleans the tables_number fields form
     */
    cancel(): void {
        if (this.selectedRestaurantValue !== "") { this.selectedRestaurantValue = ""; }
        this._tableForm.controls['tables_number'].reset();
    }

    ngOnDestroy() {
        this._restaurantSub.unsubscribe();
        this._tableSub.unsubscribe();
    }
}