import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';
import { getPayuMerchantInfo } from '../../../../../../both/methods/general/parameter.methods';
import { VerifyResultComponent } from './verify-result/verify-result.component';

import { HistoryPayments } from '../../../../../../both/collections/payment/history-payment.collection';
import { HistoryPayment } from '../../../../../../both/models/payment/history-payment.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { ResponseQuery, Merchant, Details } from '../../../../../../both/models/payment/response-query.model';
import { PaymentTransactions } from '../../../../../../both/collections/payment/payment-transaction.collection';
import { PaymentTransaction } from '../../../../../../both/models/payment/payment-transaction.model';
import { Tables } from '../../../../../../both/collections/restaurant/table.collection';
import { Table } from '../../../../../../both/models/restaurant/table.model';

import { PayuPaymenteService } from '../payu-payment-service/payu-payment.service';

import template from './history-payment.component.html';
import style from './history-payment.component.scss';

@Component({
    selector: 'history-payment',
    template,
    styles: [style]
})

export class HistoryPaymentComponent implements OnInit, OnDestroy {

    private _historyPaymentSub: Subscription;
    private _historyPayments: Observable<HistoryPayment[]>;
    private _restaurantSub: Subscription;
    private _restaurants: Observable<Restaurant[]>;
    private _paymentTransactionSub: Subscription;
    private _paymentTransactions: Observable<PaymentTransaction[]>;
    private _selectedMonth: string;
    private _selectedYear: string;
    private _yearsArray: any[];
    private _monthsArray: any[];
    private _currentDate: Date;
    private _currentYear: number;
    private _activateMonth: boolean;
    private _loading: boolean;
    private _mdDialogRef: MdDialogRef<any>;

    constructor(private _router: Router,
        private _formBuilder: FormBuilder,
        private _translate: TranslateService,
        public _mdDialog: MdDialog,
        private _payuPaymentService: PayuPaymenteService) {
        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);

        this._currentDate = new Date();
        this._activateMonth = true;
    }

    ngOnInit() {
        this._historyPaymentSub = MeteorObservable.subscribe('getHistoryPaymentsByUser', Meteor.userId()).subscribe(() => {
            this._historyPayments = HistoryPayments.find({
                creation_user: Meteor.userId(),
                creation_date: {
                    $gte: new Date(new Date().getFullYear(), 0, 1),
                    $lte: new Date(new Date().getFullYear(), 11, 31)
                }
            },
                { sort: { creation_date: -1 } }).zone();
        });

        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe();
        this._paymentTransactionSub = MeteorObservable.subscribe('getTransactionsByUser', Meteor.userId()).subscribe();

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
     * This function enable month select component and update history payment query
     */
    changeHistoryPaymentYear() {
        let _selectedYearNum: number = Number(this._selectedYear);
        this._historyPayments = HistoryPayments.find({
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
            this._historyPayments = HistoryPayments.find({
                creation_user: Meteor.userId(),
                creation_date: {
                    $gte: new Date(_selectedYearNum, 0, 1),
                    $lte: new Date(_selectedYearNum, 11, 31)
                }
            },
                { sort: { creation_date: -1 } }).zone();
        }
        else {
            this._historyPayments = HistoryPayments.find({
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
        console.log(_transactionId);

        let responseQuery = new ResponseQuery();
        let merchant = new Merchant();
        let details = new Details();
        let credentialArray: string[] = [];
        let apilogin: string;
        let apikey: string;
        let historyPayment = HistoryPayments.collection.findOne({ transactionId: _transactionId });
        let paymentTransaction = PaymentTransactions.collection.findOne({ _id: historyPayment.transactionId });

        this._loading = true;
        setTimeout(() => {
            credentialArray = getPayuMerchantInfo();
            apilogin = credentialArray[0];
            apikey = credentialArray[1];

            responseQuery.language = Meteor.user().profile.language_code;
            responseQuery.command = 'TRANSACTION_RESPONSE_DETAIL';
            merchant.apiLogin = apilogin;
            merchant.apiKey = apikey;
            responseQuery.merchant = merchant;
            details.transactionId = paymentTransaction.responsetransactionId;
            //details.transactionId = 'a10b1413-4be2-4974-9eb2-e1c1aa13113f';
            responseQuery.details = details;
            responseQuery.test = false;

            let responseMessage: string;
            let responseIcon: string;

            this._payuPaymentService.getTransactionResponse(responseQuery).subscribe(
                response => {
                    console.log(JSON.stringify(response));
                    if (response.code === 'ERROR') {
                        responseMessage = 'PAYMENT_HISTORY.VERIFY_ERROR'
                        responseIcon = 'trn_declined.png';
                    } else if (response.code === 'SUCCESS') {
                        switch (response.result.payload.state) {
                            case "APPROVED": {
                                console.log(' *** aprobación');
                                this.updateAllStatus(historyPayment, paymentTransaction, response);
                                responseMessage = 'PAYMENT_HISTORY.VERIFY_APPROVED';
                                responseIcon = 'trn_approved.png';
                                break;
                            }
                            case "DECLINED": {
                                console.log(' *** rechazada');
                                this.updateAllStatus(historyPayment, paymentTransaction, response);
                                responseMessage = 'PAYMENT_HISTORY.VERIFY_DECLINED';
                                responseIcon = 'trn_declined.png';
                                break;
                            }
                            case "PENDING": {
                                console.log(' *** pendiente');
                                this.updateAllStatus(historyPayment, paymentTransaction, response);
                                responseMessage = 'PAYMENT_HISTORY.VERIFY_PENDING';
                                responseIcon = 'trn_pending.png';
                                break;
                            }
                            case "EXPIRED": {
                                console.log(' *** expirada');
                                this.updateAllStatus(historyPayment, paymentTransaction, response);
                                responseMessage = 'PAYMENT_HISTORY.VERIFY_EXPIRED';
                                responseIcon = 'trn_declined.png';
                                break;
                            }
                            default: {
                                console.log("*** error");
                                this.updateAllStatus(historyPayment, paymentTransaction, response);
                                responseMessage = 'PAYMENT_HISTORY.VERIFY_ERROR';
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
                    alert(error);
                }
            );
            this._loading = false;
        }, 5000);
    }

    /**
     * This function updates the history Payment status, payment transaction status, restaurant and tables
     * @param {string} _status
     * */
    updateAllStatus(_historyPayment: HistoryPayment, _paymentTransaction: PaymentTransaction, _response: any) {
        console.log('entra a updateAllStatus');
        PaymentTransactions.collection.update({ _id: _paymentTransaction._id },
            {
                $set: {
                    status: _response.result.payload.state,
                    responseCode: _response.result.payload.responseCode,
                    modification_user: Meteor.userId(),
                    modification_date: new Date()
                }
            });

        HistoryPayments.collection.update({ _id: _historyPayment._id },
            {
                $set: {
                    status: 'TRANSACTION_STATUS.' + _response.result.payload.state,
                    modification_user: Meteor.userId(),
                    modification_date: new Date()
                }
            });

        if (_response.result.payload.state == 'APPROVED') {

        } else {

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

    ngOnDestroy() {
        this._historyPaymentSub.unsubscribe();
        this._restaurantSub.unsubscribe();
    }
}