import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from "@angular/router";
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Restaurant, RestaurantProfile, RestaurantImage } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants, RestaurantsProfile, RestaurantImages } from '../../../../../../../both/collections/restaurant/restaurant.collection';

@Component({
    selector: 'restaurant-profile',
    templateUrl: './restaurant-profile.component.html',
    styleUrls: [ './restaurant-profile.component.scss' ]
})
export class RestaurantProfileComponent implements OnInit, OnDestroy {

    private _user = Meteor.user();

    private _restaurants: Observable<Restaurant[]>;
    private _restaurantsSub: Subscription;
    private _thereAreRestaurants: boolean = true;

    /**
     * RestaurantProfileComponent Constructor
     * @param {Router} _router 
     * @param {FormBuilder} _formBuilder 
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( private _router: Router, 
                 private _formBuilder: FormBuilder, 
                 private _translate: TranslateService, 
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService ) {
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this.removeSubscriptions();
        this._restaurantsSub = MeteorObservable.subscribe('restaurants', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find({}).zone();
                this.countRestaurants();
                this._restaurants.subscribe( () => { this.countRestaurants(); } );
            });
        });
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._restaurantsSub ){ this._restaurantsSub.unsubscribe(); }
    }

    /**
     * Validate if restaurants exists
     */
    countRestaurants():void{
        Restaurants.collection.find( { } ).count() > 0 ? this._thereAreRestaurants = true : this._thereAreRestaurants = false;
    }

    /**
     * Go to add new Restaurant
     */
    goToAddRestaurant():void{
        this._router.navigate(['/app/restaurant-register']);
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this.removeSubscriptions();
    }
}