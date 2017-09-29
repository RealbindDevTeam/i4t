import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { UserLanguageService } from '../../../../../shared/services/user-language.service';
import { User } from '../../../../../../../../both/models/auth/user.model';
import { UserProfileImage } from '../../../../../../../../both/models/auth/user-profile.model';
import { Users, UserImages } from '../../../../../../../../both/collections/auth/user.collection';
import { UserDetail } from '../../../../../../../../both/models/auth/user-detail.model';
import { UserDetails } from '../../../../../../../../both/collections/auth/user-detail.collection';
import { Order } from '../../../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../../../both/collections/restaurant/order.collection';
import { Account } from '../../../../../../../../both/models/restaurant/account.model';
import { Accounts } from '../../../../../../../../both/collections/restaurant/account.collection';

import template from './table-detail.component.html';
import style from './table-detail.component.scss';

@Component({
    selector: 'table-detail',
    template,
    styles: [ style ],
    providers:[ UserLanguageService ]
})
export class TableDetailComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    private _restaurantId           : string;
    private _tableId                : string;
    private _tableNumber            : string;
    private _userDetails            : Observable<UserDetail[]>;
    private _users                  : Observable<User[]>;

    /**
     * TableDetailComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     * @param {UserLanguageService} _userLanguageService 
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor( private _translate: TranslateService,
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService,
                 public _dialogRef: MdDialogRef<any> ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._userDetails = UserDetails.find( { current_restaurant: this._restaurantId, current_table: this._tableId } ).zone();
        this._users = Users.find( { } ).zone();
    }

    /**
     * Return user image
     * @param {User} _pUser 
     */
    getUserImage( _pUser:User ):string{
        if( _pUser.services.facebook ){
            return "http://graph.facebook.com/" + _pUser.services.facebook.id + "/picture/?type=large";
        } else {
            let _lUserImage: UserProfileImage = UserImages.findOne( { userId: _pUser._id });
            if( _lUserImage ){
                return _lUserImage.url;
            } 
            else {
                return '/images/user_default_image.png';
            }
        }
    }

    /**
     * Close Dialog
     */
    close():void{
        this._dialogRef.close();
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){

    }
}