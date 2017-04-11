import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { Accounts } from 'meteor/accounts-base';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription, Subject, Observable } from 'rxjs';
import { TranslateService } from 'ng2-translate';

import { Language } from '../../../../both/models/settings/language.model';
import { Languages } from '../../../../both/collections/settings/language.collection';

import { Users } from '../../../collections/auth/user.collection';
import { User } from '../../../models/auth/user.model';

export class SettingsClass implements OnInit, OnDestroy {
    
    private _user: User;
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
    private _lang_code: string;
    private _userObservable:Observable<User[]>;
    private _languages : Observable<Language[]>;
    private _subscription : Subscription;

    public constructor(protected _translate: TranslateService ) 
    {
        var _userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(_userLang);
    }

    ngOnInit(){
        this._languages = Languages.find({}).zone();
        this._subscription = MeteorObservable.subscribe('languages').subscribe();

        this._userSubscription = MeteorObservable.subscribe('getUserSettings').subscribe(() =>{
            this._disabled = false;
            this._validate = false;
            this._user = Users.collection.findOne({_id: Meteor.userId()});
            this._imageProfile = "/images/user_default_image.png";

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

    editUserDetail(_userName : any, _firstName : any, _lastName : any, _languageCode : any):void {
        if(this.validateUserName(_userName)){
            Users.update(
                {_id: Meteor.userId()}, 
                { $set:
                    {
                        username: _userName.value,
                        profile: {  first_name: _firstName.value,
                                    last_name: _lastName.value,
                                    language_code: this._lang_code }
                    }
            });
            let message : string;
            message = this.itemNameTraduction('SETTINGS.USER_DETAIL_UPDATED');
            alert(message);
        }
    }

    validateUserName(_userName : any) : boolean{
        if(_userName.value === null || _userName.value === '' || _userName.value.length == 0){
            this._message = this.itemNameTraduction('SIGNUP.REQUIRED_USERNAME');
            this._validate = true;
            return false;
        }
        else if (_userName.value.length < 6) {
            this._message = this.itemNameTraduction('SIGNUP.MIN_LENGTH_USERNAME');
            this._validate = true;
            return false;
        } 
        else if (_userName.value.length > 20){
            this._message = this.itemNameTraduction('SIGNUP.MAX_LENGTH_USERNAME');
            this._validate = true;
            return false;
        }
        else {
            this._validate = false;
            return true;
        }
    }

    ngOnDestroy(){
        this._userSubscription.unsubscribe();
        this._subscription.unsubscribe();
    }

    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }

}