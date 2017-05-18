import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs'
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';
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
    
    private _totalValue      : number = 0;
    private _ipoComValue     : number = 0;
    private _ipoComBaseValue : number = 0;
    private _tipTotal        : number = 0;
    private _subTotal        : number = 0;

    private _ordersSubscription : Subscription;
    private _userLang           : string;
    private _ipoCom             : number = 108;
    private _tipPorcentage      : number = 0;
    private _ipoComBaseString   : string;
    private _ipoComString       : string;
    private _orders             : any;

    /**
     * PaymentDetailsPage constructor
     * @param _translate 
     * @param _navParams 
     */
    constructor(public _translate: TranslateService,
                public _navParams: NavParams,){
        this._userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(this._userLang);
    }

    /**
     * ngOnInit Implementation. That allow calculate this values corresponding to Payment
     */
    ngOnInit(){
        this._ordersSubscription  = MeteorObservable.subscribe('getOrdersByAccount', Meteor.userId()).subscribe();
        this._orders         = Orders.find({}).zone();
        this._totalValue      = this._navParams.get("total_value");
        this._tipPorcentage  = this._navParams.get("tip");
        if(this._tipTotal > 0){
            this._tipTotal     = this._totalValue * this._tipPorcentage;
        }
        this._subTotal         = this._totalValue - this._tipTotal;
        this._ipoComBaseValue  = (this._subTotal * 100 ) / this._ipoCom;
        this._ipoComBaseString = (this._ipoComBaseValue).toFixed(2);
        this._ipoComValue      = this._subTotal - this._ipoComBaseValue;
        this._ipoComString     = (this._ipoComValue).toFixed(2);
    }

    /**
     * ngOnDestroy Implementation.
     */
    ngOnDestroy(){
        this._ordersSubscription.unsubscribe();
    }
}