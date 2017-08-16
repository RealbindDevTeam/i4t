import { Component, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertController, NavController, NavParams, ViewController } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';

import { CustomValidators } from '../../../../../validators/custom-validator';

@Component({
  selector: 'page-change-email',
  templateUrl: 'change-email.html'
})
export class ChangeEmailPage {

    private _emailEditForm: FormGroup;
    private _error : string;

    constructor(public navCtrl: NavController, 
                public navParams: NavParams, 
                private _zone: NgZone, 
                protected _translate: TranslateService, 
                public viewCtrl: ViewController,
                private _alertCtrl: AlertController) {}
    
    ngOnInit() {
        this._emailEditForm = new FormGroup({
          email : new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(40), CustomValidators.emailValidator]),
          password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
          new_email : new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(40), CustomValidators.emailValidator]),
          confirm_new_email : new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(40), CustomValidators.emailValidator]),
        });
        this._error = '';
    }

    cancel() {
        this.viewCtrl.dismiss();
    }

    showAlert(message : any){
        var confirmTitle: string;
        var confirmSubtitle: string;
        var confirmButton: string;

        confirmTitle = this.itemNameTraduction('MOBILE.SETTINGS.CHANGE_EMAIL_ALERT.CONFIRM_TITLE');
        confirmSubtitle = this.itemNameTraduction(message);
        confirmButton = this.itemNameTraduction('MOBILE.SETTINGS.CHANGE_EMAIL_ALERT.CONFIRM_BTN');

        let alert = this._alertCtrl.create({
            title: confirmTitle,
            subTitle: confirmSubtitle,
            buttons: [confirmButton]
        });
        alert.present();
    }
    
    showError(error : string){
        var confirmTitle: string;
        var confirmSubtitle: string;
        var confirmButton: string;

        confirmTitle = this.itemNameTraduction('MOBILE.SETTINGS.CHANGE_EMAIL_ALERT.ERROR_TITLE');
        confirmSubtitle = this.itemNameTraduction(error);
        confirmButton = this.itemNameTraduction('MOBILE.SETTINGS.CHANGE_EMAIL_ALERT.CONFIRM_BTN');

        let alert = this._alertCtrl.create({
            title: confirmTitle,
            subTitle: confirmSubtitle,
            buttons: [confirmButton]
        });
        alert.present();
    }

    changeEmail() : void {
        let user = Meteor.user();
        let resp : boolean;
        if(this._emailEditForm.valid){
            resp = this.confirmUser();
        } else {
            this.showAlert('MOBILE.SETTINGS.ERROR_EMAIL_NOT_UPDATE');
            return;
        }

        if(resp || this._emailEditForm.value.email !== user.emails[0].address){
            this.showAlert('MOBILE.SETTINGS.ERROR_EMAIL_DOES_NOT_MATCH');
        } else if(this._emailEditForm.value.new_email !== this._emailEditForm.value.confirm_new_email){
            this.showAlert('MOBILE.SETTINGS.ERROR_EMAILS_DOES_NOT_MATCH');
        } else {
            this._zone.run(() => {
                MeteorObservable.call('addEmail', this._emailEditForm.value.new_email).subscribe(()=> {
                }, (error) => {
                    this.showError(error);
                    return;
                });
                
                MeteorObservable.call('removeEmail',this._emailEditForm.value.email).subscribe(()=> {
                    this.showAlert('MOBILE.SETTINGS.MESSAGE_EMAIL_UPDATED');
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

    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }

}
