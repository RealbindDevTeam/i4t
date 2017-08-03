import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { UserLanguageService } from '../../shared/services/user-language.service';
import { CustomValidators } from '../../../../../both/shared-components/validators/custom-validator';
import { UserDetails } from '../../../../../both/collections/auth/user-detail.collection';
import { SignupClass } from '../../../../../both/shared-components/auth/signup.class';

import template from './signup.web.component.html';
import style from './auth.component.scss';

import { UserProfile, UserProfileImage } from '../../../../../both/models/auth/user-profile.model';

@Component({
    selector: 'signup',
    template,
    styles: [style]
})
export class SignupWebComponent extends SignupClass {

    /**
     * SignupWebComponent Constructor
     * @param {Router} router 
     * @param {NgZone} zone 
     * @param {FormBuilder} formBuilder 
     * @param {TranslateService} translate 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( protected router: Router, 
                 public zone: NgZone, 
                 public formBuilder: FormBuilder, 
                 public translate: TranslateService,
                 public _userLanguageService: UserLanguageService ) {
                    super(zone, formBuilder, translate, _userLanguageService);
                    translate.use( this._userLanguageService.getNavigationLanguage() );
                    translate.setDefaultLang( 'en' );
    }

    roamWeb(route: string) {
        Meteor.logout();
        this.router.navigate(['signin']);
    }
}