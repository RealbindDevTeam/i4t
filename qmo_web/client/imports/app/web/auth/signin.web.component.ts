import { Component, NgZone, ViewContainerRef } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { UserLanguageService } from '../../shared/services/user-language.service';
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

    /**
     * SigninWebComponent Constructor
     * @param {Router} router 
     * @param {NgZone} zone 
     * @param {TranslateService} translate 
     * @param {ViewContainerRef} viewContainerRef 
     * @param {MdDialog} mdDialog 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( private router: Router, 
                 protected zone: NgZone, 
                 protected translate: TranslateService, 
                 public viewContainerRef: ViewContainerRef, 
                 public mdDialog: MdDialog,
                 public _userLanguageService: UserLanguageService ) {
        super( zone, translate, _userLanguageService);

        if(!Meteor.user()){
            Meteor.logout();
        }
    }

    roamWeb(route: string) {
            this.router.navigate([route]);
    }

    openDialogForgotPassword(){
        this.mdDialogRef = this.mdDialog.open(RecoverWebComponent, {
            disableClose : true,
        });
        this.mdDialogRef.afterClosed().subscribe( result => {
            this.mdDialogRef = null; 
        });
    }
}