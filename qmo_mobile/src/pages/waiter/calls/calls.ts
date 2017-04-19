import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from "meteor-rxjs";
import { Subscription } from "rxjs";

import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';
import { UserDetail } from 'qmo_web/both/models/auth/user-detail.model';
import { Restaurants } from 'qmo_web/both/collections/restaurant/restaurant.collection';

@Component({
  selector : 'calls-page',
  templateUrl: 'calls.html'
})
export class CallsPage implements OnInit, OnDestroy {

  private userRestaurantSubscription : Subscription;
  private _restaurants;

  private _userLang: string;

  constructor(public _translate: TranslateService) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);
  }

  ngOnInit(){
    this.userRestaurantSubscription = MeteorObservable.subscribe('getRestaurantByRestaurantWork', Meteor.userId()).subscribe(() => {
      this._restaurants = Restaurants.find({});
    });
  }

  ngOnDestroy(){
    this.userRestaurantSubscription.unsubscribe();
  }

}