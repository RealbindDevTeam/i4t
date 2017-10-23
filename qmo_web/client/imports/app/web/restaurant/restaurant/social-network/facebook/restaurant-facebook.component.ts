import { Component, OnInit } from '@angular/core';
import { MdDialogRef, MdDialog, MdSnackBar } from '@angular/material';
import { MeteorObservable } from 'meteor-rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { UserLanguageService } from '../../../../../shared/services/user-language.service';
import { TranslateService } from '@ngx-translate/core';
import { Restaurant } from '../../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../../both/collections/restaurant/restaurant.collection';
import { AlertConfirmComponent } from '../../../../../web/general/alert-confirm/alert-confirm.component';

import template from './restaurant-facebook.component.html';
import style from './restaurant-facebook.component.scss';

@Component({
    selector: 'restaurant-facebook',
    template,
    styles: [ style ],
    providers: [ UserLanguageService ]
})
export class RestaurantFacebookComponent implements OnInit {

    private _user = Meteor.userId();
    public _restaurant                  : Restaurant;

    private _restaurantFacebookForm     : FormGroup;
    private _mdDialogRef                : MdDialogRef<any>;

    private _facebookLink               : string = '';
    private titleMsg                    : string;
    private btnAcceptLbl                : string;


    /**
     * RestaurantFacebookComponent constructor
     * @param {MdDialogRef<any>} _dialogRef
     * @param {TranslateService} _translate
     * * @param {MdSnackBar} _snackBar
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( public _dialogRef: MdDialogRef<any>, 
                 private _translate: TranslateService, 
                 private _userLanguageService: UserLanguageService,
                 private _snackBar: MdSnackBar,
                 protected _mdDialog: MdDialog ){
                     _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
                     _translate.setDefaultLang( 'en' );
                     this.titleMsg = 'SIGNUP.SYSTEM_MSG';
                     this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        /*if( this._restaurant.social_network !== undefined && this._restaurant.social_network !== null ){
            if( this._restaurant.social_network.facebook !== undefined && this._restaurant.social_network.facebook !== null ){
                this._facebookLink = this._restaurant.social_network.facebook;
            }
        }
        this._restaurantFacebookForm = new FormGroup({
            facebookLink: new FormControl( this._facebookLink )
        });*/
    }

    /**
     * Update Restaurant facebook link
     */
    updateFacebookLink():void{
        if( !Meteor.userId() ){
            var error : string = 'LOGIN_SYSTEM_OPERATIONS_MSG';
            this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
            return;
        }
        Restaurants.update( this._restaurant._id, {
            $set: {
                modificaton_user: this._user,
                modificaton_date: new Date(),
                'social_network.facebook': this._restaurantFacebookForm.value.facebookLink
            }
        });
        let _lMessage:string = this.itemNameTraduction( 'RESTAURANT.FACEBOOK_LINK_UPDATED' );
        this._snackBar.open( _lMessage, '',{
            duration: 2500
        });
        this.close();
    }

    /**
     * Close dialog
     */
    close():void{
        this._dialogRef.close();
    }

    /**
     * Return traduction
     * @param {string} itemName 
     */
    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
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
}