import { Component } from '@angular/core';
import { AlertController, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { InitialComponent } from '../pages/auth/initial/initial';
import { HomeMenu } from '../pages/customer/home-menu/home-menu';
import { Menu } from '../pages/waiter/menu/menu';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  private rootPage : any = null;
  private _userId  : any;
  private _userLang: string;

  constructor(platform: Platform, 
              statusBar: StatusBar, 
              splashScreen: SplashScreen,
              public translate: TranslateService,
              public _alertCtrl: AlertController) {
    this._userId = Meteor.userId();
    this._userLang = navigator.language.split('-')[0];
    translate.setDefaultLang('en');
    translate.use(this._userLang);

    if(this._userId){
      MeteorObservable.call('getRole').subscribe((role) => {
        if (role == "400") {
          this.rootPage = HomeMenu;
        } else if ( role == "200") {
            MeteorObservable.call('validateRestaurantIsActive').subscribe((_restaruantActive) => {
                if(_restaruantActive){
                    MeteorObservable.call('validateUserIsActive').subscribe((active) => {
                        if(active){
                            this.rootPage = Menu;
                        } else {
                            this.rootPage = InitialComponent;
                            let contentMessage = this.itemNameTraduction("MOBILE.SIGNIN.USER_NO_ACTIVE");
                            this.showComfirm(contentMessage);
                            Meteor.logout();
                        }
                    });
                } else {
                    this.rootPage = InitialComponent;
                    let confirmMsg = this.itemNameTraduction('MOBILE.SIGNIN.RESTAURANT_NO_ACTIVE');
                    this.showComfirm(confirmMsg);
                    Meteor.logout();                    
                }
            });
        }
      });
    } else {
      this.rootPage = InitialComponent;
    }

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (platform.is('cordova')) {
        statusBar.styleDefault();
        splashScreen.hide();
      }
    });
  }

  itemNameTraduction(itemName: string): string {
    var wordTraduced: string;
    this.translate.get(itemName).subscribe((res: string) => {
        wordTraduced = res;
    });
    return wordTraduced;
  }

  /**
     * Function that allows show comfirm dialog
     * @param { any } _call 
     */
    showComfirm( _pContent : string ) {
      let okBtn   = this.itemNameTraduction('MOBILE.OK'); 
      let title   = this.itemNameTraduction('MOBILE.SYSTEM_MSG'); 
    
      let prompt = this._alertCtrl.create({
        title: title,
        message: _pContent,
        buttons: [
          {
            text: okBtn,
            handler: data => {
            }
          }
        ]
      });
      prompt.present();
  }
}

