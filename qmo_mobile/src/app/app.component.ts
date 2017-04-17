import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
//import { StatusBar, Splashscreen, OneSignal } from 'ionic-native';
import { StatusBar, Splashscreen } from 'ionic-native';
import { InitialComponent } from '../pages/auth/initial/initial';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage = InitialComponent;
  constructor(public platform: Platform) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (platform.is('cordova')) {
        StatusBar.styleLightContent();
        StatusBar.backgroundColorByHexString('#D50000');
        Splashscreen.hide();
        //this.initializeApp();
      }
    });
  }
  /*
    initializeApp() {
      this.platform.ready().then(() => {
        
          OneSignal.startInit("d0d0fcd1-ed5a-4f7c-84e2-271fe9a553aa", "1005647470136");
          OneSignal.inFocusDisplaying(OneSignal.OSInFocusDisplayOption.InAppAlert);
          OneSignal.setSubscription(true);
          OneSignal.handleNotificationReceived().subscribe(() => {
          });
          OneSignal.handleNotificationOpened().subscribe(() => {
          });
          OneSignal.endInit();
      });
    }
    */
}
