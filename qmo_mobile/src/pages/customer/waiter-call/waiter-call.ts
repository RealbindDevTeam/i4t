import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';

/*
  Generated class for the CallWaiter page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-call-waiter',
  templateUrl: 'waiter-call.html'
})
export class WaiterCallPage {

  private _userLang : string;

  constructor(public _navCtrl: NavController, 
              public _navParams: NavParams,
              public _translate: TranslateService) {
        this._userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(this._userLang);
  }

}
