import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';

import { ChangeEmailPage } from './change-email/change-email';
import { ChangePasswordPage } from './change-password/change-password';

import { Users } from 'qmo_web/both/collections/auth/user.collection';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage implements OnInit, OnDestroy {

  private _user;
  private _userSubscription: Subscription;
  private _disabled: boolean
  private _validate: boolean
  private _email: string;
  private _userName: string;
  private _firstName: string;
  private _lastName: string;
  private _message: string;
  private _languageCode: string;
  private _imageProfile: string;
  private _userLang: string;
  private _userObservable;

  constructor(public _navCtrl: NavController, 
              public _navParams: NavParams,
              public _translate: TranslateService,
              public _modalCtrl: ModalController) {
              
      this._userLang = navigator.language.split('-')[0];
      _translate.setDefaultLang('en');
      _translate.use(this._userLang);
  }

  ngOnInit(){
        this._userSubscription = MeteorObservable.subscribe('getUserSettings').subscribe(() =>{
            this._disabled = false;
            this._validate = false;
            this._user = Users.collection.findOne({_id: Meteor.userId()});
            this._imageProfile = "assets/img/user_default_image.png";

            if(this._user.services.facebook){
                this._email = this._user.services.facebook.email;
                this._userName = this._user.services.facebook.name;
                this._firstName = this._user.services.facebook.first_name;
                this._lastName = this._user.services.facebook.last_name;
                this._languageCode = this._user.services.facebook.locale;
                this._imageProfile = "http://graph.facebook.com/" + this._user.services.facebook.id + "/picture/?type=large";
            } else if(this._user.services.twitter){
                this._email = this._user.services.twitter.email;
                this._userName = this._user.services.twitter.screenName;
                this._firstName = this._user.services.twitter.first_name;
                this._lastName = this._user.services.twitter.last_name;
                this._languageCode = this._user.services.twitter.lang;
                this._imageProfile = this._user.services.twitter.profile_image_url;
            } else if(this._user.services.google){
                this._email = this._user.services.google.email;
                this._userName = this._user.services.google.name;
                this._firstName = this._user.services.google.given_name;
                this._lastName = this._user.services.google.family_name;
                this._languageCode = this._user.services.google.locale;
                this._imageProfile = this._user.services.google.picture;
            } else {
                this._disabled = true;
                this._userObservable = Users.find({}).zone();
            }
        });

    }

    logOut(){
        Meteor.logout();
    }

    openEmail() {
        let contactModal = this._modalCtrl.create(ChangeEmailPage);
        contactModal.present();
    }

    openPassword() {
        let contactModal = this._modalCtrl.create(ChangePasswordPage);
        contactModal.present();
    }

    editUserDetail(_userName : any, _firstName : any, _lastName : any, _languageCode : any):void {
        if(this.validateUserName(_userName)){
            Users.update(
                {_id: Meteor.userId()}, 
                { $set:
                    {
                        username: _userName,
                        profile: {  first_name: _firstName,
                                    last_name: _lastName,
                                    language_code: _languageCode }
                    }
            });
            alert('Usuario actualizado correctamente');
        }
    }

    validateUserName(_userName : any) : boolean{
        if(_userName === null || _userName === '' || _userName.length == 0){
            this._message = this.itemNameTraduction('SIGNUP.REQUIRED_USERNAME');
            this._validate = true;
            return false;
        }
        else if (_userName.length < 6) {
            this._message = this.itemNameTraduction('SIGNUP.MIN_LENGTH_USERNAME');
            this._validate = true;
            return false;
        } 
        else if (_userName.length > 20){
            this._message = this.itemNameTraduction('SIGNUP.MAX_LENGTH_USERNAME');
            this._validate = true;
            return false;
        }
        else {
            this._validate = false;
            return true;
        }
    }

    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }

    ngOnDestroy(){
        this._userSubscription.unsubscribe();
    }

}
