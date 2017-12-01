import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable, Subscription } from 'rxjs';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Countries } from '../../../../../../both/collections/settings/country.collection';
import { Country } from '../../../../../../both/models/settings/country.model';
import { Currency } from '../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../both/collections/general/currency.collection';

@Component({
    selector: 'payment-plan-info',
    templateUrl: './payment-plan-info.component.html',
    styleUrls: ['./payment-plan-info.component.scss'],
    providers: [UserLanguageService]
})
export class PaymentPlanInfo implements OnInit, OnDestroy {

    private _currenciesSubscription: Subscription;

    private _currency: Currency;
    private _country: Country;
    private _countrySelected: Country;
    private _countries: Observable<Country[]>;

    private _restaurantsUnits: number = 1;
    private _tablesUnits: number = 1;
    private _total: number = 0;

    constructor(public _dialogRef: MatDialogRef<any>,
        protected zone: NgZone) {
    }

    ngOnInit() {
        this._currenciesSubscription = MeteorObservable.subscribe('currencies').subscribe();

        this.zone.run(() => {
            this._countries = Countries.find({}).zone();
        });
    }

    findCurrency( _pContry : Country ) {
        if(_pContry){
            this._country = _pContry;
            this._currency = Currencies.findOne({ _id: this._country.currencyId });
        }
    }

    calculate() {
        if (this._country && this._restaurantsUnits > 0 && this._tablesUnits > 0) {
            this._total = (Number.parseInt(this._country.restaurantPrice.toString()) * Number.parseInt(this._restaurantsUnits)) +
                (Number.parseInt(this._country.tablePrice.toString()) * Number.parseInt(this._tablesUnits));
        }
    }

    reset(){
        if(this._country){ this._country = null };
        if(this._countrySelected){ this._countrySelected = null };
        if(this._currency){ this._currency = null };
        if(this._restaurantsUnits){ this._restaurantsUnits = 1 };
        if(this._tablesUnits){ this._tablesUnits = 1 };
        if(this._total){ this._total = 0 };
    }

    cancel() {
        this._dialogRef.close({ success: false });
    }

    ngOnDestroy() {
        if (this._currenciesSubscription) { this._currenciesSubscription.unsubscribe() };
    }

}