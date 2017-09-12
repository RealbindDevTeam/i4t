import { Component, OnInit, OnDestroy, Input, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Meteor } from 'meteor/meteor';
import { Restaurant, RestaurantImageThumb } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants, RestaurantImageThumbs } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { Tables } from '../../../../../../../both/collections/restaurant/table.collection';
import { Countries } from '../../../../../../../both/collections/settings/country.collection';
import { Country } from '../../../../../../../both/models/settings/country.model'; 
import { City } from '../../../../../../../both/models/settings/city.model';
import { Cities } from '../../../../../../../both/collections/settings/city.collection';
import { RestaurantScheduleComponent } from '../restaurant-schedule/restaurant-schedule.component';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
//import { RestaurantLocationInfoComponent } from '../restaurant-location-info/restaurant-location-info.component';

import template from './restaurant-info.component.html';
import style from './restaurant-info.component.scss';

@Component({
    selector: 'restaurant-info',
    template,
    styles: [ style ]
})
export class RestaurantInfoComponent implements OnInit, OnDestroy {

    @Input() restaurantId       : string;
    @Input() tableQRCode        : string;

    public _dialogRef           : MdDialogRef<any>;
    private _tableNumber        : number;

    private _countriesSub       : Subscription;
    private _citiesSub          : Subscription;
    private _restaurantSub      : Subscription;
    private _restaurantThumbSub : Subscription;
    private _tablesSub          : Subscription;

    private _countries          : Observable<Country[]>;
    private _cities             : Observable<City[]>;
    private _restaurants        : Observable<Restaurant[]>;

    /**
     * RestaurantInfoComponent Constructor
     * @param {TranslateService} _translate 
     * @param {MdDialog} _dialog
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _translate: TranslateService, 
                 public _dialog: MdDialog,
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService ){
                    _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
                    _translate.setDefaultLang( 'en' );
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        this.removeSubscriptions();
        this._countriesSub = MeteorObservable.subscribe( 'countries' ).subscribe( () => {
            this._ngZone.run( () => {
                this._countries = Countries.find( { } ).zone();
            });
        });
        this._citiesSub = MeteorObservable.subscribe( 'cities' ).subscribe( () => {
            this._ngZone.run( () => {
                this._cities = Cities.find( { } ).zone();
            });
        });
        this._restaurantSub = MeteorObservable.subscribe( 'getRestaurantById', this.restaurantId ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { _id: this.restaurantId } ).zone();
            });
        });
        this._restaurantThumbSub = MeteorObservable.subscribe( 'restaurantImageThumbsByRestaurantId', this.restaurantId ).subscribe();
        this._tablesSub = MeteorObservable.subscribe( 'getTableByQRCode', this.tableQRCode ).subscribe( () => {
            this._ngZone.run( () => {
                this._tableNumber = Tables.collection.findOne( { QR_code: this.tableQRCode } )._number;
            });
        });
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._countriesSub ){ this._countriesSub.unsubscribe(); }
        if( this._citiesSub ){ this._citiesSub.unsubscribe(); }
        if( this._restaurantSub ){ this._restaurantSub.unsubscribe(); }
        if( this._restaurantThumbSub ){ this._restaurantThumbSub.unsubscribe(); }
        if( this._tablesSub ){ this._tablesSub.unsubscribe(); }
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
     * Get Restaurant Image
     * @param {string} _pRestaurantId
     */
    getRestaurantImage(_pRestaurantId: string): string {
        let _lRestaurantImageThumb: RestaurantImageThumb = RestaurantImageThumbs.findOne({ restaurantId: _pRestaurantId });
        if ( _lRestaurantImageThumb ) {
            return _lRestaurantImageThumb.url
        } else {
            return '/images/default-restaurant.png';
        }
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this.removeSubscriptions();   
    }
}