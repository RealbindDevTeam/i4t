import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';

@Component({
  templateUrl: 'modal-colombia-payment.html'
})

export class ModalColombiaPayment {

  private _paymentMethod: string;

  constructor(public _viewCtrl: ViewController, 
              public _translate: TranslateService, 
              public _params: NavParams) {

    this._paymentMethod = this._params.get('pm');
  }

  closeNormal(){
    this._viewCtrl.dismiss();
  }

  closeObservations() {
    this._viewCtrl.dismiss(this._paymentMethod);
  }

}