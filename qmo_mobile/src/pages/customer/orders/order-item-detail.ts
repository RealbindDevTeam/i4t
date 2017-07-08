import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Order, OrderItem } from 'qmo_web/both/models/restaurant/order.model';
import { ItemImagesThumbs } from 'qmo_web/both/collections/administration/item.collection';
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
    
    @Input()
    currency: string;

    @Output('gotoedititem')
    itemIdOut: EventEmitter<any> = new EventEmitter<any>();

    private _imageThumbSub: Subscription;
    private _items;
    private _itemsSub: Subscription;
    private _currentOrderUserId: string;

    constructor() {
        this._currentOrderUserId = Meteor.userId();
     }

    ngOnInit() {
        this._itemsSub = MeteorObservable.subscribe('itemsByUser', Meteor.userId()).subscribe(() => {
            this._items = Items.find({_id: this.orderItem.itemId});
        });

        this._imageThumbSub = MeteorObservable.subscribe('itemImageThumbsByUserId', Meteor.userId()).subscribe();
    }

    getItemThumb(_itemId: string): string {
        let _imageThumb;
        _imageThumb = ItemImagesThumbs.find().fetch().filter((i) => i.itemId === _itemId)[0];
        if (_imageThumb) {
            return _imageThumb.url;
        } else {
            return '/assets/img/default-plate.png';
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

    ionViewWillLeave() {
        this._imageThumbSub.unsubscribe();
        this._itemsSub.unsubscribe();
    }
}