import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Accounts } from 'meteor/accounts-base';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';

import { CustomValidators } from '../../../validators/custom-validator';

export class ChangeEmailClass {

    private _emailEditForm: FormGroup;
    private _error : string;

    constructor(private zone: NgZone, protected _translate: TranslateService) { }

    ngOnInit() {
        this._emailEditForm = new FormGroup({
          email : new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(40), CustomValidators.emailValidator]),
          password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
          new_email : new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(40), CustomValidators.emailValidator]),
          confirm_new_email : new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(40), CustomValidators.emailValidator]),
        });
        this._error = '';
    }

    changeEmail() : void {
        let user = Meteor.user();
        let message : string;
        let resp : boolean;
        if(this._emailEditForm.valid){
            resp = this.confirmUser();
        } else {
            this.showAlert('SETTINGS.ERROR_EMAIL_NOT_UPDATE');
            return;
        }

        if(resp || this._emailEditForm.value.email !== user.emails[0].address){
            this.showAlert('SETTINGS.ERROR_EMAIL_DOES_NOT_MATCH');
        } else if(this._emailEditForm.value.new_email !== this._emailEditForm.value.confirm_new_email){
            this.showAlert('SETTINGS.ERROR_EMAILS_DOES_NOT_MATCH');
        } else {
            this.zone.run(() => {
                MeteorObservable.call('addEmail', this._emailEditForm.value.new_email).subscribe(()=> {
                }, (error) => {
                    this.showError(error);
                    return;
                });
                
                MeteorObservable.call('removeEmail',this._emailEditForm.value.email).subscribe(()=> {
                    this.showAlert('SETTINGS.MESSAGE_EMAIL_UPDATED');
                    this.cancel();
                }, (error) => {
                    this.showError(error);
                });
            });
        }
    }

    confirmUser() : boolean {
        let resp : boolean;
        Meteor.loginWithPassword(this._emailEditForm.value.email, this._emailEditForm.value.password, function(error) {
            if (error) {
                this.showError(error);
                resp = false;
            }
            else {
                resp = true;
            }
        });
        return resp;
    }

    showAlert(message : string){

    }

    showError(error : string){

    }

    cancel() {

    }

    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }
}