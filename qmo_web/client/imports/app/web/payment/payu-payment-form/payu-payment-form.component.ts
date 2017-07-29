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
import { TrnResponseConfirmComponent } from './transaction-response-confirm/trn-response-confirm.component';
import { getPayuMerchantInfo } from '../../../../../../both/methods/general/parameter.methods';

import { CcPaymentMethods } from '../../../../../../both/collections/payment/cc-payment-methods.collection';
import { CcPaymentMethod } from '../../../../../../both/models/payment/cc-payment-method.model';
import { Countries } from '../../../../../../both/collections/settings/country.collection';
import { Country } from '../../../../../../both/models/settings/country.model';
import { City } from '../../../../../../both/models/settings/city.model';
import { Cities } from '../../../../../../both/collections/settings/city.collection';
import { PaymentTransaction } from '../../../../../../both/models/payment/payment-transaction.model';
import { PaymentTransactions } from '../../../../../../both/collections/payment/payment-transaction.collection';
import { Parameter } from '../../../../../../both/models/general/parameter.model';
import { Parameters } from '../../../../../../both/collections/general/parameter.collection';
import { HistoryPayment } from '../../../../../../both/models/payment/history-payment.model';
import { HistoryPayments } from '../../../../../../both/collections/payment/history-payment.collection';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { CcRequestColombia, Merchant, Transaction, Order, Payer, TX_VALUE, TX_TAX, TX_TAX_RETURN_BASE, CreditCard, ExtraParameters, AdditionalValues, Buyer, ShippingBillingAddress } from '../../../../../../both/models/payment/cc-request-colombia.model';

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
    private _parameterSub: Subscription;
    private _parameters: Observable<Parameter[]>;
    private _historyPaymentSub: Subscription;
    private _historyPayments: Observable<HistoryPayment[]>;
    private _restaurantSub: Subscription;
    private _restaurants: Observable<Restaurant[]>;
    private _restaurantsIdsArray: string[];
    private _restaurantsNamesArray: string[];
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
    private _firstMonthDay: Date;
    private _lastMonthDay: Date;

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

        this._firstMonthDay = new Date(this._currentDate.getFullYear(), this._currentDate.getMonth(), 1);
        this._lastMonthDay = new Date(this._currentDate.getFullYear(), this._currentDate.getMonth() + 1, 0);
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
        this._parameterSub = MeteorObservable.subscribe('getParameters').subscribe();

        this._restaurantSub = MeteorObservable.subscribe('currentRestaurantsNoPayed', Meteor.userId()).subscribe();

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

    /**
    * This function changes de country to select
    *@param {Country} _country
    */
    changeCountry(_country: Country) {
        this._cities = Cities.find({ country: _country._id }).zone();
        this._countryName = _country.name;
    }

    /**
    * This function changes de credit card payment method to select
    *@param {string} _paymentName
    */
    changeCcPaymentLogo(_paymentName: string) {
        this._paymentLogoName = 'images/' + _paymentName + '.png';
        this._ccMethodPayment = _paymentName;
    }

    /**
    * This function opens de dialog to confirm the payment
    */
    openConfirmDialog() {
        let auxstreet: string = this._paymentForm.value.streetOne;

        this._restaurantsNamesArray = [];
        Restaurants.find({ creation_user: Meteor.userId(), isActive: true }).fetch().forEach((restaurant) => {
            this._restaurantsNamesArray.push(restaurant.name);
        });

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
                currency: this._currency,
                restaurantArray: this._restaurantsNamesArray
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
                }, 5000);
            }
        });
    }

    /**
     * This function fills the request object and sends to PayU Rest service
     */
    fillAuthorizationCaptureObject() {
        let paymentTransactionF: PaymentTransaction;
        let paymentTransaction: PaymentTransaction;

        let ccRequestColombia = new CcRequestColombia();
        let merchant = new Merchant();
        let transaction = new Transaction();
        let order = new Order();
        let buyer = new Buyer();
        let buyerShippingAddress = new ShippingBillingAddress();
        let additionalValues = new AdditionalValues();
        let tx_value = new TX_VALUE();
        let tx_tax = new TX_TAX();
        let tx_tax_return_base = new TX_TAX_RETURN_BASE();
        let creditCard = new CreditCard();
        let payer = new Payer();
        let payerBillingAddress = new ShippingBillingAddress();
        let extraParameters = new ExtraParameters();
        let apilogin: string;
        let apikey: string;
        let credentialArray: string[] = [];

        paymentTransactionF = PaymentTransactions.collection.findOne({}, { sort: { count: -1 } });
        if (paymentTransactionF) {
            PaymentTransactions.collection.insert({
                count: paymentTransactionF.count + 1,
                referenceCode: 'M0NP' + (paymentTransactionF.count + 1),
                status: 'PREPARED',
                creation_date: new Date(),
                creation_user: Meteor.userId()
            });
        } else {
            console.log('no tiene transaccion');
            PaymentTransactions.collection.insert({
                count: 51,
                referenceCode: 'M0NP' + 1,
                status: 'PREPARED',
                creation_date: new Date(),
                creation_user: Meteor.userId()
            });
        }

        paymentTransaction = PaymentTransactions.collection.findOne({}, { sort: { count: -1 } });

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
        order.referenceCode = paymentTransaction.referenceCode;
        order.description = this.itemNameTraduction('PAYU_PAYMENT_FORM.ORDER_DESCRIPTION');
        order.language = Meteor.user().profile.language_code;
        //order.notifyUrl = 'http://http://192.168.0.3:3000';
        order.signature = this.generateOrderSignature(apikey, paymentTransaction.referenceCode);

        buyer.merchantBuyerId = Meteor.userId();
        //buyer.fullName = 'Don quijote de la mancha';
        buyer.fullName = 'Carlos Leonardo Gonzalez';
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

        tx_tax.value = this.getValueTax();
        tx_tax.currency = this._currency;
        additionalValues.TX_TAX = tx_tax;

        tx_tax_return_base.value = this.getReturnBase();
        tx_tax_return_base.currency = this._currency;
        additionalValues.TX_TAX_RETURN_BASE = tx_tax_return_base;

        order.additionalValues = additionalValues;
        buyer.shippingAddress = buyerShippingAddress;
        order.buyer = buyer;

        creditCard.number = this._paymentForm.value.cardNumber;
        creditCard.securityCode = this._paymentForm.value.securityCode;
        creditCard.expirationDate = this._selectedCardYear + '/' + this._selectedCardMonth;
        //creditCard.name = this._paymentForm.value.fullName;
        creditCard.name = 'PENDING';

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

        let transactionMessage: string;
        let transactionIcon: string;
        let showCancelBtn: boolean = false;

        this._payuPaymentService.authorizeAndCapture(ccRequestColombia).subscribe(
            response => {
                console.log(JSON.stringify(response));

                if (response.code == 'ERROR') {
                    console.log(' *** respuesta de error');
                    transactionMessage = 'PAYU_PAYMENT_FORM.AUTH_ERROR_MSG';
                    transactionIcon = 'trn_declined.png';
                    showCancelBtn = true;
                } else if (response.code == 'SUCCESS') {
                    showCancelBtn = false;
                    switch (response.transactionResponse.state) {
                        case "APPROVED": {
                            console.log(' *** aprobación');
                            this.insertHistoryUpdateTransaction(response, paymentTransaction._id);
                            transactionMessage = 'PAYU_PAYMENT_FORM.TRANSACTION_APPROVED';
                            transactionIcon = 'trn_approved.png';
                            break;
                        }
                        case "DECLINED": {
                            console.log(' *** rechazada');
                            this.insertHistoryUpdateTransaction(response, paymentTransaction._id);
                            transactionMessage = 'PAYU_PAYMENT_FORM.TRANSACTION_DECLINED';
                            transactionIcon = 'trn_declined.png';
                            break;
                        }
                        case "PENDING": {
                            console.log(' *** pendiente');
                            this.insertHistoryUpdateTransaction(response, paymentTransaction._id);
                            transactionMessage = 'PAYU_PAYMENT_FORM.TRANSACTION_PENDING';
                            transactionIcon = 'trn_pending.png';
                            break;
                        }
                        case "EXPIRED": {
                            console.log(' *** expirada');
                            this.insertHistoryUpdateTransaction(response, paymentTransaction._id);
                            transactionMessage = 'PAYU_PAYMENT_FORM.TRANSACTION_EXPIRED';
                            transactionIcon = 'trn_declined.png';
                            break;
                        }
                        default: {
                            console.log("*** error");
                            this.insertHistoryUpdateTransaction(response, paymentTransaction._id);
                            transactionMessage = 'PAYU_PAYMENT_FORM.TRANSACTION_ERROR';
                            transactionIcon = 'trn_declined.png';
                            break;
                        }
                    }
                }
                this._loading = false;
                this._mdDialogRef2 = this._mdDialog.open(TrnResponseConfirmComponent, {
                    disableClose: true,
                    data: {
                        transactionResponse: transactionMessage,
                        transactionImage: transactionIcon,
                        showCancel: showCancelBtn
                    },
                });

                this._mdDialogRef2.afterClosed().subscribe(result => {
                    this._mdDialogRef2 = result;
                    if (result.success) {
                        this._router.navigate(['app/history-payment']);
                    }
                });
            },
            error => {
                alert(error);
            }
        );
    }

    /**
     * This function inserts the history Payment status and update the payment transaction 
     * @param {string} _status
     * */
    insertHistoryUpdateTransaction(_response: any, _transactionId: string) {

        PaymentTransactions.collection.update({ _id: _transactionId },
            {
                $set: {
                    status: _response.transactionResponse.state,
                    responseCode: _response.transactionResponse.responseCode,
                    responseOrderId: _response.transactionResponse.orderId,
                    responsetransactionId: _response.transactionResponse.transactionId,
                    modification_date: new Date(),
                    modification_user: Meteor.userId()
                }
            });

        let transactionId = PaymentTransactions.collection.findOne({ _id: _transactionId })._id;

        this._restaurantsIdsArray = [];
        Restaurants.find({ creation_user: Meteor.userId(), isActive: true }).fetch().forEach((restaurant) => {
            this._restaurantsIdsArray.push(restaurant._id);
        });

        HistoryPayments.collection.insert({
            restaurantIds: this._restaurantsIdsArray,
            startDate: this._firstMonthDay,
            endDate: this._lastMonthDay,
            month: (this._currentDate.getMonth() + 1).toString(),
            year: (this._currentDate.getFullYear()).toString(),
            status: 'TRANSACTION_STATUS.' + _response.transactionResponse.state,
            transactionId: transactionId,
            paymentValue: this._valueToPay,
            currency: this._currency,
            creation_date: new Date(),
            creation_user: Meteor.userId()
        });
    }

    /**
     * This function gets the tax value according to the value
     * @param {number} _value
     */
    getValueTax(): number {
        let percentValue: number;
        let parameterTax: Parameter = Parameters.findOne({ name: 'colombia_tax_iva' });
        percentValue = Number(parameterTax.value);
        return (this._valueToPay * percentValue) / 100;
    }

    /**
     * This function gets the tax value according to the value
     * @param {number} _value
     */
    getReturnBase(): number {
        let amountPercent: number = this.getValueTax();
        return this._valueToPay - amountPercent;
    }

    /**
    * This function generates the order signature to fill request object
    * @param {string} _apikey
    * @param {string} _referenceCode
    * @return {string}
    */
    generateOrderSignature(_apikey: string, _referenceCode): string {
        let merchantId: string = '508029';
        let signatureEncoded: string = md5(_apikey + '~' + merchantId + '~' + _referenceCode + '~' + this._valueToPay + '~' + this._currency);
        return signatureEncoded;
    }

    /**
     * Function to translate information
     * @param {string} _itemName
     * @return {string}
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
        this._parameterSub.unsubscribe();
        this._restaurantSub.unsubscribe();
    }
}