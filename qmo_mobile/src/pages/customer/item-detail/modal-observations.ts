import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';

@Component({
  templateUrl: 'modal-observations.html',
  selector: 'modal-observations'
})

export class ModalObservations {

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