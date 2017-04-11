import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, NavigationExtras } from "@angular/router";
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
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
    styles: [ style ]
})
export class RestaurantComponent implements OnInit, AfterViewInit, OnDestroy {

    private restaurants: Observable<Restaurant[]>;
    private countries: Observable<Country[]>;
    private cities: Observable<City[]>;
    private _hours: Observable<Hour[]>;
    
    private restaurantSub: Subscription;              
    private countriesSub: Subscription;
    private citiesSub: Subscription;
    private _hoursSub: Subscription;
    private _empty : boolean;

    public _dialogRef: MdDialogRef<any>;

    /**
     * RestaurantComponent Constructor
     * @param {Router} router 
     * @param {FormBuilder} _formBuilder 
     * @param {TranslateService} translate 
     * @param {MdDialog} _dialog 
     */
    constructor( private router: Router, private _formBuilder: FormBuilder, private translate: TranslateService,  public _dialog: MdDialog ){
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
    }    

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        this._empty = false;
        this.restaurants = Restaurants.find({}).zone();
        this.countries = Countries.find({}).zone();
        this.cities = Cities.find({}).zone();
        this.restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe();        
        this.countriesSub = MeteorObservable.subscribe('countries').subscribe();
        this.citiesSub = MeteorObservable.subscribe('cities').subscribe();      
        this._hoursSub = MeteorObservable.subscribe( 'hours' ).subscribe( () => {
            this._hours = Hours.find( {} ); 
        }); 
    }

    ngAfterViewInit() {
        /*let prue : number;
        prue = Restaurants.collection.find({}).count();
        if (prue > 0) {
            this._empty = true;
        } else {
            this._empty = false;
        }*/
    }

    /**
     * Function to open RestaurantRegisterComponent
     */
    openRestaurantRegister(){
        this.router.navigate( [ 'app/restaurantRegister' ] );
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
        this._dialogRef.afterClosed().subscribe(result => {
            this._dialogRef = null;
        });
    }

    /**
     * When user wants add or update restaurant location, this function open dialog with google maps
     * @param {Restaurant} _restaurant 
     */
    openLocation( _restaurant: Restaurant ){
        this._dialogRef = this._dialog.open( RestaurantLocationComponent, {
            disableClose : true,
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
    openRestaurantEdition( _restaurant: Restaurant ){
        let navigationExtras: NavigationExtras = {
            queryParams: {
                "restaurant": JSON.stringify(_restaurant)
            }
        };
        this.router.navigate(['app/restaurantEdition'], navigationExtras);
    }
    
    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this.restaurantSub.unsubscribe();        
        this.countriesSub.unsubscribe();
        this.citiesSub.unsubscribe();
        this._hoursSub.unsubscribe();
    }
}