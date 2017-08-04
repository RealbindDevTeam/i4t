import { Component, NgZone, ViewContainerRef, OnInit } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { UserLanguageService } from '../../shared/services/user-language.service';
import { RecoverWebComponent } from './recover-password/recover.web.component';
import { UserDetails } from '../../../../../both/collections/auth/user-detail.collection';
import { AuthClass} from './auth.class';

import template from './signin.web.component.html';
import style from './auth.component.scss';

@Component({
    selector: 'signin',
    template,
    styles: [style]
})

export class SigninWebComponent implements OnInit{

    private signinForm: FormGroup;
    private mdDialogRef: MdDialogRef<any>;
    private error: string;
    /**
     * SigninWebComponent Constructor
     * @param {Router} router 
     * @param {NgZone} zone 
     * @param {TranslateService} translate 
     * @param {ViewContainerRef} viewContainerRef 
     * @param {MdDialog} mdDialog 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor(private router: Router,
        protected zone: NgZone,
        protected translate: TranslateService,
        public viewContainerRef: ViewContainerRef,
        public mdDialog: MdDialog,
        public _userLanguageService: UserLanguageService) {

        translate.use(this._userLanguageService.getNavigationLanguage());
        translate.setDefaultLang('en');

        if (!Meteor.user()) {
            Meteor.logout();
        }
    }

    ngOnInit() {
        this.signinForm = new FormGroup({
            email: new FormControl('', [Validators.required]),
            password: new FormControl('', Validators.required)
        });
        this.error = '';
    }

    /**
     * This function login the user at the iurest system
     */
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
                                        this.router.navigate(['app/dashboard']);
                                        break;
                                    }
                                    case '200': {
                                        this.router.navigate(['app/calls']);
                                        break;
                                    }
                                    case '400': {
                                        this.router.navigate(['app/orders']);
                                        break;
                                    }
                                    case '500': {
                                        this.router.navigate(['app/chefOrders']);
                                        break;
                                    }
                                    case '600': {
                                        this.router.navigate(['app/dashboards']);
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
            this.router.navigate(['go-to-store']);
        }
    }

    /**
     * This function login the user with facebook social network
     */
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
            this.router.navigate(['go-to-store']);
        }
    }

    /**
     * This function login the user with twitter social network
     */
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
            this.router.navigate(['go-to-store']);
        }
    }

    /**
     * This function login the user with google
     */
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
            this.router.navigate(['go-to-store']);
        }
    }

    /**
     * This function insert de user data 
     */
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
            this.router.navigate(['app/orders']);
        }, (error) => {
            this.error;
        });
    }

    /**
     * This function validate de devices and return boolean
     * @return {boolean}
     */
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

    /**
     * This function opens the forgot password dialog
     */
    openDialogForgotPassword() {
        this.mdDialogRef = this.mdDialog.open(RecoverWebComponent, {
            disableClose: true,
        });
        this.mdDialogRef.afterClosed().subscribe(result => {
            this.mdDialogRef = null;
        });
    }
}