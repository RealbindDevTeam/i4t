import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Order, OrderItem } from 'qmo_web/both/models/restaurant/order.model';
import { ItemImagesThumbs } from 'qmo_web/both/collections/administration/item.collection';
import { Item } from 'qmo_web/both/models/administration/item.model';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Items } from 'qmo_web/both/collections/administration/item.collection';

@Component({
    selector: 'order-item-detail',
    templateUrl: 'order-item-detail.html'
})

export class OrderItemDetailComponent implements OnInit, OnDestroy {
    @Input()
    order: Order;

    @Input()
    orderItem: OrderItem;

    @Input()
    resCode: string;

    @Output('gotoedititem')
    itemIdOut: EventEmitter<any> = new EventEmitter<any>();

    private _imageThumbs;
    private _imageThumbSub: Subscription;
    private _items;
    private _itemsSub: Subscription;
    private _currentOrderUserId: string;

    constructor() {
        this._currentOrderUserId = Meteor.userId();
     }

    ngOnInit() {
        this._itemsSub = MeteorObservable.subscribe('itemsByRestaurant', this.resCode).subscribe(() => {
            this._items = Items.find({_id: this.orderItem.itemId});
        });

        this._imageThumbSub = MeteorObservable.subscribe('itemImageThumbsByRestaurant', this.resCode).subscribe();
    }

    getItemThumb(_itemId: string): string {
        let _imageThumb;
        _imageThumb = ItemImagesThumbs.find().fetch().filter((i) => i.itemId === _itemId)[0];
        if (_imageThumb) {
            return _imageThumb.url;
        }
    }

    goToItemEdit(itemId, orderItemIndex){
        let arrValue: any[] = [];
        arrValue[0] = itemId;
        arrValue[1] = orderItemIndex;
        this.itemIdOut.emit(arrValue);
    }

    ngOnDestroy() {
        this._imageThumbSub.unsubscribe();
        this._itemsSub.unsubscribe();
    }
}