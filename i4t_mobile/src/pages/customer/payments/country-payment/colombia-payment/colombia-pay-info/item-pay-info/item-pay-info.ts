import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Currencies } from 'qmo_web/both/collections/general/currency.collection';
import { Items } from 'qmo_web/both/collections/administration/item.collection';
import { ItemImagesThumbs } from 'qmo_web/both/collections/administration/item.collection';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';

@Component({
    selector: 'item-pay-info',
    templateUrl: 'item-pay-info.html'
})

export class ItemPayInfoComponent implements OnInit, OnDestroy {

    @Input() itemId     : string;
    @Input() currency   : string;
    @Input() price      : number;
    @Input() quantity   : number;
    private _itemSubscription       : Subscription;
    private _imageThumbSubscription : Subscription;
    private _currencySubscription   : Subscription;
    private _items                  : any;

    /**
     * ItemPayInfoComponent constructor
     */
    constructor(){
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        this.removeSubscriptions();
        this._itemSubscription = MeteorObservable.subscribe('itemById', this.itemId).subscribe(()=>{
            this._items = Items.find({_id : this.itemId});
        });
        this._imageThumbSubscription = MeteorObservable.subscribe('itemImageThumbsByUserId', Meteor.userId()).subscribe();

        this._currencySubscription = MeteorObservable.subscribe('getCurrenciesByCurrentUser', Meteor.userId()).subscribe(() => {});
    }

    getItemThumb(_itemId: string): string {
        let _imageThumb;
        _imageThumb = ItemImagesThumbs.find().fetch().filter((i) => i.itemId === _itemId)[0];
        if (_imageThumb) {
            return _imageThumb.url;
        } else {
            return 'assets/img/default-plate.png';
        }
    }

    getIdCurrency(pCurrency) : string{
        let _lCurrencyCode = Currencies.findOne({code : pCurrency });
        if(_lCurrencyCode){
            return _lCurrencyCode._id;
        } else {
            return "";
        }
    }

    /**
     * ngOnDestroy implimentation
     */
    ngOnDestroy(){
        this.removeSubscriptions();
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._itemSubscription ){ this._itemSubscription.unsubscribe(); }
        if( this._imageThumbSubscription ){ this._imageThumbSubscription.unsubscribe(); }
        if( this._currencySubscription ){ this._currencySubscription.unsubscribe(); }
    }
}