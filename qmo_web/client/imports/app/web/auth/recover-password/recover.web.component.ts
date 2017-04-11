import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { TranslateService } from 'ng2-translate';
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

    constructor(public dialogRef: MdDialogRef<any>, protected zone: NgZone, protected translate: TranslateService) {
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