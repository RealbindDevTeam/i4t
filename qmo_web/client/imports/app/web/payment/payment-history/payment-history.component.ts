import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { VerifyResultComponent } from './verify-result/verify-result.component';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { PaymentsHistory } from '../../../../../../both/collections/payment/payment-history.collection';
import { PaymentHistory } from '../../../../../../both/models/payment/payment-history.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { ResponseQuery, Merchant, Details } from '../../../../../../both/models/payment/response-query.model';
import { PaymentTransactions } from '../../../../../../both/collections/payment/payment-transaction.collection';
import { PaymentTransaction } from '../../../../../../both/models/payment/payment-transaction.model';
import { Tables } from '../../../../../../both/collections/restaurant/table.collection';
import { Table } from '../../../../../../both/models/restaurant/table.model';
import { AlertConfirmComponent } from '../../../web/general/alert-confirm/alert-confirm.component';
import { Parameter } from '../../../../../../both/models/general/parameter.model';
import { Parameters } from '../../../../../../both/collections/general/parameter.collection';
import { UserDetail } from '../../../../../../both/models/auth/user-detail.model';
import { UserDetails } from '../../../../../../both/collections/auth/user-detail.collection';
import { City } from '../../../../../../both/models/settings/city.model';
import { Cities } from '../../../../../../both/collections/settings/city.collection';
import { Country } from '../../../../../../both/models/settings/country.model';
import { Countries } from '../../../../../../both/collections/settings/country.collection';

import { PayuPaymenteService } from '../payu-payment-service/payu-payment.service';

import template from './payment-history.component.html';
import style from './payment-history.component.scss';

let jsPDF = require('jspdf');
let base64 = require('base-64');

@Component({
    selector: 'payment-history',
    template,
    styles: [style]
})
export class PaymentHistoryComponent implements OnInit, OnDestroy {

    private _historyPaymentSub: Subscription;
    private _restaurantSub: Subscription;
    private _paymentTransactionSub: Subscription;
    private _parameterSub: Subscription;
    private _userDetailSub: Subscription;
    private _countrySub: Subscription;
    private _citySub: Subscription;

    private _historyPayments: Observable<PaymentHistory[]>;
    private _historyPayments2: Observable<PaymentHistory[]>;
    private _paymentTransactions: Observable<PaymentTransaction[]>;
    private _restaurants: Observable<Restaurant[]>;

    private _selectedMonth: string;
    private _selectedYear: string;
    private _yearsArray: any[];
    private _monthsArray: any[];
    private _currentDate: Date;
    private _currentYear: number;
    private _activateMonth: boolean;
    private _loading: boolean;
    private _mdDialogRef: MdDialogRef<any>;
    private titleMsg: string;
    private btnAcceptLbl: string;
    private _thereArePaymentsHistory: boolean = true;

    private al: string;
    private ak: string;

