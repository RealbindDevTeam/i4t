import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';

import { HistoryPayments } from '../../../../../../both/collections/payment/history-payment.collection';
import { HistoryPayment } from '../../../../../../both/models/payment/history-payment.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';



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
    private _selectedMonth: string;
    private _selectedYear: string;
    private _yearsArray: any[];
    private _monthsArray: any[];
    private _currentDate: Date;
    private _currentYear: number;
    private _activateMonth: boolean;
    private _loading: boolean;

    constructor(private _router: Router,
        private _formBuilder: FormBuilder,
        private _translate: TranslateService) {
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

        this._loading = true;
        setTimeout(() => {
             this._loading = false;
        }, 5000);
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