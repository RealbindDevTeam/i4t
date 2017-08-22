import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef } from '@angular/material';
import { RecoverClass } from '../../../../../../both/shared-components/auth/recover-password/recover.class';

import template from './recover.web.component.html';
import style from './recover.web.component.scss';

@Component({
    selector: 'recover',
    template,
    styles: [style]
})
export class RecoverWebComponent extends RecoverClass {

    /**
     * RecoverWebComponent Constructor
     * @param {MdDialogRef<any>} dialogRef 
     * @param {NgZone} zone 
     * @param {TranslateService} translate 
     */
    constructor( public dialogRef: MdDialogRef<any>, 
                 protected zone: NgZone, 
                 protected translate: TranslateService ) {
        super(zone, translate);
    }

    cancel() {
        this.dialogRef.close({ success: false });
    }

    showAlert(message : string){
        let message_translate = this.itemNameTraduction(message);
        alert(message_translate);
        this.dialogRef.close({ success: false });
    }

    showError(error : string){
        alert(error);
    }
}