import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
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

    constructor(protected router: Router, public zone: NgZone, public formBuilder: FormBuilder, public translate: TranslateService) {
        //super(router, zone, formBuilder, translate);
        super(zone, formBuilder, translate);
        this.userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(this.userLang);
    }

    roamWeb(route: string) {
        Meteor.logout();
        this.router.navigate(['signin']);
    }
}