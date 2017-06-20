import { Component, OnInit, OnDestroy, NgZone, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { RestaurantPlan } from '../../../../../../../../../both/models/restaurant/restaurant-plan.model';
import { RestaurantPlans } from '../../../../../../../../../both/collections/restaurant/restaurant-plan.collection';

import template from './colombia-payment-plan.component.html';
import style from './colombia-payment-plan.component.scss';

@Component({
    selector: 'colombia-payment-plan',
    template,
    styles: [style]
})

export class ColombiaPaymentPlanComponent implements OnInit, OnDestroy {

    @Input()
    countryId: string;

    private _planSub: Subscription;
    private _plans: Observable<RestaurantPlan[]>;

    private 

    constructor(private _translate: TranslateService, private _ngZone: NgZone) {
        var _userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(_userLang);
    }

    ngOnInit() {
        this._planSub = MeteorObservable.subscribe('getPlans').subscribe(() => {
            this._plans = RestaurantPlans.find();
        });
    }

    ngOnDestroy() {

    }

}