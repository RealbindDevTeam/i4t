import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { MeteorObservable } from 'meteor-rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { UserLanguageService } from '../../../../../shared/services/user-language.service';
import { TranslateService } from '@ngx-translate/core';
import { Restaurant } from '../../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../../both/collections/restaurant/restaurant.collection';
import { AlertConfirmComponent } from '../../../../../web/general/alert-confirm/alert-confirm.component';

@Component({
    selector: 'restaurant-twitter',
    templateUrl: './restaurant-twitter.component.html',
    styles: [ './restaurant-twitter.component.scss' ],
    providers: [ UserLanguageService ]
})
export class RestaurantTwitterComponent implements OnInit {

    private _user = Meteor.userId();
    public _restaurant                  : Restaurant;

    private _restaurantTwitterForm      : FormGroup;
    private _mdDialogRef                : MatDialogRef<any>;

    private _twitterLink                : string = '';
    private titleMsg                    : string;
    private btnAcceptLbl                : string;


    /**
     * RestaurantTwitterComponent constructor
     * @param {MatDialogRef<any>} _dialogRef
     * @param {TranslateService} _translate
     * @param {MatSnackBar} _snackBar
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( public _dialogRef: MatDialogRef<any>, 
                 private _translate: TranslateService, 
                 private _snackBar: MatSnackBar,
                 private _userLanguageService: UserLanguageService,
                 protected _mdDialog: MatDialog ){
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
            if( this._restaurant.social_network.twitter !== undefined && this._restaurant.social_network.twitter !== null ){
                this._twitterLink = this._restaurant.social_network.twitter;
            }
        }
        this._restaurantTwitterForm = new FormGroup({
            twitterLink: new FormControl( this._twitterLink )
        });*/
    }

    /**
     * Update Restaurant twitter link
     */
    updateTwitterLink():void{
        if( !Meteor.userId() ){
            var error : string = 'LOGIN_SYSTEM_OPERATIONS_MSG';
            this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
            return;
        }
        Restaurants.update( this._restaurant._id, {
            $set: {
                modificaton_user: this._user,
                modificaton_date: new Date(),
                'social_network.twitter': this._restaurantTwitterForm.value.twitterLink
            }
        });
        let _lMessage:string = this.itemNameTraduction( 'RESTAURANT.TWITTER_LINK_UPDATED' );
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