import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, NavController, ToastController  } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from "meteor-rxjs";
import { Subscription } from "rxjs";
import { Restaurants, RestaurantImages } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { Tables } from 'qmo_web/both/collections/restaurant/table.collection';
import { WaiterCallDetail } from 'qmo_web/both/models/restaurant/waiter-call-detail.model';
import { WaiterCallDetails } from 'qmo_web/both/collections/restaurant/waiter-call-detail.collection';
import { PaymentConfirmPage } from "./payment-confirm/payment-confirm";

@Component({
  selector : 'calls-page',
  templateUrl: 'calls.html'
})
export class CallsPage implements OnInit, OnDestroy {

  private _userRestaurantSubscription : Subscription;
  private _userSubscription           : Subscription;
  private _callsDetailsSubscription   : Subscription;
  private _tableSubscription          : Subscription;
  private _imgRestaurantSubscription  : Subscription;

  private _restaurants                : any;
  private _waiterCallDetail           : any;
  private _tables                     : any;
  private _waiterCallDetailCollection : any;
  private _imgRestaurant              : any;

  private _userLang : string;

  /**
    * CallsPage Constructor
    * @param { TranslateService } _translate 
    * @param { AlertController } _alertCtrl 
    * @param { LoadingController } _loadingCtrl 
    * @param { ToastController } _toastCtrl 
    */
  constructor(public _translate: TranslateService,
              public _alertCtrl: AlertController,
              public _loadingCtrl: LoadingController,
              private _toastCtrl: ToastController,
              public _navCtrl: NavController) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit(){
    this._userRestaurantSubscription = MeteorObservable.subscribe('getRestaurantByRestaurantWork', Meteor.userId()).subscribe(() => {
      this._restaurants = Restaurants.find({});
    });

    this._imgRestaurantSubscription = MeteorObservable.subscribe('restaurantImagesByRestaurantWork', Meteor.userId()).subscribe(() => {
        this._imgRestaurant = RestaurantImages.find({});
    });

    this._userSubscription = MeteorObservable.subscribe('getUserSettings').subscribe();

    this._callsDetailsSubscription = MeteorObservable.subscribe('waiterCallDetailByWaiterId', Meteor.userId()).subscribe(() => {
      this._waiterCallDetail = WaiterCallDetails.find({});
      this._waiterCallDetailCollection = WaiterCallDetails.collection.find({}).fetch()[0];
    });

    this._tableSubscription = MeteorObservable.subscribe('getTablesByRestaurantWork', Meteor.userId()).subscribe(() => {
      this._tables = Tables.find({});
    });

  }

  /**
   * Function that allows show comfirm dialog
   * @param { any } _call 
   */
  showComfirmClose( _call : any) {
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
            this.closeWaiterCall(_call);
          }
        }
      ]
    });
    prompt.present();
  }

  /**
   * Function that allows remove a job of the Waiter Calls queue
   * @param { any } _call 
   */
  closeWaiterCall( _call : WaiterCallDetail ){
    let loading_msg = this.itemNameTraduction('MOBILE.WAITER_CALL.LOADING'); 
    
    let loading = this._loadingCtrl.create({
      content: loading_msg
    });
    loading.present();
    setTimeout(() => {
      MeteorObservable.call('closeCall', _call, Meteor.userId()).subscribe(() => {
        loading.dismiss();
        this.presentToast();
      });
    }, 1500);
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

  goToPaymentConfirm( _call : WaiterCallDetail ){
    //this._navCtrl.push(OrderPaymentTranslatePage, { restaurant : this.restId, currency : this._currencyCode, table : this.tabId });
    this._navCtrl.push(PaymentConfirmPage, { restaurant : _call.restaurant_id, table : _call.table_id});
  }


  /**
   * NgOnDestroy Implementation
   */
  ngOnDestroy(){
    this._userRestaurantSubscription.unsubscribe();
    this._userSubscription.unsubscribe();
    this._callsDetailsSubscription.unsubscribe();
    this._tableSubscription.unsubscribe();
  }

}