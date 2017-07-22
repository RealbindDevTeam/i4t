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
import { TransactionResponseConfirmComponent } from './transaction-response-confirm/transaction-response-confirm';
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
    private _mdDialogRef2: MdDialogRef<any>;
    private _countryName: string;
    private _ccMethodPayment: string;
    private _session_id: string;
    private _timestamp: string;
    private _ipAddress: string;
    private _userAgent: string;
    private _sessionUserId: string;
    private _loading: boolean;

    private _valueToPay: number;
    private _currency: string;
    private post: any;
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

        let _scriptOne: string = 'url(https://maf.pagosonline.net/ws/fp?id=';
        let _scriptTwo: string = 'https://maf.pagosonline.net/ws/fp/clear.png?id=';
        let _scriptThree: string = 'https://maf.pagosonline.net/ws/fp/check.js?id=';
        let _scriptFour: string = 'https://maf.pagosonline.net/ws/fp/fp.swf?id=';

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

        this._paymentTransactionSub = MeteorObservable.subscribe('getTransactions').subscribe();

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
        let auxstreet: string = this._paymentForm.value.streetOne;

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
                this._loading = true;
                setTimeout(() => {
                    this.fillAuthorizationCaptureObject();
                    this._loading = false;
                }, 5000);
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

        paymentTransaction = PaymentTransactions.collection.findOne({}, { sort: { count: -1 } });
        if (paymentTransaction) {
            PaymentTransactions.collection.insert({
                count: paymentTransaction.count + 1,
                referenceName: 'MONP' + (paymentTransaction.count + 1),
                status: 'PENDING',
                creation_date: new Date(),
                creation_user: Meteor.userId()
            });
        } else {
            console.log('no tiene transaccion');
            PaymentTransactions.collection.insert({
                count: 1,
                referenceName: 'MONP' + 1,
                status: 'PENDING',
                creation_date: new Date(),
                creation_user: Meteor.userId()
            });
        }

        paymentTransaction = PaymentTransactions.collection.findOne({ creation_user: Meteor.userId() }, { sort: { count: -1 } });

        credentialArray = getPayuMerchantInfo();
        apilogin = credentialArray[0];
        apikey = credentialArray[1];

        ccRequestColombia.language = Meteor.user().profile.language_code;
        ccRequestColombia.command = 'SUBMIT_TRANSACTION';
        merchant.apiLogin = apilogin;
        merchant.apiKey = apikey;
        ccRequestColombia.merchant = merchant;

        order.accountId = 512321;
        //order.referenceCode = 'monthly_payment_000000005';
        order.referenceCode = paymentTransaction.referenceName;
        order.description = this.itemNameTraduction('PAYU_PAYMENT_FORM.ORDER_DESCRIPTION');
        order.language = Meteor.user().profile.language_code;
        order.notifyUrl = 'http://http://192.168.0.3:3000';
        order.signature = this.generateOrderSignature(apikey, paymentTransaction.referenceName);

        buyer.merchantBuyerId = Meteor.userId();
        //buyer.fullName = 'Don quijote de la mancha';
        buyer.fullName = this._paymentForm.value.fullName;
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
        creditCard.name = 'EXPIRED';

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

        console.log('OBJETO ES: ');
        console.log(ccRequestColombia);
        console.log(JSON.stringify(ccRequestColombia));

        this._payuPaymentService.authorizeAndCapture(ccRequestColombia).subscribe(
            response => {
                console.log(JSON.stringify(response));

                if (response.code == 'ERROR') {
                    console.log(' *** respuesta de error');
                } else if (response.code == 'SUCCESS') {
                    switch (response.transactionResponse.state) {
                        case "APPROVED": {
                            console.log(' *** aprobación');
                            break;
                        }
                        case "DECLINED": {
                            console.log(' *** rechazada');
                            break;
                        }
                        case "PENDING": {
                            console.log(' *** pendiente');
                            break;
                        }
                        case "EXPIRED": {
                            console.log(' *** expirada');
                            break;
                        }
                        default: {
                            console.log("*** error");
                            break;
                        }
                    }
                }

                /*
                this._mdDialogRef2 = this._mdDialog.open(TransactionResponseConfirmComponent, {
                    disableClose: true,
                    data: {
                        status: 'APROBADO SI SR',
                    },
                });

                this._mdDialogRef2.afterClosed().subscribe(result => {
                    this._mdDialogRef2 = result;
                    if (result.success) {
                        console.log('REENVÍO ');
                    }
                });

                */
            },
            error => {
                console.log(error);
            }
        );

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

    /**
     * Function to translate information
     * @param {string} _itemName
     */
    itemNameTraduction(_itemName: string): string {
        var _wordTraduced: string;
        this._translate.get(_itemName).subscribe((res: string) => {
            _wordTraduced = res;
        });
        return _wordTraduced;
    }

    ngOnDestroy() {
        this._cCPaymentMethodSub.unsubscribe();
        this._countrySub.unsubscribe();
        this._citySub.unsubscribe();
        this._paymentTransactionSub.unsubscribe();
    }
}