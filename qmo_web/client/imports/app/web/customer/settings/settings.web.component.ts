import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Accounts } from 'meteor/accounts-base';
import { TranslateService } from '@ngx-translate/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription, Subject, Observable } from 'rxjs';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Language } from '../../../../../../both/models/settings/language.model';
import { Languages } from '../../../../../../both/collections/settings/language.collection';
import { Users, UserImages } from '../../../../../../both/collections/auth/user.collection';
import { User } from '../../../../../../both/models/auth/user.model';
import { UserDetails } from '../../../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../../../both/models/auth/user-detail.model';
import { ChangeEmailWebComponent } from './modal-dialog/change-email.web.component';
import { ChangePasswordWebComponent } from '../../../web/customer/settings/modal-dialog/change-password.web.component';
import { uploadUserImage } from '../../../../../../both/methods/auth/user-profile.methods';
import { UserProfileImage } from '../../../../../../both/models/auth/user-profile.model';
import { AlertConfirmComponent } from '../../../web/general/alert-confirm/alert-confirm.component';

import template from './settings.web.component.html';
import style from './settings.web.component.scss';

@Component({
    selector: 'settings',
    template,
    styles: [ style ]
})
export class SettingsWebComponent implements OnInit, OnDestroy {

    private _userSubscription       : Subscription;
    private _userDetailSubscription : Subscription;
    private _subscription           : Subscription;
    private _userImageSub           : Subscription;

    private _userObservable         : Observable<User[]>;
    private _languages              : Observable<Language[]>;

    private _mdDialogRef            : MdDialogRef<any>;
    private _user                   : User;
    private _userDetail             : UserDetail;

    private _email                  : string;
    private _userName               : string;
    private _firstName              : string;
    private _lastName               : string;
    private _message                : string;
    private _languageCode           : string;
    private _imageProfile           : string;
    private _lang_code              : string;

    private titleMsg                : string;
    private btnAcceptLbl            : string;
    private _disabled               : boolean = true;
    private _validate               : boolean;
    private _validateChangePass     : boolean = false;
    private _createImage            : boolean = false;
    private _loading                : boolean = false;

    private _filesToUpload          : Array<File>;
    private _itemImageToInsert      : File;

    /**
     * SettingsWebComponent Constructor
     * @param {TranslateService} _translate 
     * @param {MdDialog} _mdDialog
     * @param {UserLanguageService} _userLanguageService 
     * @param {NgZone} _ngZone
     */
    constructor ( private _translate: TranslateService, 
                  public _mdDialog: MdDialog,
                  private _userLanguageService: UserLanguageService,
                  private _ngZone:NgZone ){
        let _lUserLanguage = this._userLanguageService.getLanguage( Meteor.user() );
        _translate.use( _lUserLanguage );  
        _translate.setDefaultLang( 'en' ); 
        this._languageCode = _lUserLanguage;
        this._lang_code = _lUserLanguage;
        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }
    
    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        this.removeSubscriptions();
        this._subscription = MeteorObservable.subscribe('languages').subscribe(()=>{
            this._languages = Languages.find({}).zone();
        });
        
        this._userSubscription = MeteorObservable.subscribe('getUserSettings').subscribe(() =>{
            this._user = Users.findOne({_id: Meteor.userId()});
            this._userDetail = UserDetails.findOne({user_id: Meteor.userId()});

            if(this._userDetail.role_id){
                if( this._userDetail.role_id == '100' || this._userDetail.role_id == '400' ){
                    this._disabled = false;
                } else if (this._userDetail.role_id == '200' || this._userDetail.role_id == '500' || this._userDetail.role_id == '600'){
                    this._disabled = true;
                }
            }
        });

        //this._userDetailSubscription = MeteorObservable.subscribe('getUserDetailsByUser', Meteor.userId()).subscribe();

        /*this._userSubscription = MeteorObservable.subscribe('getUserSettings').subscribe(() =>{
            this._disabled = false;
            this._validate = false;
            this._validateChangePass = false;
            this._user = Users.collection.findOne({_id: Meteor.userId()});

            let lUser : UserDetail = UserDetails.collection.find({}).fetch()[0];
            if(this._user.services.facebook){
                this._email = this._user.services.facebook.email;
                this._userName = this._user.services.facebook.name;
                this._firstName = this._user.services.facebook.first_name;
                this._lastName = this._user.services.facebook.last_name;
                this._imageProfile = "http://graph.facebook.com/" + this._user.services.facebook.id + "/picture/?type=large";
            } else if (lUser.role_id === '100'  || lUser.role_id === '400'){
                this._disabled = true;
                this._validateChangePass = true;
                this._userObservable = Users.find({}).zone();
            } else if (lUser.role_id === '200'  || lUser.role_id === '500' || lUser.role_id === '600' ){
                this._validateChangePass = true;
                this._userName = this._user.username;
                this._firstName = this._user.profile.first_name;
                this._lastName = this._user.profile.last_name;
            }
            this._userImageSub = MeteorObservable.subscribe( 'getUserImages', Meteor.userId() ).subscribe();
        });*/
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._userSubscription ){ this._userSubscription.unsubscribe(); }
        if( this._userDetailSubscription ){ this._userDetailSubscription.unsubscribe(); }
        if( this._subscription ){ this._subscription.unsubscribe(); }
        if( this._userImageSub ){ this._userImageSub.unsubscribe() }
    }

    /**
     * Return user image
     */
    getUsetImage():string{
        if(this._user && this._user.services.facebook){
            return "http://graph.facebook.com/" + this._user.services.facebook.id + "/picture/?type=large";
        } else {
            let _lUserImage: UserProfileImage = UserImages.findOne( { userId: Meteor.userId() });
            if( _lUserImage ){
                return _lUserImage.url;
            } 
            else {
                return '/images/user_default_image.png';
            }
        }
    }

    /**
     * User detail edition 
     * @param _userName 
     * @param _firstName 
     * @param _lastName 
     * @param _languageCode 
     */
    editUserDetail(_userName : any, _firstName : any, _lastName : any, _languageCode : any):void {
        if( !Meteor.userId() ){
            var error : string = 'LOGIN_SYSTEM_OPERATIONS_MSG';
            this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
            return;
        }
        
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
        this.openDialog(this.titleMsg, '', message, '', this.btnAcceptLbl, false);
    }

    open() {
        this._mdDialogRef = this._mdDialog.open(ChangeEmailWebComponent, {
            disableClose : true 
        });
        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = null;
        });
    }

    openModalChangePassword() {
        
        this._mdDialogRef = this._mdDialog.open( ChangePasswordWebComponent, {
            disableClose : true
        });
        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = null;
        });
    }

    /**
     * Traduction of the strings
     * @param itemName 
     */
    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }

    /**
     * When user wants add image, this function allow insert the image in the store
     * @param {any} _fileInput
     */
    onChangeImage(_fileInput: any): void {
        this._loading = true;
        setTimeout(() => {
            this._createImage = true;
            this._filesToUpload = <Array<File>>_fileInput.target.files;
            this._itemImageToInsert = this._filesToUpload[0];

            let _lUserImage: UserProfileImage = UserImages.findOne( { userId: Meteor.userId() } );
            if( _lUserImage ){
                UserImages.remove( { _id: _lUserImage._id } );
            }
            uploadUserImage( this._itemImageToInsert, Meteor.userId() ).then((result) => {
                this._createImage = false;
            }).catch((err) => {
                var error : string = this.itemNameTraduction('UPLOAD_IMG_ERROR');
                this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
            });
            this._loading = false;
        }, 3000);
    }
    
    /** 
    * This function open de error dialog according to parameters 
    * @param {string} title
    * @param {string} subtitle
    * @param {string} content
    * @param {string} btnCancelLbl
    * @param {string} btnAcceptLbl
    * @param {boolean} showBtnCancel
    */
    openDialog(title: string, subtitle: string, content: string, btnCancelLbl: string, btnAcceptLbl: string, showBtnCancel: boolean) {
        
        this._mdDialogRef = this._mdDialog.open(AlertConfirmComponent, {
            disableClose: true,
            data: {
                title: title,
                subtitle: subtitle,
                content: content,
                buttonCancel: btnCancelLbl,
                buttonAccept: btnAcceptLbl,
                showBtnCancel: showBtnCancel
            }
        });
        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = result;
            if (result.success) {

            }
        });
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this.removeSubscriptions();
    }
}