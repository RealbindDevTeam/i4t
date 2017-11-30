import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Restaurants } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';
import { UserLanguageServiceProvider } from '../../../providers/user-language-service/user-language-service';

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

  private _userDetailsSub: Subscription;
  private _restaurantSub: Subscription;
  private _currentRestaurant: any;
  private _userLang: string;
  private _currentTable: string;
  private _showPaymentInfo: boolean = false;
  private _lUserDetail: any;

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
    private _userLanguageService: UserLanguageServiceProvider,
    private _ngZone: NgZone) {
    _translate.setDefaultLang('en');
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit() {
    this._translate.use(this._userLanguageService.getLanguage(Meteor.user()));
    this.removeSubscriptions();
    this._userDetailsSub = MeteorObservable.subscribe('getUserDetailsByUser', Meteor.userId()).subscribe(() => {
      MeteorObservable.autorun().subscribe(() => {
        this._lUserDetail = UserDetails.findOne({ user_id: Meteor.userId() });
        if (this._lUserDetail) {
          this._restaurantSub = MeteorObservable.subscribe('getRestaurantByCurrentUser', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
              this.changeShowPaymentInfo();
              let restaurants = Restaurants.find({ _id: this._lUserDetail.current_restaurant }).zone();
              restaurants.subscribe(() => { this.changeShowPaymentInfo() });
            });
          });
        }
      });
    });
  }

  changeShowPaymentInfo() {
    let auxRestaurant = Restaurants.collection.find({ _id: this._lUserDetail.current_restaurant }).count();
    if (auxRestaurant > 0) {
      this._currentRestaurant = Restaurants.findOne({ _id: this._lUserDetail.current_restaurant });
      this._currentTable = this._lUserDetail.current_table;
      this._showPaymentInfo = true;
    } else {
      this._showPaymentInfo = false;
    }
  }

  /**
   * ionViewWillEnter Implementation
   */
  ionViewWillEnter() {
    this._translate.use(this._userLanguageService.getLanguage(Meteor.user()));
    //this.removeSubscriptions();
    this._userDetailsSub = MeteorObservable.subscribe('getUserDetailsByUser', Meteor.userId()).subscribe(() => {
      MeteorObservable.autorun().subscribe(() => {
        this._lUserDetail = UserDetails.findOne({ user_id: Meteor.userId() });
        if (this._lUserDetail) {
          this._restaurantSub = MeteorObservable.subscribe('getRestaurantByCurrentUser', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
              this.changeShowPaymentInfo();
              let restaurants = Restaurants.find({ _id: this._lUserDetail.current_restaurant }).zone();
              restaurants.subscribe(() => { this.changeShowPaymentInfo() });
            });
          });
        }
      });
    });
  }

  /**
   * ionViewWillLeave Implementation. Subscription unsubscribe
   */
  ionViewWillLeave() {
    this.removeSubscriptions();
  }

  /**
   * ngOnDestroy Implementation. Subscription unsubscribe
   */
  ngOnDestroy() {
    this.removeSubscriptions();
  }

  /**
   * Remove all subscriptions
   */
  removeSubscriptions(): void {
    if (this._userDetailsSub) { this._userDetailsSub.unsubscribe(); }
    if (this._restaurantSub) { this._restaurantSub.unsubscribe(); }
  }

}
