import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { CustomValidators } from '../../../../../both/shared-components/validators/custom-validator';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';

import { UserDetails } from '../../../../../both/collections/auth/user-detail.collection';
import { Countries } from '../../../../../both/collections/settings/country.collection';
import { Country } from '../../../../../both/models/settings/country.model';
import { City } from '../../../../../both/models/settings/city.model';
import { Cities } from '../../../../../both/collections/settings/city.collection';

import template from './admin-signup.component.html';
import style from './auth.component.scss';

import { UserProfile, UserProfileImage } from '../../../../../both/models/auth/user-profile.model';

@Component({
    selector: 'admin-signup',
    template,
    styles: [style]
})

export class AdminSignupComponent implements OnInit, OnDestroy {

    private _countrySub: Subscription;
    private _countries: Observable<Country[]>;
    private _citySub: Subscription;
    private _cities: Observable<City[]>;
    private _selectedCountry: string;
    private _selectedCity: string = "";

    signupForm: FormGroup;
    error: string;
    showLoginPassword: boolean = true;
    showConfirmError: boolean = false;
    userLang: string;
    userProfile = new UserProfile();
    userProfileImage = new UserProfileImage();

    constructor(protected router: Router, public zone: NgZone, public formBuilder: FormBuilder, public translate: TranslateService, private _ngZone: NgZone, ) {
        this.userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(this.userLang);
    }

    ngOnInit() {
        this.signupForm = new FormGroup({
            username: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
            email: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(255), CustomValidators.emailValidator]),
            password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
            confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
            firstName: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(70)]),
            lastName: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(70)]),
            dniNumber: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]),
            contactPhone: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]),
            shippingAddress: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(150)]),
            country: new FormControl('', [Validators.required]),
            city: new FormControl('', [Validators.required]),
        });

        this._countrySub = MeteorObservable.subscribe('countries').subscribe(() => {
            this._ngZone.run(() => {
                this._countries = Countries.find({}).zone();
            });
        });

        this._citySub = MeteorObservable.subscribe('cities').subscribe(() => {
            this._ngZone.run(() => {
                this._cities = Cities.find({ country: '' }).zone();
            });
        });

        this.error = '';
    }

    /**
    * This function changes de country to select
    *@param {Country} _country
    */
    changeCountry(_country: Country) {
        this._cities = Cities.find({ country: _country._id }).zone();
    }
    ngOnDestroy() {

    }
}