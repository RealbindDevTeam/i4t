import { Component, ViewContainerRef, OnInit, NgZone } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { TranslateService } from 'ng2-translate';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { ChangeEmailClass } from '../../../../../../../both/shared-components/customer/settings/modal-dialogs/change-email.class';

import template from './change-email.web.component.html';

@Component({
  selector: 'change-email',
  template,
  styles: [],
  providers: [ UserLanguageService ]
})
export class ChangeEmailWebComponent extends ChangeEmailClass {
    
    /**
     * ChangeEmailWebComponent Constructor
     * @param {MdDialogRef<any>} _dialogRef 
     * @param {NgZone} _zone 
     * @param {TranslateService} _translate 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( public _dialogRef: MdDialogRef<any>, 
                 private _zone: NgZone, 
                 protected _translate: TranslateService,
                 protected _userLanguageService: UserLanguageService ) { 
        super(_zone, _translate, _userLanguageService);
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