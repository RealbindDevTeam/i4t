import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MdDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Accounts } from 'meteor/accounts-base';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { MeteorObservable } from 'meteor-rxjs';
import { CustomValidators } from '../../../../../../../both/shared-components/validators/custom-validator';

import template from './change-email.web.component.html';

@Component({
  selector: 'change-email',
  template,
  styles: [],
  providers: [ UserLanguageService ]
})
export class ChangeEmailWebComponent implements OnInit {

    private _emailEditForm      : FormGroup;
    private _error              : string;
    
    /**
     * ChangeEmailWebComponent Constructor
     * @param {MdDialogRef<any>} _dialogRef 
     * @param {NgZone} _zone 
     * @param {TranslateService} _translate 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( public _dialogRef: MdDialogRef<any>, 
                 private _zone: NgZone, 
                 private _translate: TranslateService,
                 private _userLanguageService: UserLanguageService ) { 
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

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
            this._zone.run(() => {
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

    cancel() {
        this._dialogRef.close({success : false});
    }

    showAlert(message : string){
        let message_translate = this.itemNameTraduction(message);
        alert(message_translate);
    }

    showError(error : string){
        let error_translate = this.itemNameTraduction(error);
        alert(error);
    }

    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }
}