import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Accounts } from 'meteor/accounts-base';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { UserLanguageService } from '../../shared/services/user-language.service';
import { CustomValidators } from '../../../../../both/shared-components/validators/custom-validator';
import { UserDetails } from '../../../../../both/collections/auth/user-detail.collection';
import { UserProfile, UserProfileImage } from '../../../../../both/models/auth/user-profile.model';
import { AlertConfirmComponent } from '../../web/general/alert-confirm/alert-confirm.component';

import template from './signup.web.component.html';
import style from './auth.component.scss';

@Component({
    selector: 'signup',
    template,
    styles: [style]
})

export class SignupWebComponent implements OnInit {

    private signupForm: FormGroup;
    private showLoginPassword: boolean = true;
    private showConfirmError: boolean = false;
    private userLang: string;
    private userProfile = new UserProfile();
    private userProfileImage = new UserProfileImage();
    private _mdDialogRef: MdDialogRef<any>;
    private titleMsg: string;
    private btnCancelLbl: string;
    private btnAcceptLbl: string;

    /**
     * SignupWebComponent Constructor
     * @param {Router} router 
     * @param {NgZone} zone 
     * @param {FormBuilder} formBuilder 
     * @param {TranslateService} translate 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor(private router: Router,
        private zone: NgZone,
        private formBuilder: FormBuilder,
        private translate: TranslateService,
        private _userLanguageService: UserLanguageService,
        public _mdDialog: MdDialog) {

        translate.use(this._userLanguageService.getNavigationLanguage());
        translate.setDefaultLang('en');
        this.userLang = this._userLanguageService.getNavigationLanguage();

        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }

    ngOnInit() {
        this.signupForm = new FormGroup({
            username: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
            email: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(40), CustomValidators.emailValidator]),
            password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
            confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])
        });
    }

    /**
     * This function creates an iurest user with role customer
     */
    register() {
        if (this.signupForm.value.password == this.signupForm.value.confirmPassword) {

            this.userProfile.first_name = "";
            this.userProfile.last_name = "";
            this.userProfile.language_code = this.userLang;

            this.userProfileImage.complete = null;
            this.userProfileImage.extension = null;
            this.userProfileImage.name = null;
            this.userProfileImage.progress = null;
            this.userProfileImage.size = null;
            this.userProfileImage.store = null;
            this.userProfileImage.token = null;
            this.userProfileImage.type = null;
            this.userProfileImage.uploaded_at = null;
            this.userProfileImage.uploading = null;
            this.userProfileImage.url = null;

            this.userProfile.image = this.userProfileImage;

            if (this.signupForm.valid) {
                let confirmMsg: string;
                Accounts.createUser({
                    email: this.signupForm.value.email,
                    password: this.signupForm.value.password,
                    username: this.signupForm.value.username,
                    profile: this.userProfile
                }, (err) => {
                    this.zone.run(() => {
                        if (err) {
                            let confirmMsg: string;
                            if (err.reason === 'Username already exists.' || err.reason === 'Email already exists.') {
                                confirmMsg = 'SIGNUP.USER_EMAIL_EXISTS';
                            } else {
                                confirmMsg = 'SIGNUP.ERROR'
                            }
                            this.openDialog(this.titleMsg, '', confirmMsg, '', this.btnAcceptLbl, false);
                        } else {
                            confirmMsg = 'SIGNUP.SUCCESS'
                            UserDetails.insert({
                                user_id: Meteor.userId(),
                                role_id: '400',
                                is_active: true,
                                restaurant_work: '',
                                penalties: [],
                                current_restaurant: '',
                                current_table: ''
                            });
                            this.openDialog(this.titleMsg, '', confirmMsg, '', this.btnAcceptLbl, false);
                            this.router.navigate(['signin']);
                        }
                    });
                });
            }
        } else {
            this.showConfirmError = true;
        }
    }

    /**
     * This function creates an iurest user with facebook info
     */
    loginWithFacebook() {
        let respLogin = this.devicesValidate();
        if (respLogin) {
            Meteor.loginWithFacebook({ requestPermissions: ['public_profile', 'email'] }, (err) => {
                let error: string;
                error = 'SIGNUP.ERROR';
                this.zone.run(() => {
                    if (err) {

                        this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
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
     * This function creates an iurest user with twitter info
     */
    loginWithTwitter() {
        let respLogin = this.devicesValidate();
        if (respLogin) {
            Meteor.loginWithTwitter({ requestPermissions: [] }, (err) => {
                this.zone.run(() => {
                    if (err) {
                        //this.error = err;
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
     * This function creates an iurest user with google info
     */
    loginWithGoogle() {
        let respLogin = this.devicesValidate();
        if (respLogin) {
            Meteor.loginWithGoogle({ requestPermissions: [] }, (err) => {
                this.zone.run(() => {
                    if (err) {
                        //this.error = err;
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
            this.router.navigate(['app/orders']);
        }, (error) => {
            //this.error;
        });
    }

    /**
    * This function open de error dialog according to parameters 
    * @param {string} title
    * @param {string} subtitle
    * @param {string} content
    * @param {string} btnCancelLbl
    * @param {string} btnAcceptLbl
    * @param {boolean} showBtnCancel
    */
    openDialog(title: string, subtitle: string, content: string, btnCancelLbl: string, btnAcceptLbl: string, showBtnCancel: boolean) {

        this._mdDialogRef = this._mdDialog.open(AlertConfirmComponent, {
            disableClose: true,
            data: {
                title: title,
                subtitle: subtitle,
                content: content,
                buttonCancel: btnCancelLbl,
                buttonAccept: btnAcceptLbl,
                showBtnCancel: showBtnCancel
            }
        });

        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = result;
            if (result.success) {

            }
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
}