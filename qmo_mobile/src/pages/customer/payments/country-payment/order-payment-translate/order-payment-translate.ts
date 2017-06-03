import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs'
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';

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

    constructor(public _navParams: NavParams){
      this._restaurantId = this._navParams.get("restaurant");
      this._tableId      = this._navParams.get("table");
      this._currency     = this._navParams.get("currency");
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

    ngOnDestroy(){
      this._ordersSubscription.unsubscribe();
    }
}