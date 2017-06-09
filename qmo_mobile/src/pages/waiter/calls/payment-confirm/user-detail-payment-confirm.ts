import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { UserDetail } from 'qmo_web/both/models/auth/user-detail.model';
import { Users } from 'qmo_web/both/collections/auth/user.collection';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';

@Component({
    selector: 'user-detail-payment-confirm',
    templateUrl: 'user-detail-payment-confirm.html'
})

export class UserDetailPaymentConfirmComponent implements OnInit, OnDestroy {

  @Input() userDetail        : UserDetail;
  private _userSubscription  : Subscription;
  private _orderSubscription : Subscription;
  private _users             : any;
  private _orders            : any;
  private _orderIndex        : number = -1;

  /**
   * UserDetailPaymentConfirmComponent constructor
   */
  constructor(){
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit(){
    this._userSubscription = MeteorObservable.subscribe('getUserByUserId', this.userDetail.user_id).subscribe(()=>{
      this._users = Users.find({_id : this.userDetail.user_id});
    });

    this._orderSubscription = MeteorObservable.subscribe('getOrdersByAccount', this.userDetail.user_id).subscribe(()=>{
        this._orders = Orders.find({creation_user: this.userDetail.user_id});
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
    this._userSubscription.unsubscribe();
    this._orderSubscription.unsubscribe();
    this._userSubscription.unsubscribe();
  }

}