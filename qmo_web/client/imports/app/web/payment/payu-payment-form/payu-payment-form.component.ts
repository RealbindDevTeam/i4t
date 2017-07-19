import { Meteor } from 'meteor/meteor';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { CustomValidators } from '../../../../../../both/shared-components/validators/custom-validator';
import { CcPaymentConfirmComponent } from './cc-payment-confirm/cc-payment-confirm.component';
import { getPayuMerchantInfo } from '../../../../../../both/methods/general/parameter.methods';

import { CcPaymentMethods } from '../../../../../../both/collections/payment/cc-payment-methods.collection';
import { CcPaymentMethod } from '../../../../../../both/models/payment/cc-payment-method.model';
import { Countries } from '../../../../../../both/collections/settings/country.collection';
import { Country } from '../../../../../../both/models/settings/country.model';
import { City } from '../../../../../../both/models/settings/city.model';
import { Cities } from '../../../../../../both/collections/settings/city.collection';
import { CcRequestColombia, Merchant, Transaction, Order, Payer, TX_VALUE, CreditCard, ExtraParameters, AdditionalValues, Buyer, ShippingBillingAddress } from '../../../../../../both/models/payment/cc-request-colombia.model';
import { PaymentTransaction } from '../../../../../../both/models/payment/payment-transaction.model';
import { PaymentTransactions } from '../../../../../../both/collections/payment/payment-transaction.collection';

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
    private _paymentTransactionSub: Subscription;
    private _paymentTransactions: Observable<PaymentTransaction[]>;
    private _currentDate: Date;
    private _currentYear: number;
    private _yearsArray: any[];
    private _monthsArray: any[];
    private _paymentLogoName: string = "";
    private _deviceSessionId: string;
    private _mdDialogRef: MdDialogRef<any>;
    private _countryName: string;
    private _ccMethodPayment: string;
    private _session_id: string;
    private _timestamp: string;
    private _ipAddress: string;
    private _userAgent: string;
    private _sessionUserId: string;

    private _valueToPay: number;
    private _currency: string;
    private post: any;
    private color: string = 'red';
    private colorM: any;
    private scriptOneSanitized: any;
    private scriptTwoSanitized: any;
    private scriptThreeSanitized: any;
    private scriptFourSanitized: any;

    constructor(private _router: Router, private _activateRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _translate: TranslateService,
        private _payuPaymentService: PayuPaymenteService,
        private _ngZone: NgZone,
        public _mdDialog: MdDialog,
        private _domSanitizer: DomSanitizer) {

        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);

        this._currentDate = new Date();

        this._session_id = localStorage.getItem('Meteor.loginToken');
        this._timestamp = this._currentDate.getTime().toString();
        this._deviceSessionId = md5(this._session_id + this._timestamp);
        this._sessionUserId = this._deviceSessionId + Meteor.userId();

        console.log('Meteor.loginToken > ' + this._session_id);
        //console.log('window.performance.now()' + window.performance.now());
        console.log('Date.getTime() > ' + this._timestamp);
        //console.log('Meteor.loginToken encriptado > ' + this._deviceSessionId);
        console.log('_deviceSessionId > ' + this._deviceSessionId);

        console.log('_sessionUserId > ' + this._sessionUserId);

        this.colorM = this._domSanitizer.bypassSecurityTrustStyle(this.color);

        let _scriptOne: string = 'url(https://maf.pagosonline.net/ws/fp?id=';
        let _scriptTwo: string = 'https://maf.pagosonline.net/ws/fp/clear.png?id=';
        let _scriptThree: string = 'https://maf.pagosonline.net/ws/fp/check.js?id=';
        let _scriptFour: string = 'https://maf.pagosonline.net/ws/fp/fp.swf?id=';
        console.log('_scriptOne+this._sessionUserId > ' + _scriptOne + this._sessionUserId + ')');
        this.scriptOneSanitized = this._domSanitizer.bypassSecurityTrustStyle(_scriptOne + this._sessionUserId + ')');
        this.scriptTwoSanitized = this._domSanitizer.bypassSecurityTrustUrl(_scriptTwo + this._sessionUserId);
        this.scriptThreeSanitized = this._domSanitizer.bypassSecurityTrustResourceUrl(_scriptThree + this._sessionUserId);
        this.scriptFourSanitized = this._domSanitizer.bypassSecurityTrustResourceUrl(_scriptFour + this._sessionUserId);
    }

    ngOnInit() {
        this._activateRoute.params.forEach((params: Params) => {
            this._valueToPay = params['param1'];
            this._currency = params['param2'];
        });

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

        this._paymentTransactionSub = MeteorObservable.subscribe('getUserTransactions', Meteor.userId()).subscribe();

        this._monthsArray = [{ value: '01', viewValue: '01' }, { value: '02', viewValue: '02' }, { value: '03', viewValue: '03' },
        { value: '04', viewValue: '04' }, { value: '05', viewValue: '05' }, { value: '06', viewValue: '06' },
        { value: '07', viewValue: '07' }, { value: '08', viewValue: '08' }, { value: '09', viewValue: '09' },
        { value: '10', viewValue: '10' }, { value: '11', viewValue: '11' }, { value: '12', viewValue: '12' }];

        this._currentYear = this._currentDate.getFullYear();
        this._yearsArray = [];
        this._yearsArray.push({ value: this._currentYear, viewValue: this._currentYear });

        for (let i = 1; i <= 25; i++) {
            let auxYear = { value: this._currentYear + i, viewValue: this._currentYear + i };
            this._yearsArray.push(auxYear);
        }

        this._payuPaymentService.getPublicIp().subscribe(
            ipPublic => {
                this._ipAddress = ipPublic.ip;
            },
            error => {
                console.log(error);
            }
        );

        this._userAgent = navigator.userAgent;
    }

    changeCountry(_country: Country) {
        this._cities = Cities.find({ country: _country._id }).zone();
        this._countryName = _country.name;
    }

    changeCcPaymentLogo(_paymentName: string) {
        this._paymentLogoName = 'images/' + _paymentName + '.png';
        this._ccMethodPayment = _paymentName;
    }

    getIP(json) {
        document.write("My public IP address is: ", json.ip);
    }

    openConfirmDialog() {
        //console.log(md5('4Vj8eK4rloUd272L48hsrarnUA~508029~TestPayU~3~USD'));
        //console.log(localStorage.getItem('Meteor.loginToken'));

        let auxstreet: string = this._paymentForm.value.streetOne;
        //console.log('&&&&' + auxstreet);

        this._mdDialogRef = this._mdDialog.open(CcPaymentConfirmComponent, {
            disableClose: true,
            data: {
                streetone: this._paymentForm.value.streetOne,
                city: this._selectedCity,
                country: this._countryName,
                fullname: this._paymentForm.value.fullName,
                telephone: this._paymentForm.value.contactPhone,
                ccmethod: this._paymentLogoName,
                cardnumber: this._paymentForm.value.cardNumber,
                price: this._valueToPay,
                currency: this._currency
            },
            height: '85%',
            width: '51,5%'
        });


        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = result;
            if (result.success) {
                console.log('ENVÍO DE OBJETO A PAYU SERVICE');

                //this.getCode();
                this.fillAuthorizationCaptureObject();
            }
        });
    }

    /**
     * This function fills the request object to sends to PayU
     */
    fillAuthorizationCaptureObject() {

        let paymentTransaction: PaymentTransaction;

        let ccRequestColombia = new CcRequestColombia();
        let merchant = new Merchant();
        let transaction = new Transaction();
        let order = new Order();
        let buyer = new Buyer();
        let buyerShippingAddress = new ShippingBillingAddress();
        let additionalValues = new AdditionalValues();
        let tx_value = new TX_VALUE();
        let creditCard = new CreditCard();
        let payer = new Payer();
        let payerBillingAddress = new ShippingBillingAddress();
        let extraParameters = new ExtraParameters();

        let apilogin: string;
        let apikey: string;
        let credentialArray: string[] = [];

        paymentTransaction = PaymentTransactions.collection.findOne({ creation_user: Meteor.userId() }, { sort: { count: -1 } });
        if (paymentTransaction) {
            console.log('si tiene transaccion');

            PaymentTransactions.collection.insert({
                count: paymentTransaction.count + 1,
                referenceName: 'monthly_' + Meteor.userId() + '_' + (paymentTransaction.count + 1),
                status: 'PENDING',
                creation_date: new Date(),
                creation_user: Meteor.userId()
            });
        } else {
            console.log('no tiene transaccion');
            PaymentTransactions.collection.insert({
                count: 1,
                referenceName: 'monthly_' + Meteor.userId() + '_' + 1,
                status: 'PENDING',
                creation_date: new Date(),
                creation_user: Meteor.userId()
            });
        }

        paymentTransaction = PaymentTransactions.collection.findOne({ creation_user: Meteor.userId() }, { sort: { count: -1 } });

        credentialArray = getPayuMerchantInfo();
        apilogin = credentialArray[0];
        apikey = credentialArray[1];

        ccRequestColombia.language = 'en';
        ccRequestColombia.command = 'SUBMIT_TRANSACTION';
        merchant.apiLogin = apilogin;
        merchant.apiKey = apikey;
        ccRequestColombia.merchant = merchant;

        order.accountId = 512321;
        //order.referenceCode = 'monthly_payment_000000005';
        order.referenceCode = paymentTransaction.referenceName;
        order.description = 'monthly payment for ' + paymentTransaction.creation_user + ' number ' + paymentTransaction.count;
        order.language = Meteor.user().profile.language_code;
        order.notifyUrl = 'http://http://192.168.0.3:3000';
        order.signature = this.generateOrderSignature(apikey, paymentTransaction.referenceName);

        buyer.merchantBuyerId = Meteor.userId();
        //buyer.fullName = 'Don quijote de la mancha';
        buyer.fullName = 'APPROVED';
        buyer.emailAddress = Meteor.user().emails[0].address;
        buyer.contactPhone = '9876543213';
        buyer.dniNumber = '1231238998712'

        //buyer shipping address
        buyerShippingAddress.street1 = 'Calle falsa 123';
        buyerShippingAddress.city = 'Bogota';
        buyerShippingAddress.country = 'CO';

        //aditional values
        tx_value.value = Number(this._valueToPay);
        tx_value.currency = this._currency;
        additionalValues.TX_VALUE = tx_value;

        order.additionalValues = additionalValues;
        buyer.shippingAddress = buyerShippingAddress;
        order.buyer = buyer;

        creditCard.number = this._paymentForm.value.cardNumber;
        creditCard.securityCode = this._paymentForm.value.securityCode;
        creditCard.expirationDate = this._selectedCardYear + '/' + this._selectedCardMonth;
        //creditCard.name = this._paymentForm.value.fullName;
        creditCard.name = 'APPROVED';

        payer.fullName = this._paymentForm.value.fullName;
        payer.emailAddress = this._paymentForm.value.email;
        payer.contactPhone = this._paymentForm.value.contactPhone;
        payer.dniNumber = this._paymentForm.value.dniNumber;

        payerBillingAddress.street1 = this._paymentForm.value.streetOne;
        payerBillingAddress.city = this._selectedCity;
        payerBillingAddress.country = this._selectedCountry;
        payer.billingAddress = payerBillingAddress;

        extraParameters.INSTALLMENTS_NUMBER = 1;

        transaction.order = order;
        transaction.payer = payer;
        transaction.creditCard = creditCard;
        transaction.extraParameters = extraParameters;

        transaction.type = 'AUTHORIZATION_AND_CAPTURE';
        transaction.paymentMethod = this._selectedPaymentMethod;
        transaction.paymentCountry = 'CO';

        transaction.deviceSessionId = this._deviceSessionId;
        transaction.ipAddress = this._ipAddress;
        transaction.cookie = this._session_id;
        transaction.userAgent = this._userAgent;

        ccRequestColombia.transaction = transaction;
        ccRequestColombia.test = true;

        console.log('language > ' + ccRequestColombia.language);
        console.log('command > ' + ccRequestColombia.command);
        console.log('test > ' + ccRequestColombia.test);
        console.log('merchant.apiLogin > ' + merchant.apiLogin);
        console.log('merchant.apiKey > ' + merchant.apiKey);
        console.log('order.accountId > ' + order.accountId);
        console.log('order.referenceCode > ' + order.referenceCode);
        console.log('order.description > ' + order.description);
        console.log('order.language > ' + order.language);
        console.log('order.notifyUrl > ' + order.notifyUrl);
        console.log('order.signature > ' + order.signature);
        console.log('buyer.merchantBuyerId > ' + buyer.merchantBuyerId);
        console.log('buyer.fullName > ' + buyer.fullName);
        console.log('buyer.emailAddress > ' + buyer.emailAddress);
        console.log('buyer.contactPhone > ' + buyer.contactPhone);
        console.log('buyer.dniNumber > ' + buyer.dniNumber);
        console.log('buyerShippingAddress.street1 > ' + buyerShippingAddress.street1);
        console.log('buyerShippingAddress.city > ' + buyerShippingAddress.city);
        console.log('buyerShippingAddress.country > ' + buyerShippingAddress.country);
        console.log('tx_value.value > ' + tx_value.value);
        console.log('tx_value.currency > ' + tx_value.currency);
        console.log('creditCard.number > ' + creditCard.number);
        console.log('creditCard.securityCode > ' + creditCard.securityCode);
        console.log('creditCard.expirationDate > ' + creditCard.expirationDate);
        console.log('creditCard.name > ' + creditCard.name);
        console.log('payer.emailAddress > ' + payer.emailAddress);
        console.log('payer.fullName > ' + payer.fullName);
        console.log('payerBillingAddress.street1 > ' + payerBillingAddress.street1);
        console.log('payerBillingAddress.city > ' + payerBillingAddress.city);
        console.log('payerBillingAddress.country > ' + payerBillingAddress.country);
        console.log('payer.contactPhone > ' + payer.contactPhone);
        console.log('payer.dniNumber > ' + payer.dniNumber);
        console.log('transaction.type > ' + transaction.type);
        console.log('transaction.paymentMethod > ' + transaction.paymentMethod);
        console.log('transaction.paymentCountry > ' + transaction.paymentCountry);
        console.log('transaction.deviceSessionId > ' + transaction.deviceSessionId);
        console.log('transaction.ipAddress > ' + transaction.ipAddress);
        console.log('transaction.cookie > ' + transaction.cookie);
        console.log('transaction.userAgent > ' + transaction.userAgent);


        console.log('OBJETO ES: ');
        console.log(ccRequestColombia);
        console.log(JSON.stringify(ccRequestColombia));

    }

    generateOrderSignature(_apikey: string, _referenceCode): string {
        let merchantId: string = '508029';
        let signatureEncoded: string = md5(_apikey + '~' + merchantId + '~' + _referenceCode + '~' + this._valueToPay + '~' + this._currency);
        return signatureEncoded;
    }


    getCode() {
        let pingObj: {} = {
            test: false,
            language: "en",
            command: "PING",
            merchant: {
                apiLogin: "pRRXKOl8ikMmt9u",
                apiKey: "4Vj8eK4rloUd272L48hsrarnUA"
            }
        };

        console.log('obj es: ' + JSON.stringify(pingObj));
        this._payuPaymentService.getTestPing(pingObj).subscribe(
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

    cancel() {
        this._router.navigate(['app/monthly-payment']);
    }

    ngOnDestroy() {
        this._cCPaymentMethodSub.unsubscribe();
        this._countrySub.unsubscribe();
        this._citySub.unsubscribe();
        this._paymentTransactionSub.unsubscribe();
    }
}