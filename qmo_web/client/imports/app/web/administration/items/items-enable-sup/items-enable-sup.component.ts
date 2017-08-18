import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Item, ItemImage, ItemPrice, ItemRestaurant } from '../../../../../../../both/models/administration/item.model';
import { Items, ItemImages } from '../../../../../../../both/collections/administration/item.collection';
import { UserDetail } from '../../../../../../../both/models/auth/user-detail.model';
import { UserDetails } from '../../../../../../../both/collections/auth/user-detail.collection';

import template from './items-enable-sup.component.html';
import style from '../item.component.scss';

@Component({
    selector: 'item-enable-sup',
    template,
    styles: [style]
})

export class ItemEnableSupComponent implements OnInit, OnDestroy {

    private _itemsSub: Subscription;
    private _itemImagesSub: Subscription;
    private _userDetailSub: Subscription;
    private _items: Observable<Item[]>;
    private _itemsFilter: Item[] = [];
    private _userDetail: UserDetail;

    constructor(private _translate: TranslateService,
        private _ngZone: NgZone,
        private _userLanguageService: UserLanguageService) {
        _translate.use(this._userLanguageService.getLanguage(Meteor.user()));
        _translate.setDefaultLang('en');
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit() {
        this._itemsSub = MeteorObservable.subscribe('getItemsByUserRestaurantWork', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
                this._items = Items.find({}).zone();
                this._itemsFilter = Items.collection.find({}).fetch();
            });
        });

        this._itemImagesSub = MeteorObservable.subscribe('allItemImages').subscribe();
        this._userDetailSub = MeteorObservable.subscribe('getUserDetailsByUser', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
                this._userDetail = UserDetails.collection.findOne({ user_id: Meteor.userId() });
            });
        });
    }

    /**
     * Update item available flag
     * @param {Item} _item 
     */
    updateAvailableFlag(_item: Item): void {
        if (this._userDetail) {
            MeteorObservable.call('updateItemAvailable', this._userDetail, _item).subscribe();
        }
    }

    /**
     * Get the item available for the supervisor restaurant
     */
    getItemAvailable(_item: Item): boolean {
        let _itemRestaurant
        /**
         * let _userDetail: UserDetail = UserDetails.collection.findOne({ user_id: Meteor.userId() });
         */
        if (this._userDetail) {
            _itemRestaurant = Items.collection.findOne({ _id: _item._id }, { fields: { _id: 0, restaurants: 1 } });
            let aux = _itemRestaurant.restaurants.find(element => element.restaurantId === this._userDetail.restaurant_work);
            return aux.isAvailable;
        } else {
            return;
        }
    }

    /**
     * Return item image
     * @param {string} _itemId
     */
    getItemImage(_itemId: string): string {
        let _lItemImage: ItemImage = ItemImages.findOne({ itemId: _itemId });
        if (_lItemImage) {
            return _lItemImage.url;

        } else {
            return '/images/default-plate.png';
        }
    }

    ngOnDestroy() {
        this._itemsSub.unsubscribe();
        this._itemImagesSub.unsubscribe();
    }
}
