import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { CustomValidators } from '../../../../../../both/shared-components/validators/custom-validator';

import { CcPaymentMethods } from '../../../../../../both/collections/payment/cc-payment-methods.collection';
import { CcPaymentMethod } from '../../../../../../both/models/payment/cc-payment-method.model';

import { PayuPaymenteService } from '../payu-payment-service/payu-payment.service';

import template from './payu-payment-form.component.html';
import style from './payu-payment-form.component.scss';

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
    private _cCPaymentMethodSub: Subscription;
    private _cCPaymentMethods: Observable<CcPaymentMethod[]>;
    private _currentDate: Date;
    private _currentYear: number;
    private _yearsArray: any[];
    private _monthsArray: any[];

    private mensaje: string;
    private planObj: any;
    private post: any;

    constructor(private _router: Router, private _activateRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _translate: TranslateService,
        private _payuPaymentService: PayuPaymenteService,
        private _ngZone: NgZone) {

        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);

        //this.getCode();
    }

    ngOnInit() {
        this._activateRoute.params.forEach((params: Params) => {
            this.mensaje = params['param'];
        });

        this._paymentForm = new FormGroup({
            paymentMethod: new FormControl('', [Validators.required]),
            cardNumber: new FormControl('', [Validators.required, Validators.minLength(13), Validators.maxLength(20), CustomValidators.numericValidator]),
            expirationMonth: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
            expirationYear: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]),
            securityCode: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(4)])
        });

        this._cCPaymentMethodSub = MeteorObservable.subscribe('getCcPaymentMethods').subscribe(() => {
            this._ngZone.run(() => {
                this._cCPaymentMethods = CcPaymentMethods.find({}).zone();
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