import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Accounts } from 'meteor/accounts-base';
import { TranslateService } from 'ng2-translate';
import { UserLanguageService } from '../../shared/services/user-language.service';
import { CustomValidators } from '../../../../../both/shared-components/validators/custom-validator';
import { UserDetails } from '../../../../../both/collections/auth/user-detail.collection';
import { UserProfile, UserProfileImage } from '../../../../../both/models/auth/user-profile.model';
import { AuthClass } from './auth.class';

import template from './signup.web.component.html';
import style from './auth.component.scss';

@Component({
    selector: 'signup',
    template,
    styles: [style]
})

export class SignupWebComponent extends AuthClass implements OnInit {

    private signupForm: FormGroup;
    private showLoginPassword: boolean = true;
    private showConfirmError: boolean = false;
    private userProfile = new UserProfile();
    private userProfileImage = new UserProfileImage();

    /**
     * SignupWebComponent Constructor
     * @param {Router} router 
     * @param {NgZone} zone 
     * @param {FormBuilder} formBuilder 
     * @param {TranslateService} translate 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor(protected router: Router,
        protected zone: NgZone,
        protected translate: TranslateService,
        protected _userLanguageService: UserLanguageService,
        protected _mdDialog: MdDialog) {

        super(router, zone, translate, _userLanguageService, _mdDialog);
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
            this.userProfile.language_code = this.getUserLang();

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
                    username: this.transformToLower(this.signupForm.value.username),
                    email: this.transformToLower(this.signupForm.value.email),
                    password: this.signupForm.value.password,
                    profile: this.userProfile
                }, (err) => {
                    this.zone.run(() => {
                        if (err) {
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
                            Meteor.logout();
                            this.router.navigate(['signin']);
                        }
                    });
                });
            }
        } else {
            this.showConfirmError = true;
        }
    }
}