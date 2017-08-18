import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Item, ItemImage, ItemPrice } from '../../../../../../../both/models/administration/item.model';
import { Items, ItemImages } from '../../../../../../../both/collections/administration/item.collection';

import template from './items-enable.component.html';
import style from '../item.component.scss';

@Component({
    selector: 'item-enable',
    template,
    styles: [style]
})
export class ItemEnableComponent implements OnInit, OnDestroy {

    private _itemsSub: Subscription;
    private _itemImagesSub: Subscription;
    private _items: Observable<Item[]>;
    private _itemsFilter: Item[] = [];

    /**
     * ItemEnableComponent Constructor
     * @param {TranslateService} _translate
     * @param {NgZone} _ngZone
     * @param {UserLanguageService} _userLanguageService
     */
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
        this._itemsSub = MeteorObservable.subscribe('items', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
                this._items = Items.find({}).zone();
                this._itemsFilter = Items.collection.find({}).fetch();
            });
        });
        this._itemImagesSub = MeteorObservable.subscribe('itemImages', Meteor.userId()).subscribe();
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

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy() {
        this._itemsSub.unsubscribe();
        this._itemImagesSub.unsubscribe();
    }
}