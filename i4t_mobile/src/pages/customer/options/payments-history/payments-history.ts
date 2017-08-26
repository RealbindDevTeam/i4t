import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Invoice } from 'qmo_web/both/models/restaurant/invoice.model';
import { Invoices } from 'qmo_web/both/collections/restaurant/invoice.collection';
import { PaymentsHistoryDetailPage } from "./payments-history-detail/payments-history-detail";
import { UserLanguageService } from 'qmo_web/client/imports/app/shared/services/user-language.service';

@Component({
  selector: 'payments-history-page',
  templateUrl: 'payments-history.html'
})
export class PaymentsHistoryPage implements OnInit, OnDestroy {
  
  private _invoicesHistorySubscription : Subscription;
  private _invoices : any;
  
  /**
   * PaymentsHistoryPage constructor
   * @param _navCtrl 
   * @param _translate 
   * @param _userLanguageService 
   */
  constructor(public _navCtrl : NavController,
              public _translate: TranslateService,
              private _userLanguageService: UserLanguageService){
    _translate.setDefaultLang('en');
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit(){
    this._translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );

    this._invoicesHistorySubscription = MeteorObservable.subscribe('getInvoicesByUserId', Meteor.userId()).subscribe(()=> {
      this._invoices = Invoices.find({});
    });
  }

  /**
   * This function allow go to PaymentsHistoryDetailPage component
   * @param {Invoice} _pInvoice 
   */
  goToPaymentDetail( _pInvoice : Invoice ){
    this._navCtrl.push(PaymentsHistoryDetailPage, { invoice : _pInvoice });
  }

  /**
   * ngOnDestroy implementation
   */
  ngOnDestroy(){
    this._invoicesHistorySubscription.unsubscribe();
  }
}