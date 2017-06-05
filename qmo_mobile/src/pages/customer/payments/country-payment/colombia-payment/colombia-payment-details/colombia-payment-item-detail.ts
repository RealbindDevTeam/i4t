import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Order, OrderItem } from 'qmo_web/both/models/restaurant/order.model';
import { Item } from 'qmo_web/both/models/administration/item.model';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Items } from 'qmo_web/both/collections/administration/item.collection';

@Component({
    selector: 'colombia-payment-item-detail',
    templateUrl: 'colombia-payment-item-detail.html'
})

export class ColombiaPaymentItemDetailComponent implements OnInit, OnDestroy {
    @Input()
    order: Order;

    @Input()
    orderItem: OrderItem;

    @Input()
    resCode: string;
    
    @Input()
    currencyCode: string;

    private _items;
    private _itemsSub: Subscription;

    /**
     * ColombiaPaymentItemDetailsComponent constructor
     */
    constructor() {
    }

    /**
     * ngOnInit Implementation. Find the items corresponding to RestaurantId
     */
    ngOnInit() {
        this._itemsSub = MeteorObservable.subscribe('itemsByRestaurant', this.resCode).subscribe(() => {
            this._items = Items.find({_id: this.orderItem.itemId});
        });
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy() {
        this._itemsSub.unsubscribe();
    }
}