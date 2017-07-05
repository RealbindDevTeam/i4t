import { Component, Input, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Orders } from "../../../../../../../../../../../both/collections/restaurant/order.collection";
import { Order, OrderItem } from "../../../../../../../../../../../both/models/restaurant/order.model";
import { Items } from "../../../../../../../../../../../both/collections/administration/item.collection";
import { Item } from "../../../../../../../../../../../both/models/administration/item.model";
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription, Observable } from 'rxjs';
import { TranslateService } from 'ng2-translate';
import { GarnishFood } from '../../../../../../../../../../../both/models/administration/garnish-food.model';
import { GarnishFoodCol } from '../../../../../../../../../../../both/collections/administration/garnish-food.collection';
import { Addition } from '../../../../../../../../../../../both/models/administration/addition.model';
import { Additions } from '../../../../../../../../../../../both/collections/administration/addition.collection';

import template from './colombia-payment-item.component.html';
import style from './colombia-payment-item.component.scss';

@Component({
    selector: 'colombia-item-detail',
    template,
    styles: [ style ]
})
export class ColombiaItemDetailComponent implements OnInit, OnDestroy {

    @Input() orderItem: OrderItem;
    @Input() resCode: string;
    @Input() cur: string;
    @Input() curCode: string;

    private _items              : Observable<Item[]>;
    private _garnishFood        : Observable<GarnishFood[]>;
    private _additions          : Observable<Addition[]>;

    private _itemsSub           : Subscription;
    private _garnishFoodSub     : Subscription;
    private _additionSub        : Subscription;

    /**
     * ColombiaItemDetailComponent constructor
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
     * ngOnInit Implementation. Find the items corresponding to RestaurantId
     */
    ngOnInit() {
        this._itemsSub = MeteorObservable.subscribe('itemsByRestaurant', this.resCode).subscribe(() => {
            this._ngZone.run( () => {
                this._items = Items.find( { _id: this.orderItem.itemId } ).zone();
            });
        });
        this._garnishFoodSub = MeteorObservable.subscribe( 'garnishFoodByRestaurant', this.resCode ).subscribe( () => {
            this._ngZone.run( () => {
                this._garnishFood = GarnishFoodCol.find( { _id: { $in: this.orderItem.garnishFood } } ).zone();
            });
        });
        this._additionSub = MeteorObservable.subscribe( 'additionsByRestaurant', this.resCode ).subscribe( () => {
            this._ngZone.run( () => {
                this._additions = Additions.find( { _id: { $in: this.orderItem.additions } } ).zone();
            });
        });
    }

    /**
     * Return unit price
     * @param {Item} _pItem 
     */
    getUnitPrice( _pItem:Item ):number {
        return _pItem.prices.filter( p => p.currencyId === this.cur )[0].price;
    }

    /**
     * Return Total price
     * @param {Item} _pItem 
     */
    getTotalPrice( _pItem:Item ): number {
        return _pItem.prices.filter( p => p.currencyId === this.cur )[0].price * this.orderItem.quantity;
    }

    /**
     * Return Unit garnish food price
     * @param {GarnishFood} _pGarnishFood
     */
    getGarnisFoodhUnitPrice( _pGarnishFood: GarnishFood ): number {
        return _pGarnishFood.prices.filter( g  => g.currencyId === this.cur )[0].price;
    }

    /**
     * Return Total Garnish Food Price
     */
    getGarnishFoodTotalPrice( _pGarnishFood: GarnishFood ): number {
        return _pGarnishFood.prices.filter( g  => g.currencyId === this.cur )[0].price * this.orderItem.quantity;
    }

    /**
     * Return Unit addition price
     * @param {Addition} _pAddition 
     */
    getAdditionhUnitPrice( _pAddition: Addition ): number {
        return _pAddition.prices.filter( a => a.currencyId === this.cur )[0].price;
    }

    /**
     * Return Total addition Price
     * @param {Addition} _pAddition 
     */
    getAdditionTotalPrice( _pAddition: Addition ): number {
        return _pAddition.prices.filter( a => a.currencyId === this.cur )[0].price * this.orderItem.quantity;
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy() {
        this._itemsSub.unsubscribe();
        this._garnishFoodSub.unsubscribe();
        this._additionSub.unsubscribe();
    }
}