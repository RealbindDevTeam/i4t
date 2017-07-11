import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs'
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';
import { Payments } from 'qmo_web/both/collections/restaurant/payment.collection';
import { Order, OrderTranslateInfo } from 'qmo_web/both/models/restaurant/order.model';
import { Additions } from 'qmo_web/both/collections/administration/addition.collection';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { Users } from 'qmo_web/both/collections/auth/user.collection';
import { GarnishFood } from 'qmo_web/both/models/administration/garnish-food.model';
import { GarnishFoodCol } from 'qmo_web/both/collections/administration/garnish-food.collection';
import { Restaurants } from 'qmo_web/both/collections/restaurant/restaurant.collection';

/*
  Generated class for the OrderDetailPayInfo Page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'order-detail-pay-info',
  templateUrl: 'order-detail-pay-info.html'
})

export class OrderDetailPayInfoPage implements OnInit, OnDestroy {

  @Input() orderId      : string
  @Input() restaurantId : string
  @Input() currency     : string
  private _ordersSubscription      : Subscription;
  private _additionsSubscription   : Subscription;
  private _garnishFoodSubscription : Subscription;
  private _restaurantSubscription  : Subscription;
  private _currencyId  : string;
  private _orders      : any;
  private _additions   : any;
  private _garnishFood : any;

  constructor(){
  }

  ngOnInit(){
    console.log(this.currency);
    this._ordersSubscription = MeteorObservable.subscribe( 'getOrderById', this.orderId ).subscribe(()=>{
      this._orders = Orders.find({_id : this.orderId});
    });
    this._additionsSubscription = MeteorObservable.subscribe( 'additionsByRestaurant', this.restaurantId ).subscribe( () => {
      this._additions = Additions.find({});
    });
    this._garnishFoodSubscription = MeteorObservable.subscribe( 'garnishFoodByRestaurant', this.restaurantId ).subscribe( () => {
      this._garnishFood = GarnishFoodCol.find({});
    });
    this._restaurantSubscription = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe( () => {
      let _lRestaurant = Restaurants.collection.find( { _id: this.restaurantId } ).fetch()[0];
      console.log(_lRestaurant);
      this._currencyId = _lRestaurant.currencyId;
    });

  }

  /**
   * Return Unit garnish food price
   * @param {GarnishFood} _pGarnishFood
   */
  getGarnisFoodUnitPrice( _pGarnishFood : GarnishFood ): number {
    return _pGarnishFood.prices.filter( g  => g.currencyId === this._currencyId )[0].price;
  }

  /**
   * Return Total Garnish Food Price
   */
  getGarnishFoodTotalPrice( _pGarnishFood: GarnishFood, _pOrderItemQuantity : number ): number {
      return _pGarnishFood.restaurants.filter( g  => g.restaurantId === this.restaurantId )[0].price * _pOrderItemQuantity;
  }

  ngOnDestroy(){
    this._ordersSubscription.unsubscribe();
    this._additionsSubscription.unsubscribe();
    this._garnishFoodSubscription.unsubscribe();
    this._restaurantSubscription.unsubscribe();
  }

}