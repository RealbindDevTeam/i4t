import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Accounts } from 'meteor/accounts-base';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Params } from "@angular/router";
import { Meteor } from 'meteor/meteor';

import { CustomValidators } from '../validators/custom-validator';

export class ResetPasswordClass {

    resetPasswordForm: FormGroup;
    userLang: string;
    tokenId: string;
    showConfirmError: boolean = false;

    /**
     * ResetPasswordClass Constructor
     * @param {NgZone} zone 
     * @param {TranslateService} translate 
     * @param {ActivatedRoute} route
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( protected zone: NgZone, 
                 protected translate: TranslateService, 
                 protected route: ActivatedRoute) {
        let userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use( userLang );
    }

    ngOnInit() {

        this.route.params.forEach((params: Params) => {
            this.tokenId = params['tk'];
        });

        this.resetPasswordForm = new FormGroup({
            password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
            confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)])
        });
    }

    resetPassword() {

        if (this.resetPasswordForm.valid) {
            if (this.resetPasswordForm.value.password == this.resetPasswordForm.value.confirmPassword) {
                Accounts.resetPassword(
                    this.tokenId,
                    this.resetPasswordForm.value.password,
                    (err) => {
                        this.zone.run(() => {
                            if (err) {
                                //this.error = err;
                                this.showError(err);
                            } else {
                                this.showAlert('RESET_PASWORD.SUCCESS');
                            }
                        });
                    });

            } else {
                this.showConfirmError = true;
            }
        }
    }

    showAlert(message: string) { }

    showError(error: string) {
        alert();
    }

    itemNameTraduction(itemName: string): string {
        var wordTraduced: string;
        this.translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res;
        });
        return wordTraduced;
    }
}