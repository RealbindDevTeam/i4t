import { Meteor } from 'meteor/meteor';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { CustomValidators } from '../../../../../../both/shared-components/validators/custom-validator';
import { CcPaymentConfirmComponent } from './cc-payment-confirm/cc-payment-confirm.component';

import { CcPaymentMethods } from '../../../../../../both/collections/payment/cc-payment-methods.collection';
import { CcPaymentMethod } from '../../../../../../both/models/payment/cc-payment-method.model';
import { Countries } from '../../../../../../both/collections/settings/country.collection';
import { Country } from '../../../../../../both/models/settings/country.model';
import { City } from '../../../../../../both/models/settings/city.model';
import { Cities } from '../../../../../../both/collections/settings/city.collection';

import { PayuPaymenteService } from '../payu-payment-service/payu-payment.service';

import template from './payu-payment-form.component.html';
import style from './payu-payment-form.component.scss';

let md5 = require('md5');

@Component({
    selector: 'payu-payment-form',
    template,
    styles: [style]
})

export class PayuPaymentFormComponent implements OnInit, OnDestroy {

    private _paymentForm: FormGroup = new FormGroup({});
    private _selectedPaymentMethod: string;
    private _selectedCardMonth: string;
    private _selectedCardYear: string;
    private _selectedCountry: string;
    private _selectedCity: string = "";
    private _cCPaymentMethodSub: Subscription;
    private _cCPaymentMethods: Observable<CcPaymentMethod[]>;
    private _countrySub: Subscription;
    private _countries: Observable<Country[]>;
    private _citySub: Subscription;
    private _cities: Observable<City[]>;
    private _currentDate: Date;
    private _currentYear: number;
    private _yearsArray: any[];
    private _monthsArray: any[];
    private _paymentLogoName: string = "";
    private _deviceSessionId: string;
    private _mdDialogRef: MdDialogRef<any>;

    private valueToPay: string;
    private post: any;

    constructor(private _router: Router, private _activateRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _translate: TranslateService,
        private _payuPaymentService: PayuPaymenteService,
        private _ngZone: NgZone,
        public _mdDialog: MdDialog) {

        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);

        //this.getCode();
        console.log(localStorage.getItem('Meteor.loginToken'));
        this._deviceSessionId = md5(localStorage.getItem('Meteor.loginToken'));
        console.log(this._deviceSessionId);
    }

    ngOnInit() {
        this._activateRoute.params.forEach((params: Params) => {
            this.valueToPay = params['param'];
        });

        console.log('el precio es > ' + this.valueToPay);

        this._paymentForm = new FormGroup({
            paymentMethod: new FormControl('', [Validators.required]),
            cardNumber: new FormControl('', [Validators.required, Validators.minLength(13), Validators.maxLength(20), CustomValidators.numericValidator]),
            expirationMonth: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
            expirationYear: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]),
            securityCode: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(4), CustomValidators.numericValidator]),
            email: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(255), CustomValidators.emailValidator]),
            fullName: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(150)]),
            dniNumber: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]),
            country: new FormControl('', [Validators.required]),
            city: new FormControl('', [Validators.required]),
            streetOne: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]),
            contactPhone: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(20)])
        });

        this._cCPaymentMethodSub = MeteorObservable.subscribe('getCcPaymentMethods').subscribe(() => {
            this._ngZone.run(() => {
                this._cCPaymentMethods = CcPaymentMethods.find({}).zone();
            });
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

        this._monthsArray = [{ value: '01', viewValue: '01' }, { value: '02', viewValue: '02' }, { value: '03', viewValue: '03' },
        { value: '04', viewValue: '04' }, { value: '05', viewValue: '05' }, { value: '06', viewValue: '06' },
        { value: '07', viewValue: '07' }, { value: '08', viewValue: '08' }, { value: '09', viewValue: '09' },
        { value: '10', viewValue: '10' }, { value: '11', viewValue: '11' }, { value: '12', viewValue: '12' }];

        this._currentDate = new Date();
        this._currentYear = this._currentDate.getFullYear();
        this._yearsArray = [];
        this._yearsArray.push({ value: this._currentYear, viewValue: this._currentYear });

        for (let i = 1; i <= 25; i++) {
            let auxYear = { value: this._currentYear + i, viewValue: this._currentYear + i };
            this._yearsArray.push(auxYear);
        }
    }

    changeCountry(countryId: string) {
        this._cities = Cities.find({ country: countryId }).zone();
    }

    changeCcPaymentLogo(paymentName: string) {
        this._paymentLogoName = 'images/' + paymentName + '.png';
    }

    openConfirmDialog() {
        console.log(md5('4Vj8eK4rloUd272L48hsrarnUA~508029~TestPayU~3~USD'));
        console.log(localStorage.getItem('Meteor.loginToken'));

        let auxstreet: string = this._paymentForm.value.streetOne;
        console.log('&&&&' + auxstreet);

        this._mdDialogRef = this._mdDialog.open(CcPaymentConfirmComponent, {
            disableClose: true,
            data: {
                uno: this._paymentForm.value.streetOne,
                dos: 'dosp'
            },
            height: '90%',
            width: '40%'
        });


        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = result;


        });
    }

    getCode() {
        this._payuPaymentService.getTestPing().subscribe(
            pingResult => {
                this.post = pingResult;
                console.log('+++');
                console.log(this.post);
            },
            error => {
                console.log(error);
            }
        );
    }

    ngOnDestroy() {

    }
}