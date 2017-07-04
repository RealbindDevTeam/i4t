import { Component, Input, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription, Observable } from 'rxjs';
import { TranslateService } from 'ng2-translate';
import { Orders } from "../../../../../../../../../../../both/collections/restaurant/order.collection";
import { Order, OrderAddition } from "../../../../../../../../../../../both/models/restaurant/order.model";
import { Items } from "../../../../../../../../../../../both/collections/administration/item.collection";
import { Item } from "../../../../../../../../../../../both/models/administration/item.model";
import { Addition } from '../../../../../../../../../../../both/models/administration/addition.model';
import { Additions } from '../../../../../../../../../../../both/collections/administration/addition.collection';

import template from './colombia-payment-addition.component.html';
import style from './colombia-payment-addition.component.scss';

@Component({
    selector: 'colombia-addition-detail',
    template,
    styles: [ style ]
})
export class ColombiaAdditionDetailComponent implements OnInit, OnDestroy{

    @Input() orderAdd: OrderAddition;
    @Input() resCode: string;
    @Input() cur: string;
    @Input() curCode: string;

    private _additions          : Observable<Addition[]>;
    private _additionSub        : Subscription;

    /**
     * ColombiaAdditionDetailComponent constructor
     * @param {TranslateService} _translate
     * @param {NgZone} _ngZone
     */
    constructor( private _translate: TranslateService, 
                 private _ngZone: NgZone ) {
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._additionSub = MeteorObservable.subscribe( 'additionsByRestaurant', this.resCode ).subscribe( () => {
            this._ngZone.run( () => {
                this._additions = Additions.find( { _id: this.orderAdd.additionId } ).zone();
            });
        });
    }

    /**
     * Return Unit addition price
     * @param {Addition} _pAddition 
     */
    getAdditionUnitPrice( _pAddition: Addition ): number {
        return _pAddition.prices.filter( a => a.currencyId === this.cur )[0].price;
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._additionSub.unsubscribe();
    }
}