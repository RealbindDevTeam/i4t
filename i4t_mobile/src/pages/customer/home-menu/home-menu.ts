import { Component, ViewChild, OnInit, OnDestroy, NgZone } from '@angular/core';
import { App, AlertController, LoadingController, Nav, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { InitialComponent } from '../../auth/initial/initial';
import { HomePage } from '../home/home';
import { SettingsPage } from '../options/settings/settings';
import { PaymentsHistoryPage } from '../options/payments-history/payments-history';
import { TabsPage } from '../tabs/tabs';
import { UserProfileImage } from 'qmo_web/both/models/auth/user-profile.model';
import { Users, UserImages } from 'qmo_web/both/collections/auth/user.collection';
import { User } from 'qmo_web/both/models/auth/user.model';
import { UserLanguageServiceProvider } from '../../../providers/user-language-service/user-language-service';

@Component({
    templateUrl: 'home-menu.html'
})
export class HomeMenu implements OnInit, OnDestroy {

    @ViewChild(Nav) nav: Nav;
    private _userSubscription: Subscription;
    private _userImageSubscription: Subscription;
    private _user: User;

    rootPage: any = HomePage;
    pages: Array<{ icon: string, title: string, component: any }>;

    /**
    * Menu constructor
    * @param _app 
    * @param platform 
    * @param splashScreen 
    * @param _alertCtrl 
    * @param _loadingCtrl 
    * @param _translate 
    */
  constructor( public _app : App,
               public platform: Platform, 
               public splashScreen: SplashScreen,
               public _alertCtrl: AlertController,
               public _loadingCtrl: LoadingController,
               private _translate: TranslateService,
               private _ngZone: NgZone,
               private _userLanguageService: UserLanguageServiceProvider ){
        _translate.setDefaultLang('en');
        this.initializeApp();
        let _lHome = this.itemNameTraduction('MOBILE.HOME-MENU.HOME');
        let _lOrder = this.itemNameTraduction('MOBILE.HOME-MENU.ORDER_RESTAURANT');
        let _lHistory = this.itemNameTraduction('MOBILE.HOME-MENU.PAYMENTS_HISTORY');
        this.pages = [
            { icon: 'home', title: _lHome, component: HomePage },
            { icon: 'restaurant', title: _lOrder, component: TabsPage },
            { icon: 'card', title: _lHistory, component: PaymentsHistoryPage }
        ];
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._translate.use(this._userLanguageService.getLanguage(Meteor.user()));
        this._userImageSubscription = MeteorObservable.subscribe( 'getUserImages', Meteor.userId() ).subscribe();
        this._userSubscription = MeteorObservable.subscribe('getUserSettings').subscribe(() => {
            this._ngZone.run(() => {
                this._user = Users.findOne({ _id: Meteor.userId() });
            });
        });
    }

    /**
     * Remove all subscription
     */
    removeSubscriptions() {
        if (this._userImageSubscription) { this._userImageSubscription.unsubscribe(); }
        if (this._userSubscription) { this._userSubscription.unsubscribe(); }
    }

    /**
     * Okay, so the platform is ready and our plugins are available.
     * Here you can do any higher level native things you might need.
     */
    initializeApp() {
        this.splashScreen.hide();
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

        let loading = this._loadingCtrl.create({ content: loading_msg });
        loading.present();
        setTimeout(() => {
            loading.dismiss();
            this._app.getRootNavs()[0].setRoot(InitialComponent);
            Meteor.logout();
        }, 1500);
    }

    /**
     * Reset the content nav to have just this page
     * we wouldn't want the back button to show in this scenario
     * @param page 
     */
    openPage(page) {
        this.nav.setRoot(page.component);
    }

    /**
     * Open Settings page
     */
    openSettings(): void {
        let _lSettings = this.itemNameTraduction('MOBILE.HOME-MENU.SETTINGS');
        let _lPage: any = { icon: 'assets/img/settings.png', title: _lSettings, component: SettingsPage };
        this.openPage(_lPage);
    }

    /**
     * Return user name
     */
    gerUserName(): string {
        if (this._user && this._user.services.facebook) {
            return this._user.services.facebook.name;
        } else {
            let _lUser: User = Users.findOne({ _id: Meteor.userId() });
            if (_lUser) {
                return _lUser.username;
            }
            else {
                return 'Iurest';
            }
        }
    }

    /**
     * Return user image
     */
    getUserImage(): string {
        if (this._user && this._user.services.facebook) {
            return "https://graph.facebook.com/" + this._user.services.facebook.id + "/picture/?type=large";
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
     * ngOnDestroy Implementation
     */
    ngOnDestroy() {
        this.removeSubscriptions();
    }
}