import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { UserDetails } from '../../../../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../../../../both/models/auth/user-detail.model';
import { Table } from '../../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../../both/collections/restaurant/table.collection';
import { AlertConfirmComponent } from '../../../../web/general/alert-confirm/alert-confirm.component';

import template from './change-table.component.html';
import style from './change-table.component.scss';

@Component({
    selector: 'change-table',
    template,
    styles: [ style ]
})
export class ChangeTableComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    private _changeTableForm            : FormGroup;

    private _userDetailsSub             : Subscription;
    private _tableSub                   : Subscription;

    private _showInfo                   : boolean = false;
    private _mdDialogRef                : MdDialogRef<any>;

    private _currentRestaurant          : string = '';
    private _currentQRCodeTable         : string = '';
    private titleMsg                    : string;
    private btnAcceptLbl                : string;

    /**
     * ChangeTableComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     * @param {UserLanguageService} _userLanguageService
     * @param {MdDialog} _mdDialog
     * @param {Router} _router
     */
    constructor( private _translate: TranslateService, 
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService,
                 protected _mdDialog: MdDialog,
                 private _router: Router ) {
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this.removeSubscriptions();
        this._changeTableForm = new FormGroup({
            qrCodeDestiny: new FormControl( '', [ Validators.required, Validators.minLength( 1 ) ] )
        });
        this._userDetailsSub = MeteorObservable.subscribe( 'getUserDetailsByUser', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                let _lUserDetail: UserDetail = UserDetails.findOne( { user_id: this._user } );
                if( _lUserDetail.current_restaurant !== '' && _lUserDetail.current_table !== '' ){
                    this._tableSub = MeteorObservable.subscribe( 'getTableById', _lUserDetail.current_table ).subscribe( () => {
                        this._ngZone.run( () => {
                            let _lTable: Table = Tables.findOne( { _id: _lUserDetail.current_table } );
                            this._currentRestaurant = _lUserDetail.current_restaurant;
                            this._currentQRCodeTable = _lTable.QR_code
                            this._showInfo = true;
                        });
                    });
                } else {
                    this._showInfo = false;
                }
            });
        });
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._userDetailsSub ){ this._userDetailsSub.unsubscribe(); }
        if( this._tableSub ){ this._tableSub.unsubscribe(); }
    }

    /**
     * This function allow change user current table
     */
    changeUserTable():void{
        if( !Meteor.userId() ){
            var error : string = 'LOGIN_SYSTEM_OPERATIONS_MSG';
            this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
            return;
        }

        if( this._changeTableForm.valid ){
            MeteorObservable.call( 'changeCurrentTable', this._user, this._currentRestaurant, this._currentQRCodeTable, this._changeTableForm.value.qrCodeDestiny ).subscribe( () => {
                this.openDialog(this.titleMsg, '', this.itemNameTraduction( 'CHANGE_TABLE.CHANGE_TABLE_OK' ), '', this.btnAcceptLbl, false);
                this._router.navigate(['/app/orders']);
            }, ( error ) => {
                if( error.error === '100' ){
                    this.openDialog(this.titleMsg, '', this.itemNameTraduction( 'CHANGE_TABLE.TABLE_DESTINY_NOT_EXISTS' ), '', this.btnAcceptLbl, false);
                } else if( error.error === '101' ){
                    this.openDialog(this.titleMsg, '', this.itemNameTraduction( 'CHANGE_TABLE.TABLE_DESTINY_NO_ACTIVE' ), '', this.btnAcceptLbl, false);
                } else if( error.error === '102' ){
                    this.openDialog(this.titleMsg, '', this.itemNameTraduction( 'CHANGE_TABLE.TABLE_DESTINY_NO_RESTAURANT' ), '', this.btnAcceptLbl, false);
                } else if( error.error === '103' ){
                    this.openDialog(this.titleMsg, '', this.itemNameTraduction( 'CHANGE_TABLE.PENDING_ORDERS' ), '', this.btnAcceptLbl, false);
                } else if( error.error === '104' ){
                    this.openDialog(this.titleMsg, '', this.itemNameTraduction( 'CHANGE_TABLE.ORDERS_PAY_PROCESS' ), '', this.btnAcceptLbl, false);
                } else if( error.error === '105' ){
                    this.openDialog(this.titleMsg, '', this.itemNameTraduction( 'CHANGE_TABLE.WAITER_CALL_PENDING' ), '', this.btnAcceptLbl, false);
                } else if( error.error === '106' ){
                    this.openDialog(this.titleMsg, '', this.itemNameTraduction( 'CHANGE_TABLE.TABLE_DESTINY_STATUS_ERROR' ), '', this.btnAcceptLbl, false);
                } else {
                    this.openDialog(this.titleMsg, '', this.itemNameTraduction( 'CHANGE_TABLE.GENERAL_ERROR' ), '', this.btnAcceptLbl, false);
                }
            });
        }
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
     * Function to cancel operation
     */
    cancel():void{
        this._changeTableForm.reset();
    }

    /**
     * This function allow go to Orders
     */
    goToOrders(){
        this._router.navigate(['/app/orders']);
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this.removeSubscriptions();
    }
}