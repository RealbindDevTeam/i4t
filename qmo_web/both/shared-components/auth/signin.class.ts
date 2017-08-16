import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Accounts } from 'meteor/accounts-base';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { User } from '../../models/auth/user.model';
import { Users } from '../../collections/auth/user.collection';
import { UserDetail } from '../../models/auth/user-detail.model';
import { UserDetails } from '../../collections/auth/user-detail.collection';

export class SigninClass implements OnInit {

    signinForm: FormGroup;
    error: string;
    userDetail: UserDetail;
    role_id: string;
    userLang: string;
    userAux: User;

    /**
     * SigninClass Constructor
     * @param {NgZone} zone 
     * @param {TranslateService} translate 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor(protected zone: NgZone,
        protected translate: TranslateService, ) {
        translate.setDefaultLang('en');
    }

    ngOnInit() {

        this.signinForm = new FormGroup({
            email: new FormControl('', [Validators.required]),
            password: new FormControl('', Validators.required)
        });

        this.error = '';
    }

    login() {
        let respLogin = this.devicesValidate();
        if (respLogin) {
            if (this.signinForm.valid) {
                Meteor.loginWithPassword(this.signinForm.value.email, this.signinForm.value.password, (err) => {
                    this.zone.run(() => {
                        if (err) {
                            this.error = err;
                        } else {
                            MeteorObservable.call('getRole').subscribe((role) => {
                                switch (role) {
                                    case '100': {
                                        this.roamWeb('app/dashboard');
                                        break;
                                    }
                                    case '200': {
                                        this.roamWeb('app/calls');
                                        break;
                                    }
                                    case '400': {
                                        this.roamWeb('app/orders');
                                        break;
                                    }
                                    case '500': {
                                        this.roamWeb('app/chefOrders');
                                        break;
                                    }
                                    case '600': {
                                        this.roamWeb('app/dashboards');
                                        break;
                                    }
                                }
                            }, (error) => {
                                this.error = err;
                            });
                        }
                    });
                });
            }
        }
        else {
            this.roamWeb('go-to-store');
        }
    }

    loginWithFacebook() {
        let respLogin = this.devicesValidate();
        if (respLogin) {
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
        else {
            this.roamWeb('go-to-store');
        }
    }

    loginWithTwiteer() {
        let respLogin = this.devicesValidate();
        if (respLogin) {
            Meteor.loginWithTwitter({ requestPermissions: [] }, (err) => {
                this.zone.run(() => {
                    if (err) {
                        this.error = err;
                    } else {
                        this.insertUserDetail();
                    }
                });
            });
        }
        else {
            this.roamWeb('go-to-store');
        }
    }

    loginWithGoogle() {
        let respLogin = this.devicesValidate();
        if (respLogin) {
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
        else {
            this.roamWeb('go-to-store');
        }
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
            this.roamWeb('app/orders');

        }, (error) => {
            this.error;
        });
    }


    roamWeb(route: string) {

    }

    devicesValidate(): boolean {

        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)) {
            return false;
        } else {
            return true
        }
    }

    ngOnDestroy() {
    }

}