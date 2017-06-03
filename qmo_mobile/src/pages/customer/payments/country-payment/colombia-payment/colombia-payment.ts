import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Currencies } from 'qmo_web/both/collections/general/currency.collection';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { ColombiaPaymentDetailsPage } from "./colombia-payment-details/colombia-payment-details";
import { ModalColombiaPayment } from "./modal-colombia-payment";
import { OrderPaymentTranslatePage } from "../order-payment-translate/order-payment-translate";

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
  private _totalToPayment     : number = 0;
  private _userLang           : string;
  private _currencyCode       : string;
  private _paymentMethod      : string = "MOBILE.PAYMENTS.MODAL_TITLE";

  constructor(public _navCtrl: NavController, 
              public _navParams: NavParams, 
              public _translate: TranslateService,
              public _modalCtrl: ModalController) {
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

    this._restaurantsSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe();

    this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersByAccount', Meteor.userId() ).subscribe( () => {
      MeteorObservable.autorun().subscribe(() => {
        this._totalValue = 0;
        this._orders = Orders.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED' } ).zone();
        Orders.collection.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED' } ).fetch().forEach( ( order ) => {
          this._totalValue += order.totalPayment;
        });
        this._totalToPayment = this._totalValue + this._tipTotal;
      });
    });

    this._currencySub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe( () => {
        let _lCurrency = Currencies.findOne( { _id: this.currId } );
        this._currencyCode = _lCurrency.code;
    });
  }

  /**
   * ionViewWillEnter Implementation. Calculated the total to payment
   */
  ionViewWillEnter() {
    this._restaurantsSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe();

    this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersByAccount', Meteor.userId() ).subscribe( () => {
      MeteorObservable.autorun().subscribe(() => {
        this._totalValue = 0;
        this._orders = Orders.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED' } ).zone();
        Orders.collection.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED' } ).fetch().forEach( ( order ) => {
          this._totalValue += order.totalPayment;
        });
        this._totalToPayment = this._totalValue + this._tipTotal;
      });
    });

    this._currencySub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe( () => {
        let _lCurrency = Currencies.findOne( { _id: this.currId } );
        this._currencyCode = _lCurrency.code;
    });
  }
  
  /**
   * Allow navegate to ColombiaPaymentDetailsPage
   */
  goToPaymentDetails(){
    this._navCtrl.push(ColombiaPaymentDetailsPage, { currency : this._currencyCode });
  }
  
  /**
   * Allow navegate to OrderPaymentTranslatePage
   */
  goToAddOrders(){
    this._navCtrl.push(OrderPaymentTranslatePage, { restaurant : this.restId, currency : this._currencyCode, table : this.tabId });
  }

  /**
   * This function allow open the modal for payment method selection and the tip
   */
  presentModal(){
    let modal;
    modal = this._modalCtrl.create( ModalColombiaPayment, { restaurant : this.restId,
                                                            value : this._totalValue,
                                                            currency : this._currencyCode,
                                                            payment_method : this._paymentMethod });
    modal.onDidDismiss(data => {
      if ((typeof data != "undefined" || data != null)) {
        this._tipTotal = data.tip;
        this._paymentMethod = data.payment;
        console.log(data.tip);
        console.log(data.payment);
        this._totalToPayment = this._totalValue + this._tipTotal;
      }
    });
    modal.present();
  }

  /**
   * ionViewWillLeave Implementation. Subscription unsubscribe
   */
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

}