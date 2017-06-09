import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavParams  } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from "meteor-rxjs";
import { Subscription } from "rxjs";
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';

@Component({
  selector : 'payment-confirm-page',
  templateUrl: 'payment-confirm.html'
})
export class PaymentConfirmPage implements OnInit, OnDestroy {
  
  private _usersDetailSubscription : Subscription;
  
  private _usersDetails : any;

  private _restauranId : string;
  private _tableId     : string;

  /**
   * PaymentConfirmPage constructor
   * @param _translate 
   * @param _params 
   */
  constructor( public _translate: TranslateService,
               public _params: NavParams ) {
    this._restauranId = this._params.get('restaurant');
    this._tableId     = this._params.get('table');
  }

  /**
   * ngOnInti Implementation
   */
  ngOnInit(){
    this._usersDetailSubscription = MeteorObservable.subscribe('getUserDetailsByCurrentTable', this._restauranId, this._tableId).subscribe(() => {
      this._usersDetails = UserDetails.find({current_restaurant : this._restauranId, current_table : this._tableId});
    });
  }

  /**
   * ngOnDestroy Implementation
   */
  ngOnDestroy(){
    this._usersDetailSubscription.unsubscribe();
  }

}