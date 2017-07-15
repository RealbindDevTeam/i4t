import { Component, OnInit, OnDestroy } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';

import { InitialComponent } from '../../auth/initial/initial';
import { Invoice } from 'qmo_web/both/models/restaurant/invoice.model';
import { Invoices } from 'qmo_web/both/collections/restaurant/invoice.collection';
import { Users } from 'qmo_web/both/collections/auth/user.collection';  
import { User } from 'qmo_web/both/models/auth/user.model';
import { PaymentsHistoryDetailPage } from "./payments-history-detail/payments-history-detail";

@Component({
  selector: 'payments-history-page',
  templateUrl: 'payments-history.html'
})
export class PaymentsHistoryPage implements OnInit, OnDestroy {
  
  private _invoicesHistorySubscription : Subscription;
  private _invoices : any;
  
  /**
   * PaymentsHistoryPage constructor
   */
  constructor(public _navCtrl : NavController){
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit(){
    this._invoicesHistorySubscription = MeteorObservable.subscribe('getInvoicesByUserId', Meteor.userId()).subscribe(()=> {
      this._invoices = Invoices.find({});
    });
  }

  /**
   * This function allow go to PaymentsHistoryDetailPage component
   * @param {Invoice} _pInvoice 
   */
  goToPaymentDetail( _pInvoice : Invoice ){
    //this._navCtrl.push(PaymentsHistoryDetailPage, { restaurant : this.restId, currency : this._currencyCode, table : this.tabId });
    this._navCtrl.push(PaymentsHistoryDetailPage, { invoice : _pInvoice });
  }

  /**
   * ngOnDestroy implementation
   */
  ngOnDestroy(){
    this._invoicesHistorySubscription.unsubscribe();
  }
}