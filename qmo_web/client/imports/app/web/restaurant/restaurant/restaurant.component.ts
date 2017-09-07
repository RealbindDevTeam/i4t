import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from "@angular/router";
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { UserLanguageService } from '../../../shared/services/user-language.service';
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
import { RestaurantFacebookComponent } from './social-network/facebook/restaurant-facebook.component';
import { RestaurantInstagramComponent } from './social-network/instagram/restaurant-instagram.component';
import { RestaurantTwitterComponent } from './social-network/twitter/restaurant-twitter.component';

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
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private router: Router, 
                 private _formBuilder: FormBuilder, 
                 private translate: TranslateService, 
                 public _dialog: MdDialog,
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService ) {
        translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        translate.setDefaultLang( 'en' );
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit() {
        this.removeSubscriptions();
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
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this.restaurantSub ){ this.restaurantSub.unsubscribe(); }
        if( this.countriesSub ){ this.countriesSub.unsubscribe(); }
        if( this.citiesSub ){ this.citiesSub.unsubscribe(); }
        if( this._hoursSub ){ this._hoursSub.unsubscribe(); }
        if( this._restaurantImagesSub ){ this._restaurantImagesSub.unsubscribe(); }
    }

    /**
     * Function to open RestaurantRegisterComponent
     */
    openRestaurantRegister() {
        this.router.navigate(['app/restaurant-register']);
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
        this.router.navigate( [ 'app/restaurant-edition', JSON.stringify(_restaurant) ], { skipLocationChange: true } );
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
     * When user wants update restaurant facebook link
     * @param {Restaurant} _restaurant
     */
    openFacebookLink(_restaurant: Restaurant) {
        this._dialogRef = this._dialog.open(RestaurantFacebookComponent, {
            disableClose: true,
            width: '50%'
        });
        this._dialogRef.componentInstance._restaurant = _restaurant;
        this._dialogRef.afterClosed().subscribe(result => {
            this._dialogRef = null;
        });
    }

    /**
     * When user wants update restaurant twitter link
     * @param {Restaurant} _restaurant
     */
    openTwitterLink(_restaurant: Restaurant) {
        this._dialogRef = this._dialog.open(RestaurantTwitterComponent, {
            disableClose: true,
            width: '50%'
        });
        this._dialogRef.componentInstance._restaurant = _restaurant;
        this._dialogRef.afterClosed().subscribe(result => {
            this._dialogRef = null;
        });
    }

    /**
     * When user wants update restaurant instagram link
     * @param {Restaurant} _restaurant
     */
    openInstagramLink(_restaurant: Restaurant) {
        this._dialogRef = this._dialog.open(RestaurantInstagramComponent, {
            disableClose: true,
            width: '50%'
        });
        this._dialogRef.componentInstance._restaurant = _restaurant;
        this._dialogRef.afterClosed().subscribe(result => {
            this._dialogRef = null;
        });
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy() {
        this.removeSubscriptions();   
    }
}