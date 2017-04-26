import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate';

@Component({
  selector : 'orders-to-delivery-page',
  templateUrl: 'orders-to-delivery.html'
})
export class OrdersToDeliveryPage {

  private _userLang: string;

  /**
    * OrdersToDeliveryPage Constructor
    * @param { TranslateService } _translate 
    */
  constructor(public _translate: TranslateService) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);
  }

}