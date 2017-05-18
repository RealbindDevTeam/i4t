import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Orders } from "../../../../../../../both/collections/restaurant/order.collection";
import { Order, OrderItem } from "../../../../../../../both/models/restaurant/order.model";
import { Items } from "../../../../../../../both/collections/administration/item.collection";
import { Item } from "../../../../../../../both/models/administration/item.model";
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';

@Component({
    selector: 'payment-item-detail',
    template : `
        <div *ngFor="let item of _items | async">
            <div *ngIf="orderItem.itemId == item._id" style="width: 100%">
                <h3 style="white-space: normal; display: inline-block; width: 74%;">{{item.name}}</h3> 
                <p item-right style="white-space: normal;display: inline-block; width: 24%; text-align: end;">{{orderItem.paymentItem}} COP</p>
            </div>
        </div>
    `,
})

export class PaymentItemDetailComponent implements OnInit, OnDestroy {
    @Input() order: Order;

    @Input() orderItem: OrderItem;

    @Input() resCode: string;

    private _items;
    private _itemsSub: Subscription;

    constructor() {
    }

    ngOnInit() {
        this._itemsSub = MeteorObservable.subscribe('itemsByRestaurant', this.resCode).subscribe(() => {
            this._items = Items.find({_id: this.orderItem.itemId});
        });
    }

    ngOnDestroy() {
        this._itemsSub.unsubscribe();
    }
}