import { Component, OnInit, OnDestroy } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs'
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { Order } from 'qmo_web/both/models/restaurant/order.model';
/*
  Generated class for the Payment-Details page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-payment-details',
  templateUrl: 'payment-details.html'
})

export class PaymentDetailsPage implements OnInit, OnDestroy {

    //private _ordersSubscription : Subscription;
    private _orders   : any;
    private _userLang : string;
    
    constructor(public _translate: TranslateService){
        this._userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(this._userLang);
    }

    ngOnInit(){
        /*this._ordersSubscription = MeteorObservable.subscribe('').subscribe( () => {
            this._orders = Orders.collection.find({});
        });*/
        this._orders = [
            { _id : '0',
             totalPayment : '10000',
             items : []},
            { _id : '1',
              totalPayment : '10000',
              items : []},
            { _id : '2',
              totalPayment : '10000',
              items : []},
            { _id : '3',
              totalPayment : '10000',
              items : []},
        ]
    }

    ngOnDestroy(){
        //this._ordersSubscription.unsubscribe();
    }
}