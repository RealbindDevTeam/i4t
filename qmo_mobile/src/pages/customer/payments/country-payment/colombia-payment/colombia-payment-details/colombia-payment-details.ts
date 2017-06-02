import { Component, OnInit, OnDestroy } from '@angular/core';
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
  selector: 'colombia-page-payment-details',
  templateUrl: 'colombia-payment-details.html'
})

export class ColombiaPaymentDetailsPage implements OnInit, OnDestroy {
    
    private _ordersSubscription : Subscription;
    
    private _orders             : any;
    private _totalValue         : number = 0;
    private _ipoComBaseValue    : number = 0;
    private _ipoCom             : number = 108;
    private _ipoComValue        : number = 0;
    private _userLang           : string;
    private _ipoComBaseString   : string;
    private _ipoComString       : string;
    private _currency           : string;

    /**
     * ColombiaPaymentDetailsPage constructor
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
     * ngOnInit Implementation. That allow to calculate this values corresponding to Payment
     */
    ngOnInit(){
        this._ordersSubscription  = MeteorObservable.subscribe('getOrdersByAccount', Meteor.userId()).subscribe( () =>{
            MeteorObservable.autorun().subscribe(() => {
                this._currency = this._navParams.get("currency");
                
                this._totalValue = 0;
                this._orders = Orders.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED' } ).zone();
                Orders.collection.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED' } ).fetch().forEach( ( order ) => {
                    this._totalValue += order.totalPayment;
                });
                
                this._ipoComBaseValue  = (this._totalValue * 100 ) / this._ipoCom;
                this._ipoComValue      = this._totalValue - this._ipoComBaseValue;
                
                this._ipoComBaseString = (this._ipoComBaseValue).toFixed(2);
                this._ipoComString     = (this._ipoComValue).toFixed(2);
            });
        });
    }

    /**
     * ngOnDestroy Implementation.
     */
    ngOnDestroy(){
        this._ordersSubscription.unsubscribe();
    }
}