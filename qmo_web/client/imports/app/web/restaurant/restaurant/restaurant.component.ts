import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from "@angular/router";
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Restaurant, RestaurantImage } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants, RestaurantImages } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Country } from '../../../../../../both/models/settings/country.model';
import { Countries } from '../../../../../../both/collections/settings/country.collection';
import { City } from '../../../../../../both/models/settings/city.model';
import { Cities } from '../../../../../../both/collections/settings/city.collection';
import { Meteor } from 'meteor/meteor';
import { Hours } from '../../../../../../both/collections/general/hours.collection';
import { Hour } from '../../../../../../both/models/general/hour.model';
import { RestaurantScheduleComponent } from './restaurant-schedule/restaurant-schedule.component';
import { RestaurantEditionComponent } from './restaurant-edition/restaurant-edition.component';
import { RestaurantLocationComponent } from './restaurant-location/restaurant-location.component';

import template from './restaurant.component.html';
import style from './restaurant.component.scss';

@Component({
    selector: 'restaurant',
    template,
    styles: [style]
})
export class RestaurantComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    private restaurants             : Observable<Restaurant[]>;
    private _hours                  : Observable<Hour[]>;
    private _restaurantImages       : Observable<RestaurantImage[]>;

    private restaurantSub           : Subscription;
    private countriesSub            : Subscription;
    private citiesSub               : Subscription;
    private _hoursSub               : Subscription;
    private _restaurantImagesSub    : Subscription;

    public _dialogRef               : MdDialogRef<any>;

    /**
     * RestaurantComponent Constructor
     * @param {Router} router 
     * @param {FormBuilder} _formBuilder 
     * @param {TranslateService} translate 
     * @param {MdDialog} _dialog
     * @param {NgZone} _ngZone
     */
    constructor( private router: Router, 
                 private _formBuilder: FormBuilder, 
                 private translate: TranslateService, 
                 public _dialog: MdDialog,
                 private _ngZone: NgZone ) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit() {
        this.restaurantSub = MeteorObservable.subscribe('restaurants', this._user).subscribe( () => {
            this._ngZone.run( () => {
                this.restaurants = Restaurants.find({ creation_user: this._user}).zone();
            });
        });
        this.countriesSub = MeteorObservable.subscribe('countries').subscribe();
        this.citiesSub = MeteorObservable.subscribe('cities').subscribe();
        this._hoursSub = MeteorObservable.subscribe('hours').subscribe(() => {
            this._ngZone.run( () => {
                this._hours = Hours.find({});
            });
        });
        this._restaurantImagesSub = MeteorObservable.subscribe('restaurantImages', this._user).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurantImages = RestaurantImages.find({}).zone();
            });
        });
    }

    /**
     * Function to open RestaurantRegisterComponent
     */
    openRestaurantRegister() {
        this.router.navigate(['app/restaurantRegister']);
    }

    /**
     * When user wants show schedule, this function open dialog with information
     * @param {Restaurant} _restaurant
     */
    openSchedule(_restaurant: Restaurant) {
        this._dialogRef = this._dialog.open(RestaurantScheduleComponent, {
            disableClose: true,
            width: '40%'
        });
        this._dialogRef.componentInstance._restaurantSchedule = _restaurant;
        this._dialogRef.afterClosed().subscribe(result => {
            this._dialogRef = null;
        });
    }

    /**
     * When user wants add or update restaurant location, this function open dialog with google maps
     * @param {Restaurant} _restaurant 
     */
    openLocation(_restaurant: Restaurant) {
        this._dialogRef = this._dialog.open(RestaurantLocationComponent, {
            disableClose: true,
            width: '60%'
        });
        this._dialogRef.componentInstance._restaurantLocation = _restaurant;
        this._dialogRef.afterClosed().subscribe(result => {
            this._dialogRef = null;
        });
    }

    /**
     * Function to open RestaurantEditionComponent
     * @param {Restaurant} _restaurant 
     */
    openRestaurantEdition(_restaurant: Restaurant) {
        this.router.navigate( [ 'app/restaurantEdition', JSON.stringify(_restaurant) ], { skipLocationChange: true } );
    }

    /**
     * Get Restaurant Image
     * @param {string} _pRestaurantId
     */
    getRestaurantImage(_pRestaurantId: string): string {
        let _lRestaurantImage: RestaurantImage = RestaurantImages.findOne({ restaurantId: _pRestaurantId });
        if (_lRestaurantImage) {
            return _lRestaurantImage.url
        } else {
            return '/images/default-restaurant.png';
        }
    }

    /**
     * Get Restaurant Country
     * @param {string} _pCountryId
     */
    getRestaurantCountry(_pCountryId: string): string {
        let _lCountry: Country = Countries.findOne({ _id: _pCountryId });
        if (_lCountry) {
            return _lCountry.name;
        }
    }

    /**
     * Get Restaurant City
     * @param {string} _pCityId 
     */
    getRestaurantCity(_pCityId: string): string {
        let _lCity: City = Cities.findOne({ _id: _pCityId });
        if (_lCity) {
            return _lCity.name;
        }
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy() {
        this.restaurantSub.unsubscribe();
        this.countriesSub.unsubscribe();
        this.citiesSub.unsubscribe();
        this._hoursSub.unsubscribe();
        this._restaurantImagesSub.unsubscribe();
    }
}