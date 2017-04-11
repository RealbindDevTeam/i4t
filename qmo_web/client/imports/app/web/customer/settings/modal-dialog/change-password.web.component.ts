import { Component, ViewContainerRef, OnInit, NgZone } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { TranslateService } from 'ng2-translate'

import { ChangePasswordClass } from '../../../../../../../both/shared-components/customer/settings/modal-dialogs/change-password.class';

import template from './change-password.web.component.html';

@Component({
  selector: 'change-password',
  template
})
export class ChangePasswordWebComponent extends ChangePasswordClass {
    constructor( public _dialogRef: MdDialogRef<any>, private _zone: NgZone, protected _translate: TranslateService ) { 
        super(_zone, _translate);
    }

    cancel() {
        this._dialogRef.close({success : false});
    }

    showAlert(message : string){
        let message_translate = this.itemNameTraduction(message);
        alert(message_translate);
    }

    showError(error : string){
        alert(error);
    }
}