import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../services/general/user-language.service';
import { Table } from '../../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../../both/collections/restaurant/table.collection';
import { Payment } from '../../../../../../../both/models/restaurant/payment.model';
import { Payments } from '../../../../../../../both/collections/restaurant/payment.collection';
import { Account } from '../../../../../../../both/models/restaurant/account.model';
import { Accounts } from '../../../../../../../both/collections/restaurant/account.collection';

@Component({
    selector: 'payments-change',
    templateUrl: './payments-change.component.html',
    styleUrls: ['./payments-change.component.scss'],
    providers: [UserLanguageService]
})

export class PaymentsChangeComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    private tables: Observable<Table[]>;
    private tableSub: Subscription;
    private payments: Observable<Payment[]>;
    private paymentSub: Subscription;
    private accounts: Observable<Account[]>;
    private accountSub: Subscription;

    private selected = '';
    private aux: string;

    /**
  * PaymentConfirmComponent constructor
  * @param {TranslateService} translate
  * @param {MatDialog} _dialogRef
  * @param {NgZone} _ngZone
  * @param {UserLanguageService} _userLanguageService
  */
    constructor(private _translate: TranslateService,
        public _dialogRef: MatDialog,
        private _ngZone: NgZone,
        private _userLanguageService: UserLanguageService,
        private _snackBar: MatSnackBar) {
        _translate.use(this._userLanguageService.getLanguage(Meteor.user()));
        _translate.setDefaultLang('en');
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit() {
        this.tableSub = MeteorObservable.subscribe('getTablesByRestaurantWork', this._user).subscribe(() => {
            this._ngZone.run(() => {
                this.tables = Tables.find({});
            });
        });

        this.paymentSub = MeteorObservable.subscribe('getPaymentsForChangeComposite', this._user).subscribe(() => {
            this._ngZone.run(() => {
                this.payments = Payments.find({});
            })
        });
    }


    selectPayments(_tableObj: Table) {
        console.log(JSON.stringify(_tableObj));
    }
}