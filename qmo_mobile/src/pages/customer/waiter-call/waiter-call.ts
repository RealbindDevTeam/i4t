import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { Subscription, Subject, Observable } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';
import { WaiterCallDetails } from 'qmo_web/both/collections/restaurant/waiter-call-detail.collection';
import { WaiterCallDetail } from 'qmo_web/both/models/restaurant/waiter-call-detail.collection';

@Component({
  selector: 'page-waiter-call',
  templateUrl: 'waiter-call.html'
})
export class WaiterCallPage implements OnInit, OnDestroy {

  private _userDetailSubscription : Subscription;
  private _waiterCallDetailSubscription : Subscription;

  private _userDetail : any;
  private _userDetails : any;

  private _countDetails : number;
  private _userLang : string;
  private _userRestaurant : boolean;
  private _validatedWaterCall : boolean;

  /**
    * WaiterCallPage Constructor
    * @param { NavController } _navCtrl 
    * @param { NavParams } _navParams 
    * @param { TranslateService } _translate 
    */
  constructor(public _navCtrl: NavController, 
              public _navParams: NavParams,
              public _translate: TranslateService) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('es');
    _translate.use(this._userLang);
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit() {
    this._userDetailSubscription = MeteorObservable.subscribe('getUserDetailsByUser', Meteor.userId()).subscribe( () => {
      MeteorObservable.autorun().subscribe(() => {
        this._userDetails = UserDetails.find({ user_id: Meteor.userId() });
        this._userDetail  = UserDetails.collection.find({ user_id: Meteor.userId()}).fetch()[0];
          if (this._userDetail.current_table == "" && this._userDetail.current_restaurant == "") {
            this._userRestaurant = false;
          } else {
            this._userRestaurant = true;
          }
        });
    });
    
    this._waiterCallDetailSubscription = MeteorObservable.subscribe('countWaiterCallDetailByUsrId', Meteor.userId()).subscribe( () => {
      MeteorObservable.autorun().subscribe(() => {
        if (this._userRestaurant) {
          this._countDetails = WaiterCallDetails.collection.find({user_id : Meteor.userId(), restaurant_id: this._userDetail.current_restaurant, status : { $in : ["waiting", "completed"] }}).count();
          if ( this._countDetails > 0 ){
            this._validatedWaterCall = true;
          } else {
            this._validatedWaterCall = false;
          }
        }
      });
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
        waiter_id : ""
      }
      Meteor.call('waiterCall', false, data);
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
