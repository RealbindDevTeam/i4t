import { Component, NgZone, ViewContainerRef, OnInit } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { RecoverWebComponent } from './recover-password/recover.web.component';
import { UserDetails } from '../../../../../both/collections/auth/user-detail.collection';
import { UserLogin } from '../../../../../both/models/auth/user-login.model';
import { AuthClass } from './auth.class';

import template from './signin.web.component.html';
import style from './auth.component.scss';

@Component({
    selector: 'signin',
    template,
    styles: [style]
})

export class SigninWebComponent extends AuthClass implements OnInit {

    private signinForm: FormGroup;
    private mdDialogRef2: MdDialogRef<any>;
    private error: string;

    /**
     * SigninWebComponent Constructor
     * @param {Router} router 
     * @param {NgZone} zone 
     * @param {TranslateService} translate 
     * @param {MdDialog} mdDialog 
     */
    constructor(protected router: Router,
        protected zone: NgZone,
        protected translate: TranslateService,
        protected _mdDialog: MdDialog) {

        super(router, zone, translate, _mdDialog);
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
                Meteor.loginWithPassword(this.transformToLower(this.signinForm.value.email), this.signinForm.value.password, (err) => {
                    let confirmMsg: string;
                    this.zone.run(() => {
                        if (err) {
                            if (err.reason === 'User not found' || err.reason === 'Incorrect password') {
                                confirmMsg = 'SIGNIN.USER_PASS_INCORRECT';
                            } else {
                                confirmMsg = 'SIGNIN.ERROR';
                            }
                            this.openDialog(this.titleMsg, '', confirmMsg, '', this.btnAcceptLbl, false);
                        } else {
                            MeteorObservable.call('getRole').subscribe((role) => {
                                switch (role) {
                                    case '100': {
                                        this.insertUserInfo();
                                        this.router.navigate(['app/dashboard']);
                                        break;
                                    }
                                    case '200': {
                                        this.validateUserIsActive('app/calls');
                                        break;
                                    }
                                    case '400': {
                                        this.insertUserInfo();
                                        this.router.navigate(['app/orders']);
                                        break;
                                    }
                                    case '500': {
                                        this.validateUserIsActive('app/chef-orders');
                                        break;
                                    }
                                    case '600': {
                                        this.validateUserIsActive('app/dashboards');
                                        break;
                                    }
                                }
                            }, (error) => {
                                confirmMsg = 'SIGNIN.ERROR';
                                this.openDialog(this.titleMsg, '', confirmMsg, '', this.btnAcceptLbl, false);
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
     * Validate user is active
     * @param _pRoute 
     */
    validateUserIsActive( _pRoute : string){
        MeteorObservable.call('validateRestaurantIsActive').subscribe((_restaruantActive) => {
            if(_restaruantActive){
                
                MeteorObservable.call('validateUserIsActive').subscribe((_active) => {
                    if(_active){
                        this.insertUserInfo();
                        this.router.navigate([_pRoute]);
                    } else {
                        let confirmMsg = 'SIGNIN.USER_NO_ACTIVE';
                        this.openDialog(this.titleMsg, '', confirmMsg, '', this.btnAcceptLbl, false);
                    }
                });
            } else {
                let confirmMsg = 'SIGNIN.RESTAURANT_NO_ACTIVE';
                this.openDialog(this.titleMsg, '', confirmMsg, '', this.btnAcceptLbl, false);
            }
        });
    }

    /**
     * Insert User Info
     */
    insertUserInfo():void{
        let _lUserLogin:UserLogin = new UserLogin();
        _lUserLogin.user_id = Meteor.userId();
        _lUserLogin.login_date = new Date();
        _lUserLogin.app_code_name = navigator.appCodeName;
        _lUserLogin.app_name = navigator.appName;
        _lUserLogin.app_version = navigator.appVersion;
        _lUserLogin.cookie_enabled = navigator.cookieEnabled;
        _lUserLogin.language = navigator.language;
        _lUserLogin.platform = navigator.platform;
        MeteorObservable.call( 'insertUserLoginInfo', _lUserLogin ).subscribe();
    }

    /**
     * This function opens the forgot password dialog
     */
    openDialogForgotPassword() {
        this.mdDialogRef2 = this._mdDialog.open(RecoverWebComponent, {
            disableClose: true,
        });
        this.mdDialogRef2.afterClosed().subscribe(result => {
            this.mdDialogRef2 = null;
        });
    }
}