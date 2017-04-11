import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';

/*
  Generated class for the ItemEdit page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-item-edit',
  templateUrl: 'item-edit.html'
})
export class ItemEditPage implements OnInit, OnDestroy {

  private _userLang: string;
  private _item_code: string = '';
  private _res_code: string = '';
  private _table_code: string = '';

  constructor(public _navCtrl: NavController, public _navParams: NavParams, public _translate: TranslateService) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);
  }

  ionViewDidLoad() {
  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }
}
