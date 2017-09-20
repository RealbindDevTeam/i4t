import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { App, AlertController, LoadingController, NavController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { SettingsPage } from './settings/settings';
import { PaymentsHistoryPage } from './payments-history/payments-history';
import { InitialComponent } from '../../auth/initial/initial';
import { UserProfileImage } from 'qmo_web/both/models/auth/user-profile.model';
import { Users, UserImages } from 'qmo_web/both/collections/auth/user.collection';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';

import { User } from 'qmo_web/both/models/auth/user.model';
import { UserLanguageService } from 'qmo_web/client/imports/app/shared/services/user-language.service';
import { ChangeTablePage } from './table-change/table-change';

@Component({
  selector: 'page-options',
  templateUrl: 'options.html'
})
export class OptionsPage implements OnInit, OnDestroy {

  private _userSubscription: Subscription;
  private _userImageSubscription: Subscription;
  private _userDetailSubscription: Subscription;
  private _user: User;
  private _userName: string;
  private _imageProfile: string;

  /**
   * OptionsPage constructor
   * @param _navCtrl 
   * @param _navParams 
   * @param _app 
   * @param _alertCtrl 
   * @param _loadingCtrl 
   * @param _translate 
   * @param _userLanguageService 
   */
  constructor(public _navCtrl: NavController,
    public _navParams: NavParams,
    public _app: App,
    public _alertCtrl: AlertController,
    public _loadingCtrl: LoadingController,
    private _ngZone: NgZone,
    private _translate: TranslateService,
    private _userLanguageService: UserLanguageService) {
    _translate.setDefaultLang('en');
  }

  /**
   * ngOnInit implementation
   */
  ngOnInit() {
    this.init();
  }

  /**
   * ionViewWillEnter implementation
   */
  ionViewWillEnter() {
    this.init();
  }

  init() {
    this.removeSubscriptions();
    this._translate.use(this._userLanguageService.getLanguage(Meteor.user()));

    this._userImageSubscription = MeteorObservable.subscribe('getUserImages', Meteor.userId()).subscribe();
    this._userDetailSubscription = MeteorObservable.subscribe('getUserDetailsByUser', Meteor.userId()).subscribe();

    this._userSubscription = MeteorObservable.subscribe('getUserSettings').subscribe(() => {
      this._ngZone.run(() => {
        this._user = Users.findOne({ _id: Meteor.userId() });
      });
    });
  }

  /**
   * Return user image
   */
  getUsetImage(): string {
    if (this._user && this._user.services.facebook) {
      return "http://graph.facebook.com/" + this._user.services.facebook.id + "/picture/?type=large";
    } else {
      let _lUserImage: UserProfileImage = UserImages.findOne({ userId: Meteor.userId() });
      if (_lUserImage) {
        return _lUserImage.url;
      }
      else {
        return 'assets/img/user_default_image.png';
      }
    }
  }

  /**
   * This method is responsible for go to settings option
   */
  goToSettings() {
    this._navCtrl = this._app.getRootNav();
    this._navCtrl.push(SettingsPage);
  }

  /**
   * This method is responsible for go to payments history option
   */
  goToPaymentsHistory() {
    this._navCtrl = this._app.getRootNav();
    this._navCtrl.push(PaymentsHistoryPage);
  }

  /**
   * This method go to change table 
   */
  goToChangeTable() {
    //this._navCtrl = this._app.getRootNav();
    let userDetail = UserDetails.findOne({ user_id: Meteor.userId() });
    this._navCtrl.push(ChangeTablePage, { res_id: userDetail.current_restaurant, table_id: userDetail.current_table });
  }

  /**
   * Function that allows show Signout comfirm dialog
   * @param { any } _call 
   */
  showComfirmSignOut(_call: any) {
    let btn_no = this.itemNameTraduction('MOBILE.SIGN_OUT.NO_BTN');
    let btn_yes = this.itemNameTraduction('MOBILE.SIGN_OUT.YES_BTN');
    let title = this.itemNameTraduction('MOBILE.SIGN_OUT.TITLE_CONFIRM');
    let content = this.itemNameTraduction('MOBILE.SIGN_OUT.CONTENT_CONFIRM');

    let prompt = this._alertCtrl.create({
      title: title,
      message: content,
      buttons: [
        {
          text: btn_no,
          handler: data => {
          }
        },
        {
          text: btn_yes,
          handler: data => {
            this.signOut();
          }
        }
      ]
    });
    prompt.present();
  }

  /**
   * User account sign out
   */
  signOut() {
    let loading_msg = this.itemNameTraduction('MOBILE.SIGN_OUT.LOADING');

    let loading = this._loadingCtrl.create({
      content: loading_msg
    });
    loading.present();
    setTimeout(() => {
      loading.dismiss();
      this._app.getRootNav().setRoot(InitialComponent);
      Meteor.logout();
    }, 1500);
  }

  /**
   * This function allow translate strings
   * @param {string} _itemName 
   */
  itemNameTraduction(_itemName: string): string {
    var wordTraduced: string;
    this._translate.get(_itemName).subscribe((res: string) => {
      wordTraduced = res;
    });
    return wordTraduced;
  }

  /**
   * ionViewWillLeave implementation
   */
  ionViewWillLeave() {
    this.removeSubscriptions();
  }

  /**
   * ngOnDestroy Implementation
   */
  ngOnDestroy() {
    this.removeSubscriptions();
  }

  /**
   * Remove all subscription
   */
  removeSubscriptions() {
    if (this._userSubscription) { this._userSubscription.unsubscribe(); }
    if (this._userImageSubscription) { this._userImageSubscription.unsubscribe(); }
    if (this._userDetailSubscription) { this._userDetailSubscription.unsubscribe(); }
  }

}
