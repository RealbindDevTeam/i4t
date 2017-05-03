import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Restaurant } from 'qmo_web/both/models/restaurant/restaurant.model';
import { SectionsPage } from '../sections/sections';

@Component({
  selector: 'page-alphanumeric-code',
  templateUrl: 'alphanumeric-code.html'
})
export class AlphanumericCodePage {

  private _userLang: string;
  private _ordersForm: FormGroup;
  private _id_table: string;
  private _error_msg: string;

  constructor(public _navCtrl: NavController, private _viewCtrl: ViewController, public _navParams: NavParams, public _translate: TranslateService, ) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);
  }

  ngOnInit() {
    this._ordersForm = new FormGroup({
      qrCode: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  /**
  * This function validate if QR Code exists
  */
  validateQRCodeExists() {
    MeteorObservable.call('getIdTableByQr', this._ordersForm.value.qrCode.toString().toUpperCase()).subscribe((table_id: string) => {
      if (table_id) {
        this._id_table = table_id;
        this.forwardToSections();
      } else {
        this._error_msg = 'Invalid code';
      }
    });
  }

  forwardToSections() {
    if (this._id_table) {
      MeteorObservable.call('getRestaurantByQRCode', this._ordersForm.value.qrCode.toString().toUpperCase(), Meteor.userId()).subscribe((restaurant: Restaurant) => {
        if (restaurant) {
          this._navCtrl.push(SectionsPage, { res_id: restaurant._id, table_id: this._id_table }).then(() => {
            const index = this._viewCtrl.index;
            const index2 = this._viewCtrl.index - 1;
            this._navCtrl.remove(index);
            this._navCtrl.remove(index2);
          });
        } else {
          alert('Invalid table');
        }
      }, (error) => {
        alert(`Failed to get Restaurant: ${error}`);
      });
    }
  }
}
