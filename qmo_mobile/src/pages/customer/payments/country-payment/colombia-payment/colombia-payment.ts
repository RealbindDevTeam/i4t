import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Currencies } from 'qmo_web/both/collections/general/currency.collection';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { Restaurants } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { ColombiaPaymentDetailsPage } from "./colombia-payment-details/colombia-payment-details";

/*
  Generated class for the Colombia Payments page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'component-colombia-payments',
  templateUrl: 'colombia-payment.html'
})

export class ColombiaPaymentsPage implements OnInit, OnDestroy {

  @Input() restId             : string;
  @Input() currId             : string;
  @Input() tabId              : string;
  
  private _ordersSubscription : Subscription;
  private _currencySub        : Subscription;
  private _restaurantsSub     : Subscription;
  
  private _orders             : any;
  private _totalValue         : number = 0;
  private _tipTotal           : number = 0;
  private _ipoCom             : number = 108;
  private _ipoComValue        : number = 0;
  private _ipoComBaseValue    : number = 0;
  private _totalToPayment     : number = 0;
  private _userLang           : string;
  private _currentUserId      : string;
  private _ipoComBaseString   : string;
  private _ipoComString       : string;
  private _tipTotalString     : string;
  private _currencyCode       : string;
  private _tipValue           : string;

  constructor(public _navCtrl: NavController, 
              public _navParams: NavParams, 
              public _translate: TranslateService) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);
  }

  ionViewDidLoad() {
  }

  /**
   * ngOnInit Implementation. Calculated the total to payment
   */
  ngOnInit() {
    this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersByAccount', Meteor.userId() ).subscribe( () => {
      MeteorObservable.autorun().subscribe(() => {
        this._orders = Orders.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED' } ).zone();
        Orders.collection.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED' } ).fetch().forEach( ( order ) => {
          this._totalValue += order.totalPayment;
        });

        this._restaurantsSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe( () => {
          let _lRestaurant   = Restaurants.findOne( { _id: this.restId } );
          if( _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ] > 0 ){
              this._tipValue = _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ];
              this._tipTotal = this._totalValue * ( _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ] / 100 );
          }
          this._totalToPayment   = this._totalValue + this._tipTotal;
        });
      });
    });

    this._currencySub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe( () => {
        let _lCurrency = Currencies.findOne( { _id: this.currId } );
        this._currencyCode = _lCurrency.code;
    });
  }

  ionViewWillEnter() {
    this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersByAccount', Meteor.userId() ).subscribe( () => {
      MeteorObservable.autorun().subscribe(() => {
        this._orders = Orders.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED' } ).zone();
        Orders.collection.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED' } ).fetch().forEach( ( order ) => {
          this._totalValue += order.totalPayment;
        });

        this._restaurantsSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe( () => {
          let _lRestaurant   = Restaurants.findOne( { _id: this.restId } );
          if( _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ] > 0 ){
              this._tipValue = _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ];
              this._tipTotal = this._totalValue * ( _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ] / 100 );
          }
          this._totalToPayment   = this._totalValue + this._tipTotal;
        });
      });
    });

    this._currencySub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe( () => {
        let _lCurrency = Currencies.findOne( { _id: this.currId } );
        this._currencyCode = _lCurrency.code;
    });
  }

  ionViewWillLeave() {
    this._ordersSubscription.unsubscribe();
    this._currencySub.unsubscribe();
    this._restaurantsSub.unsubscribe();
  }

  /**
   * ngOnDestroy Implementation. Subscription unsubscribe
   */
  ngOnDestroy() { 
    this._ordersSubscription.unsubscribe();
    this._currencySub.unsubscribe();
    this._restaurantsSub.unsubscribe();
  }

  goToPaymentDetails(){
    this._navCtrl.push(ColombiaPaymentDetailsPage, { total : this._totalValue,
                                                     tip : this._tipValue,
                                                     currency : this._currencyCode });
  }

}