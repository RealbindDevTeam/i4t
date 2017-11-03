import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from "@angular/router";
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MouseEvent } from "@agm/core";
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Restaurant, RestaurantProfile, RestaurantImage, RestaurantSchedule } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants, RestaurantsProfile, RestaurantImages } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { AlertConfirmComponent } from '../../../general/alert-confirm/alert-confirm.component';

@Component({
    selector: 'restaurant-profile',
    templateUrl: './restaurant-profile.component.html',
    styleUrls: [ './restaurant-profile.component.scss' ]
})
export class RestaurantProfileComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    private _profileForm            : FormGroup;

    private _restaurants            : Observable<Restaurant[]>;
    
    private _restaurantsSub         : Subscription;
    private _restaurantProfileSub   : Subscription;
    
    private _restaurantProfile      : RestaurantProfile;
    private _schedule               : RestaurantSchedule;
    private _scheduleToEdit         : RestaurantSchedule;
    
    private _thereAreRestaurants    : boolean = true;
    private _anyRestaurantIsSelected: boolean = false;
    private _scheduleInEditMode     : boolean = false;
    private _restaurantName         : string = '';

    lat: number = 0;
    lng: number = 0;
    
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
        this._schedule = {
            monday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            },
            tuesday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            },
            wednesday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            },
            thursday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            },
            friday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            },
            saturday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            },
            sunday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            }
        };
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._restaurantsSub ){ this._restaurantsSub.unsubscribe(); }
        if( this._restaurantProfileSub ){ this._restaurantProfileSub.unsubscribe(); }
    }

    /**
     * Validate if restaurants exists
     */
    countRestaurants():void{
        Restaurants.collection.find( { } ).count() > 0 ? this._thereAreRestaurants = true : this._thereAreRestaurants = false;
    }

    /**
     * Function to receive restaurant selected
     * @param {string} _pRestaurantId
     * @param {string} _pRestaurantName
     */
    changeRestaurant( _pRestaurantId: string, _pRestaurantName: string ):void{
        this._restaurantName = _pRestaurantName;
        this._anyRestaurantIsSelected = true;
        this._profileForm = new FormGroup({
            restaurant_description: new FormControl( '', [ Validators.required ] ),
            web_page: new FormControl( '' ),
            phone: new FormControl( '' ),
            email: new FormControl( '' ),
            facebookLink: new FormControl( '' ),
            instagramLink: new FormControl( '' ),
            twitterLink: new FormControl( '' )
        });
        this._restaurantProfileSub = MeteorObservable.subscribe( 'getRestaurantProfile', _pRestaurantId ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurantProfile = RestaurantsProfile.findOne( { restaurant_id: _pRestaurantId } );
                if( this._restaurantProfile ){
                    this._profileForm.controls['restaurant_description'].setValue( this._restaurantProfile.restaurant_description );
                    this._profileForm.controls['web_page'].setValue( this._restaurantProfile.web_page === undefined || this._restaurantProfile.web_page === null ? '' : this._restaurantProfile.web_page );
                    this._profileForm.controls['phone'].setValue( this._restaurantProfile.phone === undefined || this._restaurantProfile.phone === null ? '' : this._restaurantProfile.phone );
                    this._profileForm.controls['email'].setValue( this._restaurantProfile.email === undefined || this._restaurantProfile.email === null ? '' : this._restaurantProfile.email );
                    this._profileForm.controls['facebookLink'].setValue( this._restaurantProfile.social_networks.facebook === undefined || this._restaurantProfile.social_networks.facebook === null ? '' : this._restaurantProfile.social_networks.facebook );
                    this._profileForm.controls['instagramLink'].setValue( this._restaurantProfile.social_networks.instagram === undefined || this._restaurantProfile.social_networks.instagram === null ? '' : this._restaurantProfile.social_networks.instagram );
                    this._profileForm.controls['twitterLink'].setValue( this._restaurantProfile.social_networks.twitter === undefined || this._restaurantProfile.social_networks.twitter === null ? '' : this._restaurantProfile.social_networks.twitter );
                    this._scheduleInEditMode = true;
                    this._scheduleToEdit = this._restaurantProfile.schedule;
                }
            });
        });
    }

    /**
     * Function to receive schedule from schedule component
     * @param {any} _event 
     */
    receiveSchedule(_event: any): void {
        this._schedule = _event;
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