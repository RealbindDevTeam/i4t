import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs'
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { AddOrderPaymentPage } from "./add-order-payment/add-order-payment";

/*
  Generated class for the Order-Payment-Translate page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'order-payment-translate-page',
  templateUrl: 'order-payment-translate.html'
})

export class OrderPaymentTranslatePage implements OnInit, OnDestroy {
    
    private _ordersSubscription : Subscription;

    private _ordersToConfirm               : any;
    private _ordersWithPendingConfirmation : any;
    private _restaurantId    : string;
    private _tableId         : string;
    private _currency        : string;
    private _currentUserId   : string;

    constructor(public _navParams: NavParams, public _navCtrl: NavController){
      this._restaurantId = this._navParams.get("restaurant");
      this._tableId      = this._navParams.get("table");
      this._currency     = this._navParams.get("currency");
      this._currentUserId = Meteor.userId();
    }

    ngOnInit(){
      this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersWithConfirmationPending', this._restaurantId, this._tableId ).subscribe( () => {
          this._ordersToConfirm = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                  'translateInfo.firstOrderOwner': Meteor.userId(), 
                                                  'translateInfo.lastOrderOwner': { $not: '' } } ).zone();
          this._ordersWithPendingConfirmation = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                                'translateInfo.lastOrderOwner': Meteor.userId() } ).zone();
      });
    }

    ionViewWillEnter() {
      this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersWithConfirmationPending', this._restaurantId, this._tableId ).subscribe( () => {
          this._ordersToConfirm = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                  'translateInfo.firstOrderOwner': Meteor.userId(), 
                                                  'translateInfo.lastOrderOwner': { $not: '' } } ).zone();
          this._ordersWithPendingConfirmation = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                                'translateInfo.lastOrderOwner': Meteor.userId() } ).zone();
      });
    }

    goToAddOrders(){
      this._navCtrl.push(AddOrderPaymentPage, { restaurant : this._restaurantId, table : this._tableId, currency : this._currency });
    }

    ionViewWillLeave() {
      this._ordersSubscription.unsubscribe();
    }

    ngOnDestroy(){
      this._ordersSubscription.unsubscribe();
    }
}