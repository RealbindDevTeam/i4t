import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { CustomValidators } from '../../../../../both/shared-components/validators/custom-validator';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { UserLanguageService } from '../../shared/services/user-language.service';
import { UserDetails } from '../../../../../both/collections/auth/user-detail.collection';
import { Countries } from '../../../../../both/collections/settings/country.collection';
import { Country } from '../../../../../both/models/settings/country.model';
import { City } from '../../../../../both/models/settings/city.model';
import { Cities } from '../../../../../both/collections/settings/city.collection';
import { UserProfile, UserProfileImage } from '../../../../../both/models/auth/user-profile.model';

import template from './admin-signup.component.html';
import style from './auth.component.scss';


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
    private _showOtherCity: boolean = false;

    private signupForm: FormGroup;
    private error: string;
    private showLoginPassword: boolean = true;
    private showConfirmError: boolean = false;
    private userLang: string;
    private userProfile = new UserProfile();
    private userProfileImage = new UserProfileImage();

    /**
     * AdminSignupComponent Constructor
     * @param {Router} router 
     * @param {NgZone} zone 
     * @param {FormBuilder} formBuilder 
     * @param {TranslateService} translate 
     * @param {NgZone} _ngZone 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor(protected router: Router,
        public zone: NgZone,
        public formBuilder: FormBuilder,
        public translate: TranslateService,
        private _ngZone: NgZone,
        public _userLanguageService: UserLanguageService) {
        translate.use(this._userLanguageService.getNavigationLanguage());
        translate.setDefaultLang('en');
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
            otherCity: new FormControl()
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

    /**
     * This function changes de city to select other city
     * @param {string} cityId
     */
    changeOtherCity(cityId: string) {
        this._showOtherCity = true;
        this.signupForm.controls['otherCity'].setValidators(Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(50)]));
    }

    /**
     * This function changes de city 
     */
    changeCity() {
        this._showOtherCity = false;
        this.signupForm.controls['otherCity'].clearValidators();
    }

    /**
     * This function makes the administrator register for iurest restaurant
     */
    register() {

        let cityIdAux: string;
        let cityAux: string;

        console.log('Se envía formulario');
        if (this.signupForm.value.password == this.signupForm.value.confirmPassword) {
            console.log('SON IGUALES ');

            this.userProfile.first_name = this.signupForm.value.firstName;
            this.userProfile.last_name = this.signupForm.value.lastName;
            this.userProfile.language_code = this.userLang;

            this.userProfileImage.complete = null;
            this.userProfileImage.extension = null;
            this.userProfileImage.name = null;
            this.userProfileImage.progress = null;
            this.userProfileImage.size = null;
            this.userProfileImage.store = null;
            this.userProfileImage.token = null;
            this.userProfileImage.type = null;
            this.userProfileImage.uploaded_at = null;
            this.userProfileImage.uploading = null;
            this.userProfileImage.url = null;

            this.userProfile.image = this.userProfileImage;

            if (this.signupForm.valid) {

                if (this._selectedCity === '0000') {
                    cityIdAux = '';
                    cityAux = this.signupForm.value.otherCity;
                } else {
                    cityIdAux = this._selectedCity;
                    cityAux = '';
                }

                Accounts.createUser({
                    email: this.signupForm.value.email,
                    password: this.signupForm.value.password,
                    username: this.signupForm.value.username,
                    profile: this.userProfile
                }, (err) => {
                    this.zone.run(() => {
                        if (err) {
                            this.error = err;
                        } else {
                            UserDetails.insert({
                                user_id: Meteor.userId(),
                                role_id: '100',
                                is_active: true,
                                contact_phone: this.signupForm.value.contactPhone,
                                dni_number: this.signupForm.value.dniNumber,
                                address: this.signupForm.value.shippingAddress,
                                country_id: this._selectedCountry,
                                city_id: cityIdAux,
                                other_city: cityAux
                            });
                            Meteor.logout();
                            this.router.navigate(['signin']);
                        }
                    });
                });
            }

        } else {
            this.showConfirmError = true;
        }
    }

    ngOnDestroy() {
        this._countrySub.unsubscribe();
        this._citySub.unsubscribe();
    }
}