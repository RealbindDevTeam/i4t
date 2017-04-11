import { Component, ViewContainerRef, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Accounts } from 'meteor/accounts-base'
import { TranslateService } from 'ng2-translate'

export class ChangePasswordClass {

    private _changePasswordForm: FormGroup;
    private _user : Meteor.User;
    private _error : string;

    constructor( private zone: NgZone, protected _translate: TranslateService) { }

    ngOnInit() {
        this._changePasswordForm = new FormGroup({
          old_password : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
          new_password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
          confirm_new_password : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
        });
        this._error = '';
    }

    cancel() {
    }

    changePassword(){
        if(this._changePasswordForm.valid){
            if(this._changePasswordForm.value.new_password !== this._changePasswordForm.value.confirm_new_password){
               this.showAlert('SETTINGS.ERROR_PASS_NOT_UPDATE');
            } else {
                this.zone.run(() => {
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

    showAlert(message : string){

    }

    showError(error : string){
        
    }

    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }
}