import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Meteor } from 'meteor/meteor';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { Countries } from '../../../../../../../both/collections/settings/country.collection';
import { Country } from '../../../../../../../both/models/settings/country.model'; 
import { City } from '../../../../../../../both/models/settings/city.model';
import { Cities } from '../../../../../../../both/collections/settings/city.collection';
import { RestaurantScheduleComponent } from '../restaurant-schedule/restaurant-schedule.component';
import { RestaurantLocationInfoComponent } from '../restaurant-location-info/restaurant-location-info.component';
import { RestaurantInfoDetailComponent } from '../restaurant-info-detail/restaurant-info-detail.component';

import template from './restaurant-info-master.component.html';
import style from './restaurant-info-master.component.scss';

@Component({
    selector: 'restaurant-info-master',
    template,
    styles: [ style ]
})
export class RestaurantInfoMasterComponent implements OnInit, OnDestroy {

    @Input() restaurant: Restaurant;
    @Input() tableQRCode: string;

    private _showTableInfo: boolean = false;
    public _dialogRef: MdDialogRef<any>;

    private _countriesSub: Subscription;
    private _citiesSub: Subscription;

    private _countries: Observable<Country[]>;
    private _cities: Observable<City[]>;

    /**
     * RestaurantInfoMasterComponent Constructor
     * @param {TranslateService} _translate 
     */
    constructor( private _translate: TranslateService, public _dialog: MdDialog ){
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        if( this.tableQRCode ){
            this._showTableInfo = true;
        } else {
            this._showTableInfo = false;
        }

        this._countriesSub = MeteorObservable.subscribe( 'countries' ).subscribe();
        this._countries = Countries.find( { } ).zone();
        this._citiesSub = MeteorObservable.subscribe( 'cities' ).subscribe();
        this._cities = Cities.find( { } ).zone();
    }

    /**
     * When user wants show schedule, this function open dialog with information
     * @param {Restaurant} _restaurant
     */
    openSchedule( _restaurant: Restaurant ){
        this._dialogRef = this._dialog.open( RestaurantScheduleComponent, {
            disableClose : true,
            width: '40%'
        });
        this._dialogRef.componentInstance._restaurantSchedule = _restaurant;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * When user wants show restaurant location, this function open dialog with google maps
     * @param {Restaurant} _restaurant 
     */
    openLocation( _restaurant: Restaurant ){
        this._dialogRef = this._dialog.open( RestaurantLocationInfoComponent, {
            disableClose : true,
            width: '60%'
        });
        this._dialogRef.componentInstance._restaurantLocation = _restaurant;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * When user wants show restaurant information, this function open dialog with information
     * @param {Restaurant} _restaurant 
     */
    openInformation( _restaurant: Restaurant ){
        this._dialogRef = this._dialog.open( RestaurantInfoDetailComponent, {
            disableClose : true,
            width: '60%'
        });
        this._dialogRef.componentInstance._restaurant = _restaurant;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this._countriesSub.unsubscribe();
        this._citiesSub.unsubscribe();
    }
}