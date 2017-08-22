import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from '../../../../../both/shared-components/validators/custom-validator';
import { ResetPasswordClass } from '../../../../../both/shared-components/auth/reset-password.class';

import template from './reset-password.web.component.html';
import style from './auth.component.scss';


@Component({
    selector: 'reset-password',
    template,
    styles: [style]
})

export class ResetPasswordWebComponent extends ResetPasswordClass{

    /**
     * ResetPasswordWebComponent Component
     * @param {Router} router 
     * @param {NgZone} zone 
     * @param {TranslateService} translate 
     * @param {ActivatedRoute} activatedRoute
     */
    constructor( protected router: Router, 
                 protected zone: NgZone, 
                 protected translate: TranslateService, 
                 protected activatedRoute: ActivatedRoute ){
        super(zone, translate, activatedRoute);
    }
    
     showAlert(message : string){
        let message_translate = this.itemNameTraduction(message);
        alert(message_translate);
        Meteor.logout();
        this.router.navigate(['signin']);
    }

    showError(error : string){
        alert(error);
    }
}