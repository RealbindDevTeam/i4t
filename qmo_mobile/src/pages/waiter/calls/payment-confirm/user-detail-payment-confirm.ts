import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { UserDetail } from 'qmo_web/both/models/auth/user-detail.model';
import { User } from 'qmo_web/both/models/auth/user.model';
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

  constructor(){
  }

  ngOnInit(){
    this._userSubscription = MeteorObservable.subscribe('getUserByUserId', this.userDetail.user_id).subscribe(()=>{
      this._users = Users.find({_id : this.userDetail.user_id});
    });

    this._orderSubscription = MeteorObservable.subscribe('getOrdersByAccount', this.userDetail.user_id).subscribe(()=>{
        this._orders = Orders.find({});
    });

  }

  ngOnDestroy(){
    this._userSubscription.unsubscribe();
    this._orderSubscription.unsubscribe();
    this._userSubscription.unsubscribe();
  }

}