import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Payment } from 'qmo_web/both/models/restaurant/payment.model';
import { Order } from 'qmo_web/both/models/restaurant/order.model';
import { UserDetail } from 'qmo_web/both/models/auth/user-detail.model';
import { Users } from 'qmo_web/both/collections/auth/user.collection';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';

@Component({
    selector: 'payment-detail-confirm',
    templateUrl: 'payment-detail-confirm.html'
})

export class PaymentDetailConfirmComponent implements OnInit, OnDestroy {

  @Input() orderId           : string;
  //private _userSubscription  : Subscription;
  private _orderSubscription : Subscription;
  private _users             : any;
  private _orders            : any;
  private _orderIndex        : number = -1;

  /**
   * PaymentDetailConfirmComponent constructor
   */
  constructor(){
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit(){
    this._orderSubscription = MeteorObservable.subscribe('getOrderById', this.orderId).subscribe(()=>{
      this._orders = Orders.find({ _id: this.orderId });
    });
  }

  /**
   * Allow view div correspondly to order detail
   * @param i 
   */
  showDetail(i) {
    if (this._orderIndex == i) {
      this._orderIndex = -1;
    } else {
      this._orderIndex = i;
    }
  }

  /**
   * ngOnDestroy Implementation
   */
  ngOnDestroy(){
    //this._userSubscription.unsubscribe();
    this._orderSubscription.unsubscribe();
  }

}