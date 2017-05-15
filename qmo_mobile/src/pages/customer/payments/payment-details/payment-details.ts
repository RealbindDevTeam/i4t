import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs'
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
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
    
    @Input() totalValue      : number = 0;
    @Input() ipoComValue     : number = 0;
    @Input() ipoComBaseValue : number = 0;
    @Input() tipTotal        : number = 0;
    @Input() subTotal        : number = 0;

    private _ordersSubscription : Subscription;
    private _userLang           : string;
    private _ipoCom             : number = 0.08;
    private _tipPorcentage      : number = 0;
    private _orders             : any;

    constructor(public _translate: TranslateService,
                public _navParams: NavParams,){
        this._userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(this._userLang);
    }

    ngOnInit(){
        this._ordersSubscription  = MeteorObservable.subscribe('getOrdersByAccount', Meteor.userId()).subscribe();
        this._orders         = Orders.find({}).zone();
        this.totalValue      = this._navParams.get("total_value");
        this._tipPorcentage  = this._navParams.get("tip");
        this.tipTotal        = this.totalValue * this._tipPorcentage;
        this.subTotal        = this.totalValue - this.tipTotal;

        this.ipoComValue     = this.subTotal * this._ipoCom;
        this.ipoComBaseValue = this.subTotal - this.ipoComValue;
    }

    ngOnDestroy(){
        this._ordersSubscription.unsubscribe();
    }
}