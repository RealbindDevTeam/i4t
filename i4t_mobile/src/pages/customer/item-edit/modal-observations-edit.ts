import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'modal-observations-edit.html',
  selector: 'modal-observations-edit',
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