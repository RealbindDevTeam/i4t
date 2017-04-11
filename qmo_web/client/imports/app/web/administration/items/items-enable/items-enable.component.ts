import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { Item } from '../../../../../../../both/models/administration/item.model';
import { Items } from '../../../../../../../both/collections/administration/item.collection';

import template from './items-enable.component.html';
import style from './items-enable.component.scss';

@Component({
    selector: 'item-enable',
    template,
    styles: [ style ]
})
export class ItemEnableComponent implements OnInit, OnDestroy {
    
    private _itemsSub: Subscription;
    private _items: Observable<Item[]>;
    private _itemsFilter: Item[] = [];

    /**
     * ItemEnableComponent Constructor
     * @param {TranslateService} _translate 
     */
    constructor( private _translate: TranslateService, private _ngZone: NgZone ){
        var _userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        this._itemsSub = MeteorObservable.subscribe( 'items', Meteor.userId() ).subscribe( () => {
            this._ngZone.run( () => {
                this._items = Items.find( { } ).zone();
                this._itemsFilter = Items.collection.find( { } ).fetch();
            });
        });
    }

    /**
     * Update item available flag
     * @param {Item} _item 
     */
    updateAvailableFlag( _item:Item ):void{
        Items.update( _item._id, {
            $set: {
                isAvailable: !_item.isAvailable,
                modification_date: new Date(),
                modification_user: Meteor.userId()
            }
        });
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this._itemsSub.unsubscribe();
    }
}