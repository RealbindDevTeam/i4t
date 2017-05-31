import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Restaurants } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';

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
  private _showInitCard      : boolean = false;
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
              public _translate: TranslateService) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit(){
    this._userDetailsSub = MeteorObservable.subscribe( 'getUserDetailsByUser', Meteor.userId() ).subscribe( () => {
      MeteorObservable.autorun().subscribe(() => {
        let _lUserDetail = UserDetails.findOne( { user_id: Meteor.userId() } );
        if( _lUserDetail.current_restaurant !== "" && _lUserDetail.current_table !== "" ){
          this._restaurantSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe( () => {
            let _lRestaurant = Restaurants.findOne( { _id: _lUserDetail.current_restaurant } );
            this._currentRestaurant = _lRestaurant;
            this._currentTable = _lUserDetail.current_table;
            this._showInitCard = false;
            this._showPaymentInfo = true;
          });
          } else {
              this._showInitCard = true;
              this._showPaymentInfo = false;
          }
      });
    });
  }

  /**
   * ionViewWillEnter Implementation
   */
  /*ionViewWillEnter() {
    this._userDetailsSub = MeteorObservable.subscribe( 'getUserDetailsByUser', Meteor.userId() ).subscribe( () => {
      MeteorObservable.autorun().subscribe(() => {
        let _lUserDetail = UserDetails.findOne( { user_id: Meteor.userId() } );
        if( _lUserDetail.current_restaurant !== "" && _lUserDetail.current_table !== "" ){
          this._restaurantSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe( () => {
            let _lRestaurant = Restaurants.findOne( { _id: _lUserDetail.current_restaurant } );
            this._currentRestaurant = _lRestaurant;
            this._currentTable = _lUserDetail.current_table;
            this._showInitCard = false;
            this._showPaymentInfo = true;
          });
          } else {
              this._showInitCard = true;
              this._showPaymentInfo = false;
          }
      });
    });
  }*/

  /**
   * ionViewWillLeave Implementation
   */
  /*ionViewWillLeave() {
      this._userDetailsSub.unsubscribe();
      this._restaurantSub.unsubscribe();
  }*/

  /**
   * ngOnDestroy Implementation
   */
  ngOnDestroy(){
      this._userDetailsSub.unsubscribe();
      this._restaurantSub.unsubscribe();
  }

}
