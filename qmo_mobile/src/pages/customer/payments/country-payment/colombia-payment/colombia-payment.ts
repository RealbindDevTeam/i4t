import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Currencies } from 'qmo_web/both/collections/general/currency.collection';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { WaiterCallDetails } from 'qmo_web/both/collections/restaurant/waiter-call-detail.collection';
import { Payments } from 'qmo_web/both/collections/restaurant/payment.collection';
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
  private _paymentSubscription        : Subscription;
  
  private _orders         : any;
  private _payments       : any;
  private _totalValue     : number = 0;
  private _tipTotal       : number = 0;
  private _tipSuggested   : number = 0;
  private _tipOtherTotal  : number = 0;
  private _totalToPayment : number = 0;
  private _userLang       : string;
  private _currencyCode   : string;
  private _type           : string = "PAYMENT";
  private _paymentMethod  : string = "MOBILE.PAYMENTS.PAYMENT_METHOD";
  private _paymentCreated : boolean = false;

  constructor(public _navCtrl     : NavController, 
              public _navParams   : NavParams, 
              public _translate   : TranslateService,
              public _modalCtrl   : ModalController,
              public _loadingCtrl : LoadingController,
              public _alertCtrl   : AlertController) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);
    
  }

  /**
   * ngOnInit Implementation. Calculated the total to payment
   */
  ngOnInit() {

    this._restaurantsSubscription = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe();

    this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersByAccount', Meteor.userId() ).subscribe( () => {
        this._orders = Orders.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED', toPay : { $ne : true } } ).zone();
        this._orders.subscribe(()=>{
          this._totalValue = 0;
          Orders.collection.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED', toPay : { $ne : true } } ).fetch().forEach( ( order ) => {
            this._totalValue += order.totalPayment;
          });
          this._totalToPayment = this._totalValue;
        });
    });

    this._currencySubscription = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe( () => {
        let _lCurrency = Currencies.findOne( { _id: this.currId } );
        this._currencyCode = _lCurrency.code;
    });

    this._waiterCallsPaySubscription = MeteorObservable.subscribe('WaiterCallDetailForPayment', this.restId, this.tabId, this._type ).subscribe();

    this._paymentSubscription = MeteorObservable.subscribe('getUserPaymentsByRestaurantAndTable', Meteor.userId(), this.restId, this.tabId).subscribe( ()=>{
      this._payments = Payments.find({});
      this._payments.subscribe(() =>{
        let _lPayments: number = Payments.collection.find( { status: 'PAYMENT.NO_PAID' } ).count();
        _lPayments > 0 ? this._paymentCreated = true : this._paymentCreated = false;
      });
    });
  }

  /**
   * ionViewWillEnter Implementation. Calculated the total to payment
   */
  ionViewWillEnter() {
    this._restaurantsSubscription = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe();

    this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersByAccount', Meteor.userId() ).subscribe( () => {
        this._orders = Orders.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED', toPay : { $ne : true } } ).zone();
        this._orders.subscribe(()=>{
          this._totalValue = 0;
          Orders.collection.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED', toPay : { $ne : true } } ).fetch().forEach( ( order ) => {
            this._totalValue += order.totalPayment;
          });
          this._totalToPayment = this._totalValue;
        });
    });

    this._currencySubscription = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe( () => {
        let _lCurrency = Currencies.findOne( { _id: this.currId } );
        this._currencyCode = _lCurrency.code;
    });

    this._waiterCallsPaySubscription = MeteorObservable.subscribe('WaiterCallDetailForPayment', this.restId, this.tabId, this._type ).subscribe();
    
    this._paymentSubscription = MeteorObservable.subscribe('getUserPaymentsByRestaurantAndTable', Meteor.userId(), this.restId, this.tabId).subscribe( ()=>{
      this._payments = Payments.find({});
      this._payments.subscribe(() =>{
        let _lPayments: number = Payments.collection.find( { status: 'PAYMENT.NO_PAID' } ).count();
        _lPayments > 0 ? this._paymentCreated = true : this._paymentCreated = false;
      });
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
    modal = this._modalCtrl.create( ModalColombiaPayment, { tip : this._tipSuggested,
                                                            other_tip : this._tipOtherTotal,
                                                            value : this._totalValue,
                                                            currency : this._currencyCode,
                                                            payment_method : this._paymentMethod });
    modal.onDidDismiss(data => {
      if ((typeof data != "undefined" || data != null)) {
        this._tipSuggested   = data.tip;
        this._tipOtherTotal  = data.other_tip;
        this._paymentMethod  = data.payment;
        this._tipTotal       = Number.parseInt(this._tipSuggested.toString()) + Number.parseInt(this._tipOtherTotal.toString());
        this._totalToPayment = Number.parseInt(this._totalValue.toString()) + Number.parseInt(this._tipTotal.toString());
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
        
        let _lOrdersWithPendingConfim : number = Orders.collection.find( { creation_user: Meteor.userId(), restaurantId: this.restId, tableId: this.tabId, status: 'ORDER_STATUS.PENDING_CONFIRM' } ).count();
        
        if( _lOrdersWithPendingConfim === 0 ) {

            let loading_msg = this.itemNameTraduction('MOBILE.WAITER_CALL.LOADING'); 
            let _lOrdersToInsert  : string[] = [];
            let _lPaymentMethodId : string = '0';
            let _totalToPaymentPartial : number = 0;
            let _totalValuePartial : number = 0;
    
            let loading = this._loadingCtrl.create({
              content: loading_msg
            });

            loading.present();
            setTimeout(() => {
              switch(this._paymentMethod) {
                case 'PAYMENT_METHODS.CASH' :{
                  _lPaymentMethodId = '10';
                  break;
                }
                case 'PAYMENT_METHODS.CREDIT_CARD' :{
                  _lPaymentMethodId = '20';
                  break;
                }
                default :
                  _lPaymentMethodId = '30';
                  break;
              }
              _totalToPaymentPartial = this._totalToPayment;
              _totalValuePartial     = this._totalValue;

              Orders.collection.find( { creation_user: Meteor.userId(), restaurantId: this.restId, 
                                        tableId: this.tabId, status: 'ORDER_STATUS.DELIVERED' } ).fetch().forEach( ( order ) => {
                                          _lOrdersToInsert.push( order._id );
                                          Orders.update({_id : order._id},{ $set : { toPay : true }});
                                        });

              Payments.insert( {
                  creation_user : Meteor.userId(),
                  creation_date : new Date(),
                  modification_user : '-',
                  modification_date : new Date(),
                  restaurantId : this.restId,
                  tableId : this.tabId,
                  userId : Meteor.userId(),
                  orders : _lOrdersToInsert,
                  paymentMethodId : _lPaymentMethodId,
                  totalOrdersPrice : _totalValuePartial,
                  totalTip : this._tipTotal,
                  totalToPayment : _totalToPaymentPartial,
                  currencyId : this.currId,
                  status : 'PAYMENT.NO_PAID',
                  received : false,
              });
            this.waiterCallForPay();
            loading.dismiss();
          }, 1500);
        } else {
            let title = "";
            let subTitle = this.itemNameTraduction('MOBILE.PAYMENTS.PAYMENTS_TO_BE_CONFIRM');
            this.showAlert(title, subTitle);
        } 
      } else {
        let title = "";
        let subTitle = this.itemNameTraduction('MOBILE.PAYMENTS.CONFIRM_PAYMENT_METHOD');
        this.showAlert(title, subTitle);
      }
    } else {
      return;
    }
  }
  
  /**
   * Allow show a alert
   * @param _title 
   * @param _subTitle 
   */
  showAlert( _title : string, _subTitle : string ) {
    let alert = this._alertCtrl.create({
      title: _title,
      subTitle: _subTitle,
      buttons: ['OK']
    });
    alert.present();
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
    let title = "";
    let subTitle = this.itemNameTraduction('MOBILE.PAYMENTS.MOMENT_ANSWER');
    
    if(isWaiterCalls == 0) {
      MeteorObservable.call('findQueueByRestaurant', data).subscribe(() => {
        this.showAlert(title, subTitle);
      });
    } else {
      this.showAlert(title, subTitle);
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