import { Component, ViewChild } from '@angular/core';
import { App, AlertController, LoadingController, Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InitialComponent } from '../../auth/initial/initial';
import { CallsPage } from '../calls/calls';
import { SettingsPage } from '../../customer/options/settings/settings';

@Component({
  templateUrl: 'menu.html'
})
export class Menu {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = CallsPage;

  pages: Array<{icon: string, title: string, component: any}>;

  private _user : any;

   /**
    * Menu constructor
    * @param _app 
    * @param platform 
    * @param statusBar 
    * @param splashScreen 
    * @param _alertCtrl 
    * @param _loadingCtrl 
    * @param _translate 
    */
  constructor( public _app : App,
               public platform: Platform, 
               public statusBar: StatusBar, 
               public splashScreen: SplashScreen,
               public _alertCtrl: AlertController,
               public _loadingCtrl: LoadingController,
               private _translate: TranslateService) {
    this.initializeApp();
    this._user = Meteor.user();

    this.pages = [
      { icon: 'home', title: 'MOBILE.WAITER_OPTIONS.CALLS', component: CallsPage },
      { icon: 'settings',title: 'MOBILE.WAITER_OPTIONS.SETTINGS', component: SettingsPage }
    ];

  }

  /**
   * Okay, so the platform is ready and our plugins are available.
   * Here you can do any higher level native things you might need.
   */
  initializeApp() {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
  }

  /**
   * Function that allows show Signout comfirm dialog
   * @param { any } _call 
   */
  showComfirmSignOut( _call : any) {
    let btn_no  = this.itemNameTraduction('MOBILE.SIGN_OUT.NO_BTN'); 
    let btn_yes = this.itemNameTraduction('MOBILE.SIGN_OUT.YES_BTN'); 
    let title   = this.itemNameTraduction('MOBILE.SIGN_OUT.TITLE_CONFIRM'); 
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
  signOut(){
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
   * 
   * Reset the content nav to have just this page
   * we wouldn't want the back button to show in this scenario
   * @param page 
   */
  openPage(page) {
    this.nav.setRoot(page.component);
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
}
