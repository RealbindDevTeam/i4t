import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { LoadingController, ModalController, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Currencies } from 'qmo_web/both/collections/general/currency.collection';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { WaiterCallDetails } from 'qmo_web/both/collections/restaurant/waiter-call-detail.collection';
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
  
  private _ordersSubscription         : Subscription;
  private _currencySubscription       : Subscription;
  private _restaurantsSubscription    : Subscription;
  private _waiterCallsPaySubscription : Subscription;
  
  private _orders         : any;
  private _totalValue     : number = 0;
  private _tipTotal       : number = 0;
  private _totalToPayment : number = 0;
  private _userLang       : string;
  private _currencyCode   : string;
  private _type           : string = "PAYMENT";
  private _paymentMethod  : string = "MOBILE.PAYMENTS.MODAL_TITLE";

  constructor(public _navCtrl: NavController, 
              public _navParams: NavParams, 
              public _translate: TranslateService,
              public _modalCtrl: ModalController,
              public _loadingCtrl: LoadingController) {
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

    this._restaurantsSubscription = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe();

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

    this._currencySubscription = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe( () => {
        let _lCurrency = Currencies.findOne( { _id: this.currId } );
        this._currencyCode = _lCurrency.code;
    });

    this._waiterCallsPaySubscription = MeteorObservable.subscribe('WaiterCallDetailForPayment', this.restId, this.tabId, this._type ).subscribe();
  }

  /**
   * ionViewWillEnter Implementation. Calculated the total to payment
   */
  ionViewWillEnter() {
    this._restaurantsSubscription = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe();

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

    this._currencySubscription = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe( () => {
        let _lCurrency = Currencies.findOne( { _id: this.currId } );
        this._currencyCode = _lCurrency.code;
    });

    this._waiterCallsPaySubscription = MeteorObservable.subscribe('WaiterCallDetailForPayment', this.restId, this.tabId, this._type ).subscribe();
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
   * This function validate the payment method.
   */
  pay(){
    if (!(this.tabId === "" && this.restId === "")) {
      
      if (this._paymentMethod === 'PAYMENT_METHODS.CASH' ||
          this._paymentMethod === 'PAYMENT_METHODS.CREDIT_CARD' ||
          this._paymentMethod === 'PAYMENT_METHODS.DEBIT_CARD') {
        this.waiterCallForPay();
      } else {
        console.log('Debe seleccionar el tipo de pago');
      }
    } else {
      return;
    }
  }

  /**
   * Validate the total number of Waiter Call payment by table Id to request the pay
   */
  waiterCallForPay() {
    var data : any = {
      restaurants : this.restId,
      tables : this.tabId,
      user : Meteor.userId(),
      waiter_id : "",
      status : "waiting",
      type : this._type,
    }
    let isWaiterCalls = WaiterCallDetails.collection.find({ restaurant_id : this.restId, 
                                                            table_id : this.tabId, 
                                                            type : data.type }).count();
    console.log(isWaiterCalls);
    if(isWaiterCalls == 0) {
      let loading_msg = this.itemNameTraduction('MOBILE.WAITER_CALL.LOADING'); 
    
      let loading = this._loadingCtrl.create({
        content: loading_msg
      });
      loading.present();
      setTimeout(() => {
        MeteorObservable.call('findQueueByRestaurant', data).subscribe(() => {
          loading.dismiss();
        });
      }, 1500);

    } else {
      console.log('En un momento te atenderemos en tu mesa');
    }
  }

  /**
   * This function allow translate strings
   * @param {string} _itemName 
   */
  itemNameTraduction(_itemName: string): string {
    var wordTraduced: string;
    this._translate.get(_itemName).subscribe((res: string) => {
        wordTraduced = res;
    });
    return wordTraduced;
  }

  /**
   * ionViewWillLeave Implementation. Subscription unsubscribe
   */
  ionViewWillLeave() {
    this._ordersSubscription.unsubscribe();
    this._currencySubscription.unsubscribe();
    this._restaurantsSubscription.unsubscribe();
    this._waiterCallsPaySubscription.unsubscribe();
  }

  /**
   * ngOnDestroy Implementation. Subscription unsubscribe
   */
  ngOnDestroy() { 
    this._ordersSubscription.unsubscribe();
    this._currencySubscription.unsubscribe();
    this._restaurantsSubscription.unsubscribe();
    this._waiterCallsPaySubscription.unsubscribe();
  }

}