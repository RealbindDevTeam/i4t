import { Component } from '@angular/core';
import { App, AlertController, LoadingController, NavController, NavParams, ViewController } from 'ionic-angular';
import { BarcodeScanner } from 'ionic-native';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';
import { Restaurant } from 'qmo_web/both/models/restaurant/restaurant.model';
import { UserLanguageService } from 'qmo_web/client/imports/app/shared/services/user-language.service';

import { AlphanumericCodePage } from '../alphanumeric-code/alphanumeric-code';
import { SectionsPage } from '../sections/sections';

@Component({
  selector: 'page-code-type-select',
  templateUrl: 'code-type-select.html'
})
export class CodeTypeSelectPage {

  private _userLang: string;
  private _id_table: string;
  private _waitMsg: string;

  /**
   * CodeTypeSelectPage constructor
   * @param _navCtrl 
   * @param _viewCtrl 
   * @param _navParams 
   * @param _translate 
   * @param alertCtrl 
   * @param loadingCtrl 
   * @param _app 
   * @param _userLanguageService 
   */
  constructor(private _navCtrl: NavController,
              private _viewCtrl: ViewController,
              public _navParams: NavParams,
              public _translate: TranslateService,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public _app: App,
              private _userLanguageService: UserLanguageService ) {
    _translate.setDefaultLang('en');
  }

  /**
   * ngOnInit implementation
   */
  ngOnInit(){
    this._translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
  }

  goToScann() {
    BarcodeScanner.scan().then((result) => {
      this.goToSections(result.text);
    }, (err) => {
      // An error occurred
    });

    this._waitMsg = this.itemNameTraduction('MOBILE.SECTIONS.WAIT_QR');
    let loader = this.loadingCtrl.create({
      duration: 500
    });
    loader.present();
  }

  goToSections(qr_code: string) {
    MeteorObservable.call('getIdTableByQr', qr_code).subscribe((table_id: string) => {
      if (table_id) {
        this._id_table = table_id;
        this.forwardToSections(qr_code);
      } else {
        alert('Invalid table');
      }
    });
  }

  forwardToSections(qr_code: string) {
    if (this._id_table) {
      MeteorObservable.call('getRestaurantByQRCode', qr_code, Meteor.userId()).subscribe((restaurant: Restaurant) => {

        if (restaurant) {
          this._navCtrl.push(SectionsPage, { res_id: restaurant._id, table_id: this._id_table }).then(() => {
            const index = this._viewCtrl.index;
            this._navCtrl.remove(index);
          });
        } else {
          alert('Invalid table');
        }
      }, (error) => {
        alert(`Failed to get restaurant ${error}`);
      });
    }
  }

  goToAlphanumericCode() {
    this._navCtrl.push(AlphanumericCodePage);
  }

  itemNameTraduction(itemName: string): string {
    var wordTraduced: string;
    this._translate.get(itemName).subscribe((res: string) => {
      wordTraduced = res;
    });
    return wordTraduced;
  }
}
