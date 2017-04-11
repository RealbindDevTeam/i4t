import { Component, ViewContainerRef } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { TranslateService } from 'ng2-translate';

import { SettingsClass } from '../../../../../../both/shared-components/customer/settings/settings.class';
import { ChangeEmailWebComponent } from './modal-dialog/change-email.web.component';
import { ChangePasswordWebComponent } from '../../../web/customer/settings/modal-dialog/change-password.web.component';

import template from './settings.web.component.html';
import style from './settings.web.component.scss';

@Component({
    selector: 'settings',
    template,
    styles: [ style ]
})
export class SettingsWebComponent extends SettingsClass {

    private _mdDialogRef: MdDialogRef<any>;

    constructor (protected _translate: TranslateService, public _mdDialog: MdDialog, public _viewContainerRef: ViewContainerRef){
        super( _translate);
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
}