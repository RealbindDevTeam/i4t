import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';

@Component({
  templateUrl: 'modal-observations-edit.html'
})

export class ModalObservationsEdit {

  _observations: string;

  constructor(public viewCtrl: ViewController, public _translate: TranslateService, public _params: NavParams) {

    this._observations = this._params.get('obs');
  }

  closeNormal(){
    this.viewCtrl.dismiss();
  }

  closeObservations() {
    this.viewCtrl.dismiss(this._observations);
  }

}