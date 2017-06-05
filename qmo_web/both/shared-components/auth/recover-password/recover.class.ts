import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Accounts } from 'meteor/accounts-base'
import { TranslateService } from 'ng2-translate';

import { CustomValidators } from '../../validators/custom-validator';

export class RecoverClass {

    recoverForm: FormGroup;
    userLang: string;

    constructor(protected zone: NgZone, protected translate: TranslateService) {
        this.userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(this.userLang);
    }

    ngOnInit() {
        this.recoverForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(40), CustomValidators.emailValidator])
        });
    }

    recover() {
        if (this.recoverForm.valid) {
            console.log('RECUPERAR CONTRASEÑA');
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