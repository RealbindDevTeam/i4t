import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Restaurants } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';
import { UserLanguageService } from 'qmo_web/client/imports/app/shared/services/user-language.service';

/*
  Generated class for the Payments page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-payments',
  templateUrl: 'payments.html'
})

export class PaymentsPage implements OnInit, OnDestroy {

  private _userDetailsSub    : Subscription;
  private _restaurantSub     : Subscription;
  private _currentRestaurant : any;
  private _userLang          : string;
  private _currentTable      : string;
  private _showPaymentInfo   : boolean = false;

  /**
   * PaymentsPage constructor
   * 
   * @param _navCtrl 
   * @param _navParams 
   * @param _translate 
   */
  constructor(public _navCtrl: NavController, 
              public _navParams: NavParams, 
              public _translate: TranslateService,
              private _userLanguageService: UserLanguageService) {
    _translate.setDefaultLang('en');
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit(){
    this._translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );

    this._userDetailsSub = MeteorObservable.subscribe( 'getUserDetailsByUser', Meteor.userId() ).subscribe( () => {
      MeteorObservable.autorun().subscribe(() => {
        let _lUserDetail = UserDetails.findOne( { user_id: Meteor.userId() } );
        if(_lUserDetail){
          if( _lUserDetail.current_restaurant !== "" && _lUserDetail.current_table !== "" ){
            this._restaurantSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe( () => {
              let _lRestaurant = Restaurants.findOne( { _id: _lUserDetail.current_restaurant } );
              this._currentRestaurant = _lRestaurant;
              this._currentTable = _lUserDetail.current_table;
              this._showPaymentInfo = true;
            });
          } else {
              this._showPaymentInfo = false;
          }
        }
      });
    });
  }

  /**
   * ionViewWillEnter Implementation
   */
  ionViewWillEnter() {
    this._translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );

    this._userDetailsSub = MeteorObservable.subscribe( 'getUserDetailsByUser', Meteor.userId() ).subscribe( () => {
      MeteorObservable.autorun().subscribe(() => {
        let _lUserDetail = UserDetails.findOne( { user_id: Meteor.userId() } );
        if(_lUserDetail){
          if( _lUserDetail.current_restaurant !== "" && _lUserDetail.current_table !== "" ){
            this._restaurantSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe( () => {
              let _lRestaurant = Restaurants.findOne( { _id: _lUserDetail.current_restaurant } );
              this._currentRestaurant = _lRestaurant;
              this._currentTable = _lUserDetail.current_table;
              this._showPaymentInfo = true;
            });
          } else {
              this._showPaymentInfo = false;
          }
        }
      });
    });
  }

  /**
   * ionViewWillLeave Implementation. Subscription unsubscribe
   */
  ionViewWillLeave() {
      if( this._userDetailsSub ){ this._userDetailsSub.unsubscribe(); }
      if( this._restaurantSub ){ this._restaurantSub.unsubscribe(); }
  }

  /**
   * ngOnDestroy Implementation. Subscription unsubscribe
   */
  ngOnDestroy(){
    if( this._userDetailsSub ){ this._userDetailsSub.unsubscribe(); }
    if( this._restaurantSub ){ this._restaurantSub.unsubscribe(); }
  }

}
