import { Component, OnInit, OnDestroy } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';

import { InitialComponent } from '../../auth/initial/initial';
import { Invoices } from 'qmo_web/both/collections/restaurant/invoice.collection';
import { Users } from 'qmo_web/both/collections/auth/user.collection';
import { User } from 'qmo_web/both/models/auth/user.model';

@Component({
  selector: 'payments-history-page',
  templateUrl: 'payments-history.html'
})
export class PaymentsHistoryPage implements OnInit, OnDestroy {
  
  private _invoicesHistorySubscription : Subscription;
  private _invoices : any;
  
  constructor(){
  }

  ngOnInit(){
    this._invoicesHistorySubscription = MeteorObservable.subscribe('getInvoicesByUserId', Meteor.userId()).subscribe(()=> {
      this._invoices = Invoices.find({});
    });
  }

  ngOnDestroy(){
    this._invoicesHistorySubscription.unsubscribe();
  }
}