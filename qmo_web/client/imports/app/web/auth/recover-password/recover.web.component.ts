import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { RecoverClass } from '../../../../../../both/shared-components/auth/recover-password/recover.class';
import { AlertConfirmComponent } from '../../../web/general/alert-confirm/alert-confirm.component';

import template from './recover.web.component.html';
import style from './recover.web.component.scss';

@Component({
    selector: 'recover',
    template,
    styles: [style]
})
export class RecoverWebComponent extends RecoverClass {

    private _mdDialogRef            : MdDialogRef<any>;
    private titleMsg                : string;
    private btnAcceptLbl            : string;

    /**
     * RecoverWebComponent Constructor
     * @param {MdDialogRef<any>} dialogRef 
     * @param {NgZone} zone 
     * @param {TranslateService} translate 
     */
    constructor( public dialogRef: MdDialogRef<any>, 
                 protected zone: NgZone, 
                 protected translate: TranslateService,
                 protected _mdDialog: MdDialog ) {
        super(zone, translate);
        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }

    cancel() {
        this.dialogRef.close({ success: false });
    }

    showAlert(message : string){
        let message_translate = this.itemNameTraduction(message);
        this.openDialog(this.titleMsg, '', message_translate, '', this.btnAcceptLbl, false);
        this.dialogRef.close({ success: false });
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