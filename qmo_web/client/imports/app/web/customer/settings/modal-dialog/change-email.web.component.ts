import { Component, ViewContainerRef, OnInit, NgZone } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { TranslateService } from 'ng2-translate';
import { ChangeEmailClass } from '../../../../../../../both/shared-components/customer/settings/modal-dialogs/change-email.class';

import template from './change-email.web.component.html';

@Component({
  selector: 'change-email',
  template,
  styles: []
})
export class ChangeEmailWebComponent extends ChangeEmailClass {
    
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
        let error_translate = this.itemNameTraduction(error);
        alert(error);
    }
    
}