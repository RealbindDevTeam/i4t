import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Order, OrderItem } from 'qmo_web/both/models/restaurant/order.model';
import { ItemImagesThumbs } from 'qmo_web/both/collections/administration/item.collection';
import { Item } from 'qmo_web/both/models/administration/item.model';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Items } from 'qmo_web/both/collections/administration/item.collection';

@Component({
    selector: 'payment-item-detail',
    templateUrl: 'payment-item-detail.html'
})

export class PaymentItemDetailComponent implements OnInit, OnDestroy {
    @Input()
    order: Order;

    @Input()
    orderItem: OrderItem;

    @Input()
    resCode: string;

    private _items;
    private _itemsSub: Subscription;

    constructor() {
    }

    ngOnInit() {
        this._itemsSub = MeteorObservable.subscribe('itemsByRestaurant', this.resCode).subscribe(() => {
            this._items = Items.find({_id: this.orderItem.itemId});
        });
    }

    goToItemEdit(itemId, orderItemIndex){
        let arrValue: any[] = [];
        arrValue[0] = itemId;
        arrValue[1] = orderItemIndex;
    }

    ngOnDestroy() {
        this._itemsSub.unsubscribe();
    }
}