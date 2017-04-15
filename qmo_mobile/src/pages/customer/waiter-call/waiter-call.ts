import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { Subscription, Subject, Observable } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';

@Component({
  selector: 'page-waiter-call',
  templateUrl: 'waiter-call.html'
})
export class WaiterCallPage implements OnInit, OnDestroy {

  private _userDetailSubscription : Subscription;

  private _userDetail : any;
  private _userDetails : any;

  private _userLang : string;
  private _userRestaurant : boolean;


  constructor(public _navCtrl: NavController, 
              public _navParams: NavParams,
              public _translate: TranslateService) {
        this._userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(this._userLang);
  }

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
  }

  addWaiterCall(){
      console.log('Hola mondo...');
      var div_action = document.getElementById('call_action');
      //div_action.classList.add('hover');
      if (this._userDetail.current_table == "" && this._userDetail.current_restaurant == "") {
        div_action.classList.remove('hover');
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
        div_action.classList.add('hover');
      }
      
  }

  ngOnDestroy(){
    this._userDetailSubscription.unsubscribe();
  }

}
