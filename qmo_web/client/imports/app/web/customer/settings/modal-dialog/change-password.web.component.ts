import { Component, ViewContainerRef, OnInit, NgZone } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Accounts } from 'meteor/accounts-base'
import { TranslateService } from 'ng2-translate'
import { UserLanguageService } from '../../../../shared/services/user-language.service';

import template from './change-password.web.component.html';

@Component({
  selector: 'change-password',
  template,
  providers: [ UserLanguageService ]
})
export class ChangePasswordWebComponent implements OnInit {

    private _changePasswordForm     : FormGroup;
    private _user                   : Meteor.User;
    private _error                  : string;

    /**
     * ChangePasswordWebComponent Constructor
     * @param {MdDialogRef<any>} _dialogRef 
     * @param {NgZone} _zone 
     * @param {TranslateService} _translate 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( public _dialogRef: MdDialogRef<any>, 
                 private _zone: NgZone, 
                 protected _translate: TranslateService,
                 protected _userLanguageService: UserLanguageService ) { 
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

    ngOnInit() {
        this._changePasswordForm = new FormGroup({
          old_password : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
          new_password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
          confirm_new_password : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
        });
        this._error = '';
    }

    changePassword(){
        if(this._changePasswordForm.valid){
            if(this._changePasswordForm.value.new_password !== this._changePasswordForm.value.confirm_new_password){
               this.showAlert('SETTINGS.ERROR_PASS_NOT_UPDATE');
            } else {
                this._zone.run(() => {
                    Accounts.changePassword(this._changePasswordForm.value.old_password, this._changePasswordForm.value.new_password, (err) => {
                        if (err) {
                            this.showError(err);
                        } else {
                            this.showAlert('SETTINGS.MESSAGE_PASS_UPDATED');
                            this.cancel();
                        }
                    });
                });
            }
        }
        else 
        {
            this.showAlert('SETTINGS.ERROR_PASS_NOT_UPDATE');
        }
    }

    cancel() {
        this._dialogRef.close({success : false});
    }

    showAlert(message : string){
        let message_translate = this.itemNameTraduction(message);
        alert(message_translate);
    }

    showError(error : string){
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