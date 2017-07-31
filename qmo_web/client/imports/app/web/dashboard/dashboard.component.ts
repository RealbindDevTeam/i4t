import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { Restaurant, RestaurantImageThumb } from '../../../../../both/models/restaurant/restaurant.model';
import { Restaurants, RestaurantImageThumbs } from '../../../../../both/collections/restaurant/restaurant.collection';
import { UserDetail } from '../../../../../both/models/auth/user-detail.model';
import { UserDetails } from '../../../../../both/collections/auth/user-detail.collection';
import { Table } from '../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../both/collections/restaurant/table.collection';
import { Item } from '../../../../../both/models/administration/item.model';
import { Items } from '../../../../../both/collections/administration/item.collection';
import { Addition } from '../../../../../both/models/administration/addition.model';
import { Additions } from '../../../../../both/collections/administration/addition.collection';
import { GarnishFood } from '../../../../../both/models/administration/garnish-food.model';
import { GarnishFoodCol } from '../../../../../both/collections/administration/garnish-food.collection';
import { Order } from '../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../both/collections/restaurant/order.collection';

import template from './dashboard.component.html';
import style from './dashboard.component.scss';   

@Component({
  selector : 'admin-dashboard',
  template,
  styles: [ style ]
})
export class DashboardComponent implements OnInit, OnDestroy {

  private _user = Meteor.userId();

  private _restaurants            : Observable<Restaurant[]>;
  private _tables                 : Observable<Table[]>;
  private _items                  : Observable<Item[]>;

  private _restaurantsSub         : Subscription;
  private _restaurantImgThumbSub  : Subscription;
  private _userDetailsSub         : Subscription;
  private _tablesSub              : Subscription;
  private _itemsSub               : Subscription;

  /**
   * DashboardComponent Constructor
   * @param {TranslateService} _translate 
   * @param {NgZone} _ngZone 
   */
  constructor( private _translate: TranslateService, 
               private _ngZone: NgZone ){
    var _userLang = navigator.language.split( '-' )[0];
    _translate.setDefaultLang( 'en' );
    _translate.use( _userLang );
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit(){
    let _lRestaurantsId:string[] = [];
    this._restaurantsSub = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
      this._ngZone.run( () => {
        this._restaurants = Restaurants.find( { } ).zone();
        Restaurants.collection.find( { } ).fetch().forEach( ( restaurant:Restaurant ) => {
          _lRestaurantsId.push( restaurant._id );
        });
        this._restaurantImgThumbSub = MeteorObservable.subscribe( 'restaurantImageThumbs', this._user ).subscribe();
        this._userDetailsSub = MeteorObservable.subscribe( 'getUsersByRestaurantsId', _lRestaurantsId ).subscribe();
      });
    });
  }

  /**
   * Get restaurant Image
   * @param {string} _pRestaurantId
   */
  getRestaurantId( _pRestaurantId:string ):string{
    let _lRestaurantImage: RestaurantImageThumb = RestaurantImageThumbs.findOne( { restaurantId: _pRestaurantId } );
    if( _lRestaurantImage ){
      return _lRestaurantImage.url;
    } else {
      return '/images/default-restaurant.png';
    }
  }

  /**
   * Get Users in restaurant
   * @param {string} _pRestaurantId
   */
  getRestaurantUsers( _pRestaurantId:string ):number{
    return UserDetails.collection.find( { current_restaurant: _pRestaurantId } ).count();
  }

  /**
   * ngOnDestroy Implementation
   */
  ngOnDestroy(){
    this._restaurantsSub.unsubscribe();
    if( this._restaurantImgThumbSub ){ this._restaurantImgThumbSub.unsubscribe(); }
    if( this._userDetailsSub ){ this._userDetailsSub.unsubscribe(); }
    //this._tablesSub.unsubscribe();
    //this._itemsSub.unsubscribe();
  }
}
