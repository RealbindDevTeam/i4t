import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { GarnishFoodCol } from 'qmo_web/both/collections/administration/garnish-food.collection';

@Component({
    selector: 'garnish-food-send-order-component',
    templateUrl: 'garnish-food.html'
})

export class GarnishSendOrderComponent implements OnInit, OnDestroy {

  @Input() garnish : string;
  
  private _garnishFoodSubscription : Subscription;
  private _garnishFood             : any;
  
  /**
   * GarnishSendOrderComponent constructor
   */
  constructor(){
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit(){
    this.removeSubscriptions();
    this._garnishFoodSubscription = MeteorObservable.subscribe( 'garnishFoodById', this.garnish ).subscribe( () => {
        this._garnishFood = GarnishFoodCol.find({});
    });
  }

  /**
   * ngOnDestroy Implementation
   */
  ngOnDestroy(){
    this.removeSubscriptions();
  }

  /**
   * Remove all subscriptions
   */
  removeSubscriptions():void{
    if( this._garnishFoodSubscription ){ this._garnishFoodSubscription.unsubscribe(); }
  }
}