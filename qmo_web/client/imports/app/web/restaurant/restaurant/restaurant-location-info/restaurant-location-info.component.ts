import { Component, OnInit } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';

import template from './restaurant-location-info.component.html';
import style from './restaurant-location-info.component.scss';

@Component({
    selector: 'restaurant-location-info',
    template,
    styles: [ style ],
    providers: [ UserLanguageService ]
})
export class RestaurantLocationInfoComponent implements OnInit {

    public _restaurantLocation: Restaurant;
    private _lat: number;
    private _lng: number;
    private _showMessage: boolean;

    /**
     * RestaurantLocationInfoComponent Constructor
     * @param {TranslateService} _translate 
     * @param {MdDialogRef<any>} _dialogRef 
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _translate: TranslateService, 
                 public _dialogRef: MdDialogRef<any>,
                 private _userLanguageService: UserLanguageService ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );        
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        if( this._restaurantLocation.location.lat !== 0 && this._restaurantLocation.location.lng !== 0  ){
            this._lat = this._restaurantLocation.location.lat;
            this._lng = this._restaurantLocation.location.lng;
            this._showMessage = false;
        } else {
            this._lat = 37.4292;
            this._lng = -122.1381;
            this._showMessage = true;
        }
    }
}