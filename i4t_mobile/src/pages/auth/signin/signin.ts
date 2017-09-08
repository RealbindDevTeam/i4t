import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { App, ViewController, NavController, AlertController, Platform, LoadingController } from 'ionic-angular';
//import { OneSignal } from 'ionic-native';
import { TranslateService } from '@ngx-translate/core';
import { MeteorObservable } from 'meteor-rxjs';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';
import { Meteor } from 'meteor/meteor';
import { TabsPage } from '../../customer/tabs/tabs';
import { Menu } from '../../waiter/menu/menu';

/*
  Generated class for the Signin page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-signin',
    templateUrl: 'signin.html'
})
export class SigninComponent implements OnInit {

    signinForm: FormGroup;
    error: string;
    role_id: string;
    userLang: string;

    constructor(public _app : App,
                public zone: NgZone, 
                public formBuilder: FormBuilder, 
                public translate: TranslateService,
                public navCtrl: NavController, 
                public _alertCtrl: AlertController, 
                public viewCtrl: ViewController,
                public _loadingCtrl: LoadingController,
                public _platform: Platform) {

        this.userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(this.userLang);
    }

    ionViewDidLoad() {
    }

    ngOnInit() {
        this.signinForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]),
            password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])
        });

        this.error = '';
    }

    login() {
        if (this.signinForm.valid) {
            Meteor.loginWithPassword(this.signinForm.value.email, this.signinForm.value.password, (err) => {
                this.zone.run(() => {
                    if (err) {
                        this.error = err;
                    } else {
                        MeteorObservable.call('getRole').subscribe((role) => {
                            let loading_msg = this.itemNameTraduction('MOBILE.SIGN_OUT.LOADING'); 
                            
                            let loading = this._loadingCtrl.create({
                                content: loading_msg
                            });
                            loading.present();
                            setTimeout(() => {
                                loading.dismiss();
                                if (role == "400") {
                                    //role 400 customer
                                    //this.addUserDevice();
                                    this.navCtrl.push(TabsPage);
                                } else if ( role == "200") {
                                    MeteorObservable.call('validateRestaurantIsActive').subscribe((_restaruantActive) => {
                                        if(_restaruantActive){

                                            
                                            MeteorObservable.call('validateUserIsActive').subscribe((active) => {
                                                if(active){
                                                    this._app.getRootNav().setRoot(Menu);
                                                } else {
                                                    let contentMessage = this.itemNameTraduction("MOBILE.SIGNIN.USER_NO_ACTIVE");
                                                    this.showComfirm(contentMessage);
                                                }
                                            });
                                        } else {
                                            let confirmMsg = this.itemNameTraduction('MOBILE.SIGNIN.RESTAURANT_NO_ACTIVE');
                                            this.showComfirm(confirmMsg);
                                        }
                                    });
                                } else {
                                }
                            }, 1500);
                        }, (error) => {
                            this.error = err;
                        });
                    }
                });
            });
        }
    }

    loginWithFacebook() {
        Meteor.loginWithFacebook({ requestPermissions: ['public_profile', 'email'] }, (err) => {
            this.zone.run(() => {
                if (err) {
                    this.error = err;
                } else {
                    this.insertUserDetail();
                }
            });
        });
    }

    loginWithTwitter() {
        Meteor.loginWithTwitter({ requestPermissions: [] }, (err) => {
            if (err) {
                this.error = err;
            } else {
                this.insertUserDetail();
            }
        });
    }

    loginWithGoogle() {
        Meteor.loginWithGoogle({ requestPermissions: [] }, (err) => {
            this.zone.run(() => {
                if (err) {
                    this.error = err;
                } else {
                    this.insertUserDetail();
                }
            });
        });
    }

    insertUserDetail() {
        let loading_msg = this.itemNameTraduction('MOBILE.SIGN_OUT.LOADING'); 
        
        let loading = this._loadingCtrl.create({
            content: loading_msg
        });
        loading.present();
        setTimeout(() => {
            loading.dismiss();
            MeteorObservable.call('getDetailsCount').subscribe((count) => {
    
                if (count === 0) {
                    UserDetails.insert({
                        user_id: Meteor.userId(),
                        role_id: '400',
                        is_active: true,
                        restaurant_work: '',
                        penalties: [],
                        current_restaurant: '',
                        current_table: ''
                    });
                }
                this.navCtrl.push(TabsPage);
            }, (error) => {
                this.error;
            });
        }, 1500);
    }

    sendEmailPrompt() {

        let dialog_title = this.itemNameTraduction('MOBILE.SIGNIN.FORGOT_DIALOG.TITLE');
        let dialog_subtitle = this.itemNameTraduction('MOBILE.SIGNIN.FORGOT_DIALOG.SUBTITLE');
        let dialog_cancel_btn = this.itemNameTraduction('MOBILE.SIGNIN.FORGOT_DIALOG.CANCEL');
        let dialog_send_btn = this.itemNameTraduction('MOBILE.SIGNIN.FORGOT_DIALOG.SEND');
        let dialog_confirm = this.itemNameTraduction('MOBILE.RESET_PASWORD.EMAIL_SEND');

        let prompt = this._alertCtrl.create({
            title: dialog_title,
            message: dialog_subtitle,
            inputs: [
                {
                    name: 'email',
                    placeholder: ''
                },
            ],
            buttons: [
                {
                    text: dialog_cancel_btn,
                    handler: data => {
                    }
                },
                {
                    text: dialog_send_btn,
                    handler: data => {
                        Accounts.forgotPassword({
                            email: data['email']
                        }, (err) => {
                            if (err) {
                                alert(err);
                            } else {
                                alert(dialog_confirm);
                            }
                        });
                    }
                }
            ]
        });
        prompt.present();
    }

    /*addUserDevice(){
        if (this._platform.is('cordova')) {
            OneSignal.getIds().then( data => {
                MeteorObservable.call('userDevicesValidation', data).subscribe(() => {
                    
                }, (error) => {
                    this.error;
                });
            });
        }


    }*/

    /**
     * Function that allows show comfirm dialog
     * @param { any } _call 
     */
    showComfirm( _pContent : string ) {
        let okBtn   = this.itemNameTraduction('MOBILE.OK'); 
        let title   = this.itemNameTraduction('MOBILE.WAITER_CALL.TITLE_PROMPT'); 
      
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

    itemNameTraduction(itemName: string): string {
        var wordTraduced: string;
        this.translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res;
        });
        return wordTraduced;
    }


}
