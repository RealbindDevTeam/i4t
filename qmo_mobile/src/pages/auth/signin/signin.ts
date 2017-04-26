import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ViewController, NavController, AlertController, Platform } from 'ionic-angular';
//import { OneSignal } from 'ionic-native';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from 'meteor-rxjs';
import { CustomValidators } from '../../../validators/custom-validator';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';
import { UserDevices } from 'qmo_web/both/collections/auth/device.collection';
import { Device } from 'qmo_web/both/models/auth/device.model';
import { Meteor } from 'meteor/meteor';
import { TabsPage } from '../../customer/tabs/tabs';
import { WaiterTabsPage } from '../../waiter/waiter-tabs/waiter-tabs';

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

    private _device = new Device();

    constructor(public zone: NgZone, 
                public formBuilder: FormBuilder, 
                public translate: TranslateService,
                public navCtrl: NavController, 
                public alertCtrl: AlertController, 
                public viewCtrl: ViewController,
                public _platform: Platform) {

        this.userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(this.userLang);
    }

    ionViewDidLoad() {
    }

    ngOnInit() {
        this.signinForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(40)),
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
                            //role 400 customer
                            if (role == "400") {
                                //this.addUserDevice();
                                this.navCtrl.push(TabsPage);
                            } else if ( role == "200") {
                                this.navCtrl.push(WaiterTabsPage);
                            } else {
                            }
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
            //this.router.navigate(['app/orders']);
            //this.roamWeb('app/orders');
        }, (error) => {
            this.error;
        });
    }

    sendEmailPrompt() {

        let dialog_title = this.itemNameTraduction('MOBILE.SIGNIN.FORGOT_DIALOG.TITLE');
        let dialog_subtitle = this.itemNameTraduction('MOBILE.SIGNIN.FORGOT_DIALOG.SUBTITLE');
        let dialog_cancel_btn = this.itemNameTraduction('MOBILE.SIGNIN.FORGOT_DIALOG.CANCEL');
        let dialog_send_btn = this.itemNameTraduction('MOBILE.SIGNIN.FORGOT_DIALOG.SEND');
        let dialog_confirm = this.itemNameTraduction('MOBILE.RESET_PASWORD.EMAIL_SEND');

        let prompt = this.alertCtrl.create({
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

    itemNameTraduction(itemName: string): string {
        var wordTraduced: string;
        this.translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res;
        });
        return wordTraduced;
    }


}
