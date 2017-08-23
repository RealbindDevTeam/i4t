import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserLanguageService } from '../../shared/services/user-language.service';
import { CustomValidators } from '../../../../../both/shared-components/validators/custom-validator';
import { ResetPasswordClass } from '../../../../../both/shared-components/auth/reset-password.class';
import { AlertConfirmComponent } from '../../web/general/alert-confirm/alert-confirm.component';

import template from './reset-password.web.component.html';
import style from './auth.component.scss';


@Component({
    selector: 'reset-password',
    template,
    styles: [style]
})

export class ResetPasswordWebComponent extends ResetPasswordClass{

    private _mdDialogRef            : MdDialogRef<any>;
    private titleMsg                : string;
    private btnAcceptLbl            : string;

    /**
     * ResetPasswordWebComponent Component
     * @param {Router} router 
     * @param {NgZone} zone 
     * @param {TranslateService} translate 
     * @param {ActivatedRoute} activatedRoute
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( protected router: Router, 
                 protected zone: NgZone, 
                 protected translate: TranslateService, 
                 protected activatedRoute: ActivatedRoute,
                 protected _userLanguageService: UserLanguageService,
                 protected _mdDialog: MdDialog ){
        super(zone, translate, activatedRoute, _userLanguageService);
        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }
    
    showAlert(message : string){
        let message_translate = this.itemNameTraduction(message);
        this.openDialog(this.titleMsg, '', message_translate, '', this.btnAcceptLbl, false);
        Meteor.logout();
        this.router.navigate(['signin']);
    }

    showError(error : string){
        this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
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