import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs'
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { AddOrderPaymentPage } from "./add-order-payment/add-order-payment";
import { UserLanguageService } from 'qmo_web/client/imports/app/shared/services/user-language.service';

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
    private _currentUserId   : string;

    /**
     * OrderPaymentTranslatePage constructor
     * @param _navParams 
     * @param _navCtrl 
     * @param _userLanguageService 
     * @param _translate 
     */
    constructor(public _navParams: NavParams, 
                public _navCtrl: NavController,
                private _userLanguageService: UserLanguageService,
                public _translate: TranslateService){
      _translate.setDefaultLang('en');
      this._restaurantId = this._navParams.get("restaurant");
      this._tableId      = this._navParams.get("table");
      this._currency     = this._navParams.get("currency");
      this._currentUserId = Meteor.userId();
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
      this._translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
      this.removeSubscriptions();
      this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersWithConfirmationPending', this._restaurantId, this._tableId ).subscribe( () => {
          this._ordersToConfirm = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                  'translateInfo.firstOrderOwner': Meteor.userId(), 
                                                  'translateInfo.lastOrderOwner': { $not: '' } } ).zone();
          this._ordersWithPendingConfirmation = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                                'translateInfo.lastOrderOwner': Meteor.userId() } ).zone();
      });
    }

    /**
     * ionViewWillEnter implementation
     */
    ionViewWillEnter() {
      this._translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
      this.removeSubscriptions();
      this._ordersSubscription = MeteorObservable.subscribe( 'getOrdersWithConfirmationPending', this._restaurantId, this._tableId ).subscribe( () => {
          this._ordersToConfirm = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                  'translateInfo.firstOrderOwner': Meteor.userId(), 
                                                  'translateInfo.lastOrderOwner': { $not: '' } } ).zone();
          this._ordersWithPendingConfirmation = Orders.find( { status: 'ORDER_STATUS.PENDING_CONFIRM', 
                                                                'translateInfo.lastOrderOwner': Meteor.userId() } ).zone();
      });
    }

    /**
     * Go to add orders
     */
    goToAddOrders(){
      this._navCtrl.push(AddOrderPaymentPage, { restaurant : this._restaurantId, table : this._tableId, currency : this._currency });
    }

    /**
     * ionViewWillLeave implementation
     */
    ionViewWillLeave() {
      this.removeSubscriptions();
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
      this.removeSubscriptions();
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
      if( this._ordersSubscription ){ this._ordersSubscription.unsubscribe(); }
    }
}