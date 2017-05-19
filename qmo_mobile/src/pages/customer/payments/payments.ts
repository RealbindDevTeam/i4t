import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { PaymentDetailsPage } from './payment-details/payment-details'

/*
  Generated class for the Payments page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-payments',
  templateUrl: 'payments.html'
})

export class PaymentsPage implements OnInit, OnDestroy {

  private _userLang: string;
  private _currentUserId: string;
  private _orders;
  private _ordersSub: Subscription;
  private _paymethod: string = "cash";

  constructor(public _navCtrl: NavController, 
              public _navParams: NavParams, 
              public _translate: TranslateService) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);
    this._currentUserId = Meteor.userId();
  }

  ionViewDidLoad() {
  }

  ngOnInit() {
    console.log('Entra a ngOnInit ');
    this._ordersSub = MeteorObservable.subscribe('getOrdersByAccount', Meteor.userId()).subscribe(() => {
      this._orders = Orders.find({status: 'DELIVERED'}); 
    });
  }

  ngOnDestroy() { 
    console.log('Entra a ngOnDestroy');
    this._ordersSub.unsubscribe();
  }

  goToPaymentDetails(){
    this._navCtrl.push(PaymentDetailsPage, { total_value : 22200, tip : 0 });
  }

}