    /**
     * PaymentHistoryComponent Constructor
     * @param {Router} _router 
     * @param {FormBuilder} _formBuilder 
     * @param {TranslateService} _translate 
     * @param {MdDialog} _mdDialog 
     * @param {PayuPaymenteService} _payuPaymentService 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor(private _router: Router,
        private _formBuilder: FormBuilder,
        private _translate: TranslateService,
        public _mdDialog: MdDialog,
        private _payuPaymentService: PayuPaymenteService,
        private _ngZone: NgZone,
        private _userLanguageService: UserLanguageService) {
        _translate.use(this._userLanguageService.getLanguage(Meteor.user()));
        _translate.setDefaultLang('en');

        this._currentDate = new Date();
        this._activateMonth = true;

        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit() {
        this.removeSubscriptions();

        this._userDetailSub = MeteorObservable.subscribe('getUserDetailsByUser', Meteor.userId()).subscribe();
        this._countrySub = MeteorObservable.subscribe('countries').subscribe();
        this._citySub = MeteorObservable.subscribe('cities').subscribe();
        this._historyPaymentSub = MeteorObservable.subscribe('getHistoryPaymentsByUser', Meteor.userId()).subscribe(() => {
            this._historyPayments = PaymentsHistory.find({
                creation_user: Meteor.userId(),
                creation_date: {
                    $gte: new Date(new Date().getFullYear(), 0, 1),
                    $lte: new Date(new Date().getFullYear(), 11, 31)
                }
            },
                { sort: { creation_date: -1 } }).zone();
        });

        this._historyPayments2 = PaymentsHistory.find({ creation_user: Meteor.userId() });
        this.countPaymentsHistory();
        this._historyPayments2.subscribe(() => { this.countPaymentsHistory(); });

        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe();
        this._paymentTransactionSub = MeteorObservable.subscribe('getTransactionsByUser', Meteor.userId()).subscribe();

        this._parameterSub = MeteorObservable.subscribe('getParameters').subscribe(() => {
            this._ngZone.run(() => {

                let payInfoUrl = Parameters.findOne({ name: 'payu_pay_info_url' }).value;
                this._payuPaymentService.getCusPayInfo(payInfoUrl).subscribe(
                    payInfo => {
                        this.al = payInfo.al;
                        this.ak = payInfo.ak;
                    },
                    error => {

                        this.openDialog(this.titleMsg, '', JSON.stringify(error), '', this.btnAcceptLbl, false);
                    }
                );
            });
        });

        this._currentYear = this._currentDate.getFullYear();
        this._yearsArray = [];
        this._yearsArray.push({ value: this._currentYear, viewValue: this._currentYear });

        for (let i = 1; i <= 2; i++) {
            let auxYear = { value: this._currentYear - i, viewValue: this._currentYear - i };
            this._yearsArray.push(auxYear);
        }

        this._monthsArray = [{ value: '01', viewValue: '01' }, { value: '02', viewValue: '02' }, { value: '03', viewValue: '03' },
        { value: '04', viewValue: '04' }, { value: '05', viewValue: '05' }, { value: '06', viewValue: '06' },
        { value: '07', viewValue: '07' }, { value: '08', viewValue: '08' }, { value: '09', viewValue: '09' },
        { value: '10', viewValue: '10' }, { value: '11', viewValue: '11' }, { value: '12', viewValue: '12' }];
    }

    /**
     * Validate if user payments history exists
     */
    countPaymentsHistory(): void {
        PaymentsHistory.collection.find({ creation_user: Meteor.userId() }).count() > 0 ? this._thereArePaymentsHistory = true : this._thereArePaymentsHistory = false;
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions(): void {
        if (this._historyPaymentSub) { this._historyPaymentSub.unsubscribe(); }
        if (this._restaurantSub) { this._restaurantSub.unsubscribe(); }
        if (this._paymentTransactionSub) { this._paymentTransactionSub.unsubscribe(); }
        if (this._parameterSub) { this._parameterSub.unsubscribe(); }
        if (this._userDetailSub) { this._userDetailSub.unsubscribe(); }
        if (this._countrySub) { this._countrySub.unsubscribe(); }
        if (this._citySub) { this._citySub.unsubscribe(); }
    }

    /**
     * This function enable month select component and update history payment query
     */
    changeHistoryPaymentYear() {
        let _selectedYearNum: number = Number(this._selectedYear);
        this._historyPayments = PaymentsHistory.find({
            creation_user: Meteor.userId(),
            creation_date: {
                $gte: new Date(_selectedYearNum, 0, 1),
                $lte: new Date(_selectedYearNum, 11, 31)
            }
        },
            { sort: { creation_date: -1 } }).zone();

        this._activateMonth = false;
        this._selectedMonth = "0";
    }

    /**
     * This function update history payment by month and year
     */
    changeHistoryPaymentMonth() {
        let _selectedMonthNum: number = Number(this._selectedMonth) - 1;
        let _selectedYearNum: number = Number(this._selectedYear);

        if (_selectedMonthNum === -1) {
            this._historyPayments = PaymentsHistory.find({
                creation_user: Meteor.userId(),
                creation_date: {
                    $gte: new Date(_selectedYearNum, 0, 1),
                    $lte: new Date(_selectedYearNum, 11, 31)
                }
            },
                { sort: { creation_date: -1 } }).zone();
        }
        else {
            this._historyPayments = PaymentsHistory.find({
                creation_user: Meteor.userId(),
                creation_date: {
                    $gte: new Date(_selectedYearNum, _selectedMonthNum, 1),
                    $lte: new Date(_selectedYearNum, _selectedMonthNum, 31)
                }
            },
                { sort: { creation_date: -1 } }).zone();
        }
    }

    /**
     * This function returns de status payment image 
     * @param {string} _status
     */
    getImageName(_status: string): string {
        let imgStr: string = '';
        switch (_status) {
            case 'TRANSACTION_STATUS.APPROVED': {
                imgStr = '/images/trn_approved.png';
                break;
            }
            case 'TRANSACTION_STATUS.DECLINED': {
                imgStr = '/images/trn_declined.png';
                break;
            }
            case 'TRANSACTION_STATUS.PENDING': {
                imgStr = '/images/trn_pending.png';
                break;
            }
            case 'TRANSACTION_STATUS.EXPIRED': {
                imgStr = '/images/trn_declined.png';
                break;
            }
            default: {
                imgStr = '/images/trn_declined.png';
                break;
            }
        }
        return imgStr;
    }

    /**
     * This function queries de transaction status
     * @param {string} _transactionId
     */
    checkTransactionStatus(_transactionId: string) {
        let responseQuery = new ResponseQuery();
        let merchant = new Merchant();
        let details = new Details();
        let credentialArray: string[] = [];
        let historyPayment = PaymentsHistory.collection.findOne({ transactionId: _transactionId });
        let paymentTransaction = PaymentTransactions.collection.findOne({ _id: historyPayment.transactionId });

        this._loading = true;
        setTimeout(() => {
            responseQuery.language = Meteor.user().profile.language_code;
            responseQuery.command = 'TRANSACTION_RESPONSE_DETAIL';
            merchant.apiLogin = this.al;
            merchant.apiKey = this.ak;
            responseQuery.merchant = merchant;
            details.transactionId = paymentTransaction.responsetransactionId;
            responseQuery.details = details;
            //responseQuery.test = false;
            responseQuery.test = true;

            let responseMessage: string;
            let responseIcon: string;

            this._payuPaymentService.getTransactionResponse(responseQuery).subscribe(
                response => {
                    if (response.code === 'ERROR') {
                        responseMessage = 'RES_PAYMENT_HISTORY.VERIFY_ERROR'
                        responseIcon = 'trn_declined.png';
                    } else if (response.code === 'SUCCESS') {
                        switch (response.result.payload.state) {
                            case "APPROVED": {
                                this.updateAllStatus(historyPayment, paymentTransaction, response);
                                responseMessage = 'RES_PAYMENT_HISTORY.VERIFY_APPROVED';
                                responseIcon = 'trn_approved.png';
                                break;
                            }
                            case "DECLINED": {
                                this.updateAllStatus(historyPayment, paymentTransaction, response);
                                responseMessage = 'RES_PAYMENT_HISTORY.VERIFY_DECLINED';
                                responseIcon = 'trn_declined.png';
                                break;
                            }
                            case "PENDING": {
                                this.updateAllStatus(historyPayment, paymentTransaction, response);
                                responseMessage = 'RES_PAYMENT_HISTORY.VERIFY_PENDING';
                                responseIcon = 'trn_pending.png';
                                break;
                            }
                            case "EXPIRED": {
                                this.updateAllStatus(historyPayment, paymentTransaction, response);
                                responseMessage = 'RES_PAYMENT_HISTORY.VERIFY_EXPIRED';
                                responseIcon = 'trn_declined.png';
                                break;
                            }
                            default: {
                                this.updateAllStatus(historyPayment, paymentTransaction, response);
                                responseMessage = 'RES_PAYMENT_HISTORY.VERIFY_ERROR';
                                responseIcon = 'trn_declined.png';
                                break;
                            }
                        }
                    }
                    this._mdDialogRef = this._mdDialog.open(VerifyResultComponent, {
                        disableClose: true,
                        data: {
                            responseStatus: responseMessage,
                            responseImage: responseIcon
                        }
                    });

                    this._mdDialogRef.afterClosed().subscribe(result => {
                        this._mdDialogRef = result;
                        if (result.success) {

                        }
                    });
                },
                error => {
                    this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
                }
            );
            this._loading = false;
        }, 5000);
    }

    /**
     * This function updates the history Payment status, payment transaction status, restaurant and tables
     * @param {string} _status
     * */
    updateAllStatus(_historyPayment: PaymentHistory, _paymentTransaction: PaymentTransaction, _response: any) {
        PaymentTransactions.collection.update({ _id: _paymentTransaction._id },
            {
                $set: {
                    status: _response.result.payload.state,
                    responseCode: _response.result.payload.responseCode,
                    modification_user: Meteor.userId(),
                    modification_date: new Date()
                }
            });

        PaymentsHistory.collection.update({ _id: _historyPayment._id },
            {
                $set: {
                    status: 'TRANSACTION_STATUS.' + _response.result.payload.state,
                    modification_user: Meteor.userId(),
                    modification_date: new Date()
                }
            });

        if (_response.result.payload.state == 'APPROVED') {
            _historyPayment.restaurantIds.forEach((restaurantId) => {
                Restaurants.collection.update({ _id: restaurantId }, { $set: { isActive: true, firstPay: false } });

                Tables.collection.find({ restaurantId: restaurantId }).forEach((table: Table) => {
                    Tables.collection.update({ _id: table._id }, { $set: { is_active: true, firstPay: true } });
                });
            });
        }
    }

    /**
     * This functions gets de restaurant name by id
     * @param {string }_restaurantId 
     */
    getRestaurantName(_restaurantId: string): string {
        let restaurant = Restaurants.findOne({ _id: _restaurantId });
        if (restaurant) {
            return restaurant.name;
        } else {
            return '';
        }
    }

    /**
     * This function generates de invoice
     */
    generateInvoice(_paymentHistory: PaymentHistory) {
        let company_name = Parameters.findOne({ name: 'company_name' }).value;
        let company_address = Parameters.findOne({ name: 'company_address' }).value;
        let company_city = Parameters.findOne({ name: 'company_city' }).value;
        let company_country = Parameters.findOne({ name: 'company_country' }).value;
        let company_rut = Parameters.findOne({ name: 'company_nit' }).value;
        let parameterTax = Parameters.findOne({ name: 'colombia_tax_iva' });
        let invoice_lbl = this.itemNameTraduction('RES_PAYMENT_HISTORY.INVOICE_LBL');
        let number_lbl = this.itemNameTraduction('RES_PAYMENT_HISTORY.NUMBER_LBL');
        let date_lbl = this.itemNameTraduction('RES_PAYMENT_HISTORY.DATE_LBL');
        let customer_lbl = this.itemNameTraduction('RES_PAYMENT_HISTORY.CUSTOMER_LBL');
        let desc_lbl = this.itemNameTraduction('RES_PAYMENT_HISTORY.DESCRIPTION_LBL');
        let period_lbl = this.itemNameTraduction('RES_PAYMENT_HISTORY.PERIOD_LBL');
        let amount_lbl = this.itemNameTraduction('RES_PAYMENT_HISTORY.AMOUNT_LBL');
        let description = this.itemNameTraduction('RES_PAYMENT_HISTORY.DESCRIPTION');
        let subtotal_lbl = this.itemNameTraduction('RES_PAYMENT_HISTORY.SUBTOTAL');
        let iva_lbl = this.itemNameTraduction('RES_PAYMENT_HISTORY.IVA');
        let total_lbl = this.itemNameTraduction('RES_PAYMENT_HISTORY.TOTAL');
        let fileName = this.itemNameTraduction('RES_PAYMENT_HISTORY.INVOICE');
        let auxCity: string;

        let user_detail: UserDetail = UserDetails.findOne({ user_id: Meteor.userId() });
        let country: Country = Countries.findOne({ _id: user_detail.country_id });
        let countryTraduced = this.itemNameTraduction(country.name);
        let city: City = Cities.findOne({ _id: user_detail.city_id });
        if (city) {
            auxCity = city.name;
        } else {
            auxCity = user_detail.other_city;
        }

        let qr_pdf = new jsPDF("portrait", "mm", "a4");

        var myImage = new Image();
        myImage.src = '/images/logo_iurest.png';

        myImage.onload = function () {
            qr_pdf.addImage(myImage, 'png', 13, 13, 35, 10);

            qr_pdf.setFontSize(10);
            qr_pdf.text(company_name, 155, 15);
            qr_pdf.text(company_address, 155, 20);
            qr_pdf.text(company_city + ', ' + company_country, 155, 25);
            qr_pdf.text(company_rut, 155, 30);

            qr_pdf.setFontSize(12);
            qr_pdf.setFontStyle('bold');
            qr_pdf.text(invoice_lbl, 15, 45);
            qr_pdf.setFontStyle('normal');
            qr_pdf.text(number_lbl + '1234567890', 15, 50);

            let dateFormated = _paymentHistory.creation_date.getDate() + '/' + (_paymentHistory.creation_date.getMonth() + 1) + '/' + _paymentHistory.creation_date.getFullYear();
            qr_pdf.text(date_lbl + dateFormated, 15, 55);

            qr_pdf.setFontSize(12);
            qr_pdf.setFontStyle('bold');
            qr_pdf.text(customer_lbl, 15, 65);
            qr_pdf.setFontStyle('normal');
            qr_pdf.text(Meteor.user().profile.first_name + ' ' + Meteor.user().profile.last_name, 15, 70);
            qr_pdf.text(user_detail.address, 15, 75);
            qr_pdf.text(auxCity + ', ' + countryTraduced, 15, 80);

            qr_pdf.setFontStyle('bold');
            qr_pdf.text(desc_lbl, 15, 95);
            qr_pdf.text(period_lbl, 110, 95);
            qr_pdf.text(amount_lbl, 195, 95, 'right');
            qr_pdf.line(15, 97, 195, 97);
            qr_pdf.setFontStyle('normal');
            qr_pdf.text(description, 15, 105);
            let datePeriod = _paymentHistory.startDate.getDate() + '/' + (_paymentHistory.startDate.getMonth() + 1) + '/' + _paymentHistory.startDate.getFullYear() +
                ' - ' + _paymentHistory.endDate.getDate() + '/' + (_paymentHistory.endDate.getMonth() + 1) + '/' + _paymentHistory.endDate.getFullYear();
            qr_pdf.text(datePeriod, 110, 105);

            let percentValue = Number(parameterTax.value);
            let baseValue = (Number(_paymentHistory.paymentValue) - ((Number(_paymentHistory.paymentValue) * percentValue) / 100)).toString();
            let taxValue = ((Number(_paymentHistory.paymentValue) * percentValue) / 100).toString();

            qr_pdf.text(baseValue, 185, 105, 'right');
            qr_pdf.text(_paymentHistory.currency, 195, 105, 'right');
            qr_pdf.line(15, 110, 195, 110);

            qr_pdf.setFontStyle('bold');
            qr_pdf.text(subtotal_lbl, 110, 120);
            qr_pdf.setFontStyle('normal');
            qr_pdf.text(baseValue, 185, 120, 'right');
            qr_pdf.text(_paymentHistory.currency, 195, 120, 'right');
            qr_pdf.setFontStyle('bold');
            qr_pdf.text(iva_lbl, 110, 125);
            qr_pdf.setFontStyle('normal');
            qr_pdf.text(taxValue, 185, 125, 'right');
            qr_pdf.text(_paymentHistory.currency, 195, 125, 'right');
            qr_pdf.setFontStyle('bold');
            qr_pdf.text(total_lbl, 110, 130);
            qr_pdf.setFontStyle('normal');
            qr_pdf.text(_paymentHistory.paymentValue.toString(), 185, 130, 'right');
            qr_pdf.text(_paymentHistory.currency, 195, 130, 'right');

            qr_pdf.output('save', fileName + '_' + dateFormated + '.pdf');
        }
    }

    /**
    * This function open de error dialog according to parameters 
    * @param {string} title
    * @param {string} subtitle
    * @param {string} content
    * @param {string} btnCancelLbl
    * @param {string} btnAcceptLbl
    * @param {boolean} showBtnCancel
    */
    openDialog(title: string, subtitle: string, content: string, btnCancelLbl: string, btnAcceptLbl: string, showBtnCancel: boolean) {

        this._mdDialogRef = this._mdDialog.open(AlertConfirmComponent, {
            disableClose: true,
            data: {
                title: title,
                subtitle: subtitle,
                content: content,
                buttonCancel: btnCancelLbl,
                buttonAccept: btnAcceptLbl,
                showBtnCancel: showBtnCancel
            }
        });
        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = result;
            if (result.success) {

            }
        });
    }

    itemNameTraduction(itemName: string): string {
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res;
        });
        return wordTraduced;
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy() {
        this.removeSubscriptions();
    }
}