import { Component, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertController, NavController, NavParams, ViewController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate'

@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html'
})
export class ChangePasswordPage {

    private _changePasswordForm: FormGroup;
    private _error : string;

    constructor(public _navCtrl: NavController, 
                public _navParams: NavParams, 
                private _zone: NgZone, 
                public viewCtrl: ViewController, 
                private _alertCtrl: AlertController, 
                protected _translate: TranslateService) { 
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
               this.showAlert('MOBILE.SETTINGS.ERROR_PASS_NOT_UPDATE');
            } else {
                this._zone.run(() => {
                    Accounts.changePassword(this._changePasswordForm.value.old_password, this._changePasswordForm.value.new_password, (err) => {
                        if (err) {
                            this.showError(err);
                        } else {
                            this.showAlert('MOBILE.SETTINGS.MESSAGE_PASS_UPDATED');
                            this.cancel();
                        }
                    });
                });
            }
        }
        else 
        {
            this.showAlert('MOBILE.SETTINGS.ERROR_PASS_NOT_UPDATE');
        }
    }

    cancel() {
        this.viewCtrl.dismiss();
    }

    showAlert(message : string){
        var confirmTitle: string;
        var confirmSubtitle: string;
        var confirmButton: string;

        confirmTitle = this.itemNameTraduction('MOBILE.SETTINGS.CHANGE_PASSWORD_ALERT.CONFIRM_TITLE');
        confirmSubtitle = this.itemNameTraduction(message);
        confirmButton = this.itemNameTraduction('MOBILE.SETTINGS.CHANGE_PASSWORD_ALERT.CONFIRM_BTN');

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

        confirmTitle = this.itemNameTraduction('MOBILE.SETTINGS.CHANGE_PASSWORD_ALERT.ERROR_TITLE');
        confirmSubtitle = this.itemNameTraduction(error);
        confirmButton = this.itemNameTraduction('MOBILE.SETTINGS.CHANGE_PASSWORD_ALERT.CONFIRM_BTN');

        let alert = this._alertCtrl.create({
            title: confirmTitle,
            subTitle: confirmSubtitle,
            buttons: [confirmButton]
        });
        alert.present();
    }

    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }

}
