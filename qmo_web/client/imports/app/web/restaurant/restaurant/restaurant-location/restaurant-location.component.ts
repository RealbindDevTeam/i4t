import { Component, OnInit, OnDestroy } from '@angular/core';
import { MdDialogRef } from '@angular/material';
//import { MouseEvent } from "@agm/core";
import { Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';

import template from './restaurant-location.component.html';
import style from './restaurant-location.component.scss';

@Component({
  selector: 'restaurant-location',
  template,
  styles: [ style ],
  providers: [ UserLanguageService ]
})
export class RestaurantLocationComponent implements OnInit, OnDestroy {
    
    public _restaurantLocation: Restaurant;
    private _restaurantSub: Subscription;

    public _lat: number = 37.4292;
    public _lng: number = -122.1381;

    /**
     * RestaurantLocationComponent constructor
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
        if( this._restaurantLocation.location.lat !== 0 && this._restaurantLocation.location.lng !== 0 ){
            this._lat = this._restaurantLocation.location.lat;
            this._lng = this._restaurantLocation.location.lng;
        } else {
            if( navigator.geolocation ) {
                navigator.geolocation.getCurrentPosition( this.setPosition.bind( this ) );
            }
        }
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe();
    }

    /**
     * Function to Add Restaurant Location
     */
    addRestaurantLocation():void{
        Restaurants.update( this._restaurantLocation._id, {
            $set: {
                modification_user: Meteor.userId(),
                modification_date: new Date(),
                location: {
                        lat: this._lat,
                        lng: this._lng
                }
            }
        });
        alert('Se ha actualizado la posicion del restaurante');
    }

    /**
     * If user allow get current position, latitude and longitude is setted with that
     * If user not allow current position, latitude and longitude is setted with default position
     * @param {any} _pPosition
     */
    setPosition( _pPosition ) {
      let _lAuxlat = _pPosition.coords.latitude;
      let _lAuxlng = _pPosition.coords.longitude;

      if( _lAuxlat != null && _lAuxlng != null){
          this._lat = _lAuxlat;
          this._lng = _lAuxlng;
      } else {
        this._lat = 37.4292;
        this._lng = -122.1381;
      }
    }

    /**
     * Set restaurant position
     * @param {MouseEvent} $event
     
    mapClicked( $event: MouseEvent ) {
        this._lat = $event.coords.lat;
        this._lng = $event.coords.lng;
    }*/

    /**
     * Set marker in the map
     * @param {MouseEvent} event 
     
    markerDragEnd( $event: MouseEvent ) {
        this._lat = $event.coords.lat;
        this._lng = $event.coords.lng;
    }*/

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this._restaurantSub.unsubscribe();
    }
}