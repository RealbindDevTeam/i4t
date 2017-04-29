import { Component, ViewContainerRef, OnInit, OnDestroy, AfterContentInit, NgZone } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Subscription, Subject, Observable } from 'rxjs';
import { Job, JobCollection } from 'meteor/vsivsi:job-collection';
import { Restaurants } from "../../../../../../both/collections/restaurant/restaurant.collection";
import { UserDetail } from '../../../../../../both/models/auth/user-detail.model';
import { UserDetails } from '../../../../../../both/collections/auth/user-detail.collection';
import { WaiterCallDetails } from '../../../../../../both/collections/restaurant/waiter-call-detail.collection';

import template from './waiter-call.component.html';
import style from './waiter-call.component.scss';

@Component({
    selector: 'waiter-call',
    template,
    styles: [ style ]
})
export class WaiterCallComponent implements OnInit, OnDestroy {

  private _userDetailSubscription       : Subscription;
  private _waiterCallDetailSubscription : Subscription;

  private _restaurants      : any;
  private _userDetail       : any;
  private _userDetails      : any;
  private _waiterCallDetail : any;

  private _countDetails       : number;
  private _userRestaurant     : boolean;
  private _validatedWaterCall : boolean;

  /**
   * WaiterCallPage Constructor
   * @param { TranslateService } _translate 
   * @param { ViewContainerRef } _viewContainerRef 
   */
  constructor (protected _translate: TranslateService, 
               public _viewContainerRef: ViewContainerRef,
               private _ngZone: NgZone) {
    var _userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(_userLang);
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit() {
    this._userDetailSubscription = MeteorObservable.subscribe('getUserDetailsByUser', Meteor.userId()).subscribe();
    this._waiterCallDetailSubscription = MeteorObservable.subscribe('countWaiterCallDetailByUsrId', Meteor.userId()).subscribe();

    MeteorObservable.autorun().subscribe(() => {
      this._userDetails = UserDetails.find({ user_id: Meteor.userId() });
      this._userDetail  = UserDetails.collection.findOne({ user_id: Meteor.userId()});
      if(this._userDetail){
        if (this._userDetail.current_table == "" && this._userDetail.current_restaurant == "") {
          this._userRestaurant = false;
        } else {
          this._userRestaurant = true;
        }
        if ( this._userRestaurant ) {
          this._countDetails = WaiterCallDetails.collection.find({user_id : Meteor.userId(), restaurant_id: this._userDetail.current_restaurant, status : { $in : ["waiting", "completed"] }}).count();
          if ( this._countDetails > 0 ){
            this._validatedWaterCall = true;
          } else {
            this._validatedWaterCall = false;
          }
        }
      }
    });


  }

  /**
   * Function that allows add calls to waiters enabled
   */
  addWaiterCall(){
    if (this._userDetail.current_table == "" && this._userDetail.current_restaurant == "") {
      return;
    } else {
        var restaurant_id = this._userDetail.current_restaurant;
        var table_id = this._userDetail.current_table;
        var usrId = Meteor.userId();

        var data : any = {
          restaurants : restaurant_id,
          tables : table_id,
          user : usrId,
          waiter_id : "",
          status : "waiting"
        }
        /*
        Meteor.call('waiterCall', false, data);
        */
        Meteor.call('findQueueByRestaurant', restaurant_id, data);
    }
  }

  /**
   * ngOnDestroy implementation
   */
  ngOnDestroy(){
    this._waiterCallDetailSubscription.unsubscribe();
    this._userDetailSubscription.unsubscribe();
  }

}