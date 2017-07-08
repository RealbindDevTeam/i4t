import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Accounts } from 'qmo_web/both/collections/restaurant/account.collection';
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
  
  private _accountSubscription         : Subscription;
  private _ordersSubscription          : Subscription;
  private _ordersTransSubscription     : Subscription;
  private _currencySubscription        : Subscription;
  private _restaurantsSubscription     : Subscription;
  private _waiterCallsPaySubscription  : Subscription;
  private _paymentSubscription         : Subscription;
  
  private _account                       : any;
  private _orders                        : any;
  private _payments                      : any;
  private _paymentsPaid                  : any;
  private _ordersToConfirm               : any;
  private _ordersWithPendingConfirmation : any;
  private _totalValue      : number = 0;
  private _tipTotal        : number = 0;
  private _tipSuggested    : number = 0;
  private _tipOtherTotal   : number = 0;
  private _totalToPayment  : number = 0;
  private _userLang        : string;
  private _currencyCode    : string;
  private _type            : string = "PAYMENT";
  private _paymentMethod   : string = "PAYMENT_METHODS.CASH";
  private _paymentCreated           : boolean = false;
  private _ordersValidate           : boolean = false;
  private _showAlertToConfirm       : boolean = false;
  private _showAlertWithPendingConf : boolean = false;

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
    this._accountSubscription = MeteorObservable.subscribe('getAccountsByUserId', Meteor.userId()).subscribe(()=>{
      this._account = Accounts.collection.find({}).fetch()[0];
    });

    this._restaurantsSubscription = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe();

    this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersByAccount', Meteor.userId() ).subscribe( () => {
        this._orders = Orders.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED', toPay : { $ne : true } } ).zone();
        this._orders.subscribe(()=>{
          this._totalValue = 0;
          let _lOrders = Orders.collection.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED', toPay : { $ne : true } } );
          _lOrders.fetch().forEach((order)=>{
            this._totalValue += order.totalPayment;
          });
          this._totalToPayment = this._totalValue;
          
          if(_lOrders.count() <= 0){
            this._ordersValidate = false;
          } else {
            this._ordersValidate = true;
          }
        });
    });

    this._currencySubscription = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe( () => {
        let _lCurrency = Currencies.findOne( { _id: this.currId } );
        this._currencyCode = _lCurrency.code;
    });

    this._waiterCallsPaySubscription = MeteorObservable.subscribe('WaiterCallDetailForPayment', this.restId, this.tabId, this._type ).subscribe();

    this._paymentSubscription = MeteorObservable.subscribe('getUserPaymentsByRestaurantAndTable', Meteor.userId(), this.restId, this.tabId, ['PAYMENT.NO_PAID', 'PAYMENT.PAID']).subscribe( ()=>{
      this._payments = Payments.find({ status: 'PAYMENT.NO_PAID' });
      this._payments.subscribe( () => { this.validateUserPayments() } );
      this._paymentsPaid = Payments.find( { status: 'PAYMENT.PAID' } );
    });

    this._ordersTransSubscription = MeteorObservable.subscribe( 'getOrdersWithConfirmationPending', this.restId, this.tabId ).subscribe( () => {
      this._ordersToConfirm = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                            'translateInfo.firstOrderOwner': Meteor.userId(), 
                                            'translateInfo.lastOrderOwner': { $not: '' } } ).zone();
      this._ordersToConfirm.subscribe( () => { this.showAlertOrdersToConfirm(); });
      this._ordersWithPendingConfirmation = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                          'translateInfo.lastOrderOwner': Meteor.userId() } ).zone();
      this._ordersWithPendingConfirmation.subscribe( () => { this.showAlertOrdersWithPendingConfirm(); });
    });
  }

  /**
   * ionViewWillEnter Implementation. Calculated the total to payment
   */
  ionViewWillEnter() {
    this._accountSubscription = MeteorObservable.subscribe('getAccountsByUserId', Meteor.userId()).subscribe(()=>{
      this._account = Accounts.collection.find({}).fetch()[0];
    });

    this._restaurantsSubscription = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe();

    this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersByAccount', Meteor.userId() ).subscribe( () => {
        this._orders = Orders.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED', toPay : { $ne : true } } ).zone();
        this._orders.subscribe(()=>{
          this._totalValue = 0;
          let _lOrders = Orders.collection.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED', toPay : { $ne : true } } );
          _lOrders.fetch().forEach((order)=>{
            this._totalValue += order.totalPayment;
          });
          this._totalToPayment = this._totalValue;
          
          if(_lOrders.count() <= 0){
            this._ordersValidate = false;
          } else {
            this._ordersValidate = true;
          }
        });
    });

    this._currencySubscription = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restId ] ).subscribe( () => {
        let _lCurrency = Currencies.findOne( { _id: this.currId } );
        this._currencyCode = _lCurrency.code;
    });

    this._waiterCallsPaySubscription = MeteorObservable.subscribe('WaiterCallDetailForPayment', this.restId, this.tabId, this._type ).subscribe();
    
    this._paymentSubscription = MeteorObservable.subscribe('getUserPaymentsByRestaurantAndTable', Meteor.userId(), this.restId, this.tabId, ['PAYMENT.NO_PAID', 'PAYMENT.PAID']).subscribe( ()=>{
      this._payments = Payments.find({ status: 'PAYMENT.NO_PAID' });
      this._payments.subscribe( () => { this.validateUserPayments() } );
      this._paymentsPaid = Payments.find( { status: 'PAYMENT.PAID' } );
    });

    this._ordersTransSubscription = MeteorObservable.subscribe( 'getOrdersWithConfirmationPending', this.restId, this.tabId ).subscribe( () => {
      this._ordersToConfirm = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                            'translateInfo.firstOrderOwner': Meteor.userId(), 
                                            'translateInfo.lastOrderOwner': { $not: '' } } ).zone();
      this._ordersToConfirm.subscribe( () => { this.showAlertOrdersToConfirm(); });
      this._ordersWithPendingConfirmation = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                          'translateInfo.lastOrderOwner': Meteor.userId() } ).zone();
      this._ordersWithPendingConfirmation.subscribe( () => { this.showAlertOrdersWithPendingConfirm(); });
    });
  }
  
  /**
   * Allow navegate to ColombiaPaymentDetailsPage
   */
  goToPaymentDetails(){
    if(this._ordersValidate){
      this._navCtrl.push(ColombiaPaymentDetailsPage, { currency : this._currencyCode });
    }
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
        
        if( _lOrdersWithPendingConfim === 0 && this._account) {

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

              Payments.insert({
                  creation_user : Meteor.userId(),
                  creation_date : new Date(),
                  modification_user : '-',
                  modification_date : new Date(),
                  restaurantId : this.restId,
                  tableId : this.tabId,
                  accountId: this._account._id,
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
                                                            type : data.type,
                                                            status: { $in : [ 'waiting', 'completed']} }).count();
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
   * Validate User Payments
   */
  validateUserPayments():void{
      let _lPayments: number = Payments.collection.find( { status: 'PAYMENT.NO_PAID' } ).fetch().length;
      _lPayments > 0 ? this._paymentCreated = true : this._paymentCreated = false;
  }

  /**
   * Show alert with orders to confirm
   */
  showAlertOrdersToConfirm():void{
    let _lOrdersToConfirmCount: number = Orders.collection.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                                   'translateInfo.firstOrderOwner': Meteor.userId(), 
                                                                   'translateInfo.lastOrderOwner': { $not: '' } } ).fetch().length;
    if( _lOrdersToConfirmCount > 0 ){
      this._showAlertToConfirm = true;
    } else {
      this._showAlertToConfirm = false;
    }
  }

  /**
   * Show alert with orders with pending confirmation
   */
  showAlertOrdersWithPendingConfirm():void{
    let _lOrdersWithPendingConfirmationCount: number = Orders.collection.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                                                 'translateInfo.lastOrderOwner': Meteor.userId() } ).fetch().length;
    if( _lOrdersWithPendingConfirmationCount > 0 ){
      this._showAlertWithPendingConf = true;
    } else {
      this._showAlertWithPendingConf = false;
    }
  }

  /**
   * ionViewWillLeave Implementation. Subscription unsubscribe
   */
  ionViewWillLeave() {
    this._accountSubscription.unsubscribe();
    this._ordersSubscription.unsubscribe();
    this._currencySubscription.unsubscribe();
    this._restaurantsSubscription.unsubscribe();
    this._waiterCallsPaySubscription.unsubscribe();
    this._ordersTransSubscription.unsubscribe();
  }

  /**
   * ngOnDestroy Implementation. Subscription unsubscribe
   */
  ngOnDestroy() { 
    this._accountSubscription.unsubscribe();
    this._ordersSubscription.unsubscribe();
    this._currencySubscription.unsubscribe();
    this._restaurantsSubscription.unsubscribe();
    this._waiterCallsPaySubscription.unsubscribe();
    this._ordersTransSubscription.unsubscribe();
  }

}