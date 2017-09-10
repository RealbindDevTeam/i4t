import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Accounts } from 'meteor/accounts-base'
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from '../../validators/custom-validator';

export class RecoverClass {

    recoverForm: FormGroup;
    userLang: string;

    /**
     * RecoverClass Constructor
     * @param {NgZone} zone 
     * @param {TranslateService} translate 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( protected zone: NgZone, 
                 protected translate: TranslateService) {
                    let userLang = navigator.language.split('-')[0];
                    translate.setDefaultLang('en');
                    translate.use( userLang );
    }

    ngOnInit() {
        this.recoverForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(255), CustomValidators.emailValidator])
        });
    }

    recover() {
        if (this.recoverForm.valid) {
            this.zone.run(() => {
                Accounts.forgotPassword({
                    email: this.recoverForm.value.email
                }, (err) => {
                    if (err) {
                        this.showError(err);
                    } else {
                        this.showAlert('RESET_PASWORD.EMAIL_SEND');
                    }
                });
            });
        }
    }

    showAlert(message: string) { }

    showError(error: string) { }

    cancel() { }

    itemNameTraduction(itemName: string): string {
        var wordTraduced: string;
        this.translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res;
        });
        return wordTraduced;
    }

}