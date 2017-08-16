import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, NavParams, NavController, ToastController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from "meteor-rxjs";
import { Subscription } from "rxjs";
import { Payment } from 'qmo_web/both/models/restaurant/payment.model';
import { Payments } from 'qmo_web/both/collections/restaurant/payment.collection';
import { Currencies } from 'qmo_web/both/collections/general/currency.collection';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { Tables } from 'qmo_web/both/collections/restaurant/table.collection';
import { Users } from 'qmo_web/both/collections/auth/user.collection';
import { WaiterCallDetail } from 'qmo_web/both/models/restaurant/waiter-call-detail.model';

@Component({
  selector : 'payment-confirm-page',
  templateUrl: 'payment-confirm.html'
})
export class PaymentConfirmPage implements OnInit, OnDestroy {
  
  private _usersDetailSubscription  : Subscription;
  private _paymentsSubscription     : Subscription;
  private _ordersSubscription       : Subscription;
  private _tablesSubscription       : Subscription;
  private _currencySubscription     : Subscription;
  private _call                 : WaiterCallDetail;
  private _payments             : any;
  private _orders               : any;
  private _paymentsToPay        : any;
  private _table                : any;
  private _restauranId          : string;
  private _tableId              : string;
  private _currencyCode         : string = '';
  private _totalPayment         : number = 0;
  private _ordersTotalPay       : number = 0;

  /**
   * PaymentConfirmPage constructor
   * @param _translate 
   * @param _params 
   */
  constructor( public _translate: TranslateService,
               public _params: NavParams,
               public _alertCtrl: AlertController,
               public _loadingCtrl: LoadingController,
               public _navCtrl: NavController,
               private _toastCtrl: ToastController ) {
    this._call        = this._params.get('call');
    this._restauranId = this._call.restaurant_id;
    this._tableId     = this._call.table_id;
  }

  /**
   * ngOnInti Implementation
   */
  ngOnInit(){
    this._usersDetailSubscription = MeteorObservable.subscribe('getUsers').subscribe();
    this._tablesSubscription = MeteorObservable.subscribe('getTablesByRestaurant', this._restauranId).subscribe();
    this._currencySubscription = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this._restauranId ] ).subscribe();

    this._ordersSubscription = MeteorObservable.subscribe('getOrdersByTableId',this._restauranId, this._tableId, ['ORDER_STATUS.DELIVERED']).subscribe(()=>{
      this._orders = Orders.find({});
      this._orders.subscribe(()=>{
        this.totalOrders();
      });
    });

    this._paymentsSubscription = MeteorObservable.subscribe('getPaymentsToWaiter', this._restauranId, this._tableId).subscribe(()=>{
      this._payments = Payments.find({restaurantId : this._restauranId, tableId : this._tableId});
      this._paymentsToPay = Payments.collection.find( { restaurantId : this._restauranId, 
                                                        tableId : this._tableId, 
                                                        status: 'PAYMENT.NO_PAID', 
                                                        received : true } );
      
      this._payments.subscribe(()=>{
        this.totalPayment();
      });
    });

    this._table = Tables.collection.find({_id : this._tableId}).fetch()[0];
  }

  /**
   * Calculate the Orders total correspondly to table
   */
  totalOrders(){
    this._ordersTotalPay = 0;
    Orders.collection.find({}).fetch().forEach((order)=>{
      this._ordersTotalPay += order.totalPayment;
    });
  }

  /**
   * This function allow get currency code
   * @param { string } _currencyId 
   */
  getCurrency ( _currencyId : string ) : string {
    if(_currencyId){
      let _currency = Currencies.findOne({_id : _currencyId});
      return _currency.code;
    } else {
      return "Hola";
    }
  }

  /**
   * Calculate the payment total
   */
  totalPayment(){
    this._totalPayment = 0;
    Payments.find({restaurantId : this._restauranId, tableId : this._tableId}).fetch().forEach((pay)=>{
      this._totalPayment += pay.totalToPayment;
    });
  }

  /**
   * This function allow get user name
   * @param _id 
   */
  getUserDetail (_id : string) {
    let user = Users.collection.find({ _id : _id }).fetch()[0];
    if(user.username){
      return user.username;
    } else if (user.services.facebook){
      return user.services.facebook.name;
    }
  }

  /**
   * Validate payments received
   */
  validatePaymentsReceived(){
    if(this._paymentsToPay.count() > 0){
        this.showComfirmPay();
      } else {
        let msg = this.itemNameTraduction('MOBILE.PAYMENTS.PAY_CONFIRM_MODAL'); 
        let alert = this._alertCtrl.create({
          subTitle: msg,
          buttons: ['OK']
        });
        alert.present();
      }
  }

  /**
   * Function that allows show comfirm dialog
   */
  showComfirmPay() {
    let btn_no  = this.itemNameTraduction('MOBILE.ORDERS.NO_ANSWER'); 
    let btn_yes = this.itemNameTraduction('MOBILE.ORDERS.YES_ANSWER'); 
    let title   = this.itemNameTraduction('MOBILE.WAITER_CALL.TITLE_PROMPT'); 
    let content = this.itemNameTraduction('MOBILE.WAITER_CALL.CONTENT_PROMPT'); 

    let prompt = this._alertCtrl.create({
      title: title,
      message: content,
      buttons: [
        {
          text: btn_no,
          handler: data => {
          }
        },
        {
          text: btn_yes,
          handler: data => {
            this.closePayment();
          }
        }
      ]
    });
    prompt.present();
  }

  /**
   * Payments and Waiter call detail close
   */
  closePayment(){
    let loading_msg = this.itemNameTraduction('MOBILE.WAITER_CALL.LOADING'); 
    
    let loading = this._loadingCtrl.create({
      content: loading_msg
    });
    loading.present();

    setTimeout(() => {
      Meteor.call('closePay', this._restauranId, this._tableId, this._call);
      //Meteor.call('closeCall', this._call, Meteor.userId());
      loading.dismiss();
      this.presentToast();
    }, 1500);
    this._navCtrl.pop();
  }

  /**
   * Function that allow show a toast confirmation
   */
  presentToast() {
    let msg = this.itemNameTraduction('MOBILE.WAITER_CALL.MSG_COMFIRM'); 
    let toast = this._toastCtrl.create({
      message: msg,
      duration: 1500,
      position: 'middle'
    });

    toast.onDidDismiss(() => {
    });

    toast.present();
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
   * 
   */
  receivedAllPayments(event : any){
    Payments.find({restaurantId : this._restauranId, tableId : this._tableId}).fetch().forEach((pay)=>{
      Payments.update({ _id : pay._id }, { $set : { received : event.checked } });
    });
  }

  /**
   * Set to Payment received value
   * @param _pay 
   */
  received ( _pay : Payment ) {
    Payments.update({ _id : _pay._id }, { $set : { received : !_pay.received } });
  }


  /**
   * ngOnDestroy Implementation
   */
  ngOnDestroy(){
    this._usersDetailSubscription.unsubscribe();
    this._paymentsSubscription.unsubscribe();
    this._ordersSubscription.unsubscribe();
    this._tablesSubscription.unsubscribe();
    this._currencySubscription.unsubscribe();
  }

}