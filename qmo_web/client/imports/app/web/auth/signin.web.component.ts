import { Component, NgZone, ViewContainerRef } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { RecoverWebComponent } from './recover-password/recover.web.component';

import { SigninClass } from '../../../../../both/shared-components/auth/signin.class';

import template from './signin.web.component.html';
import style from './auth.component.scss';

@Component({
    selector: 'signin',
    template,
    styles: [style]
})

export class SigninWebComponent extends SigninClass {

    private mdDialogRef: MdDialogRef<any>;

    constructor(private router: Router, protected zone: NgZone, protected translate: TranslateService, 
                public viewContainerRef: ViewContainerRef, public mdDialog: MdDialog) {
        super( zone, translate);

        if(!Meteor.user()){
            Meteor.logout();
        }
    }

    roamWeb(route: string) {
            this.router.navigate([route]);
    }

    openDialogForgotPassword(){
        /*let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;*/
        
        this.mdDialogRef = this.mdDialog.open(RecoverWebComponent, {
            disableClose : true,
        });
        this.mdDialogRef.afterClosed().subscribe( result => {
            this.mdDialogRef = null; 
        });
    }
}