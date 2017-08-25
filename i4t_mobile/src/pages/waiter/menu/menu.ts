import { Component, ViewChild } from '@angular/core';
import { App, Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
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
   * 
   * @param platform 
   * @param statusBar 
   * @param splashScreen 
   */
  constructor( public _app : App,
               public platform: Platform, 
               public statusBar: StatusBar, 
               public splashScreen: SplashScreen) {
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
   * User account sign out
   */
  signOut(){
    this._app.getRootNav().setRoot(InitialComponent);
    Meteor.logout();
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
}
