import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, ToastController, NavController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs'
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';
import { Payments } from 'qmo_web/both/collections/restaurant/payment.collection';
import { Order, OrderTranslateInfo } from 'qmo_web/both/models/restaurant/order.model';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { Users } from 'qmo_web/both/collections/auth/user.collection';

/*
  Generated class for the ColombiaPayInfoPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'colombia-pay-info',
  templateUrl: 'colombia-pay-info.html'
})

export class ColombiaPayInfoPage implements OnInit, OnDestroy {
    
  private _paymentsSubscription : Subscription;
  private _payments             : any;

  private _restaurantId         : string;
  private _tableId              : string;
  private _currency             : string;

  constructor( public _navParams : NavParams,
               public _navCtrl   : NavController ){
    this._restaurantId = this._navParams.get("restaurant");
    this._tableId      = this._navParams.get("table");
    this._currency     = this._navParams.get("currency");
  }

  ngOnInit(){
    this._paymentsSubscription = MeteorObservable.subscribe( 'getUserPaymentsByRestaurantAndTable', Meteor.userId(), this._restaurantId, this._tableId, ['PAYMENT.NO_PAID', 'PAYMENT.PAID'] ).subscribe( () => {
        this._payments = Payments.find({});
    });
  }

  ngOnDestroy(){
   this._paymentsSubscription.unsubscribe();     
  }

}