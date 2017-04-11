import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { CustomValidators } from '../validators/custom-validator';
import { UserDetails } from '../../collections/auth/user-detail.collection';
import { UserProfile, UserProfileImage } from '../../models/auth/user-profile.model';

export class SignupClass implements OnInit {

    signupForm: FormGroup;
    error: string;
    showLoginPassword: boolean = true;
    showConfirmError: boolean = false;
    userLang: string;
    userProfile = new UserProfile();
    userProfileImage = new UserProfileImage();

    //constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder, private translate: TranslateService) {
    constructor(protected zone: NgZone, protected formBuilder: FormBuilder, protected translate: TranslateService) {
        this.userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(this.userLang);
    }

    ngOnInit() {

        this.signupForm = new FormGroup({
            username: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
            email: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(40), CustomValidators.emailValidator]),
            password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
            confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])
        });
        this.error = '';
    }

    showLoginWithPassword() {
        let respLogin = this.devicesValidate();
        if (respLogin) {
            this.showLoginPassword = false;
        }
        else {
            this.roamWeb('go-to-store');
        }
    }

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
                Accounts.createUser({
                    email: this.signupForm.value.email,
                    password: this.signupForm.value.password,
                    username: this.signupForm.value.username,
                    profile: this.userProfile
                }, (err) => {
                    this.zone.run(() => {
                        if (err) {
                            this.error = err;
                        } else {
                            UserDetails.insert({
                                user_id: Meteor.userId(),
                                role_id: '400',
                                is_active: true,
                                restaurant_work: '',
                                penalties: [],
                                current_restaurant: '',
                                current_table: ''
                            });
                            //this.router.navigate(['signin']);
                            //this.operationSuccess();
                            this.roamWeb('signin');
                        }
                    });
                });
            }

        } else {
            this.showConfirmError = true;
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

    loginWithTwitter() {
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

    operationSuccess() {

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
}