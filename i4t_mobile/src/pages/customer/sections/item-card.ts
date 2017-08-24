
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ItemImagesThumbs } from 'qmo_web/both/collections/administration/item.collection';
import { Item } from 'qmo_web/both/models/administration/item.model';
import { Currencies } from 'qmo_web/both/collections/general/currency.collection';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'item-card',
  templateUrl: 'item-card.html'
})

export class ItemCardComponent implements OnInit, OnDestroy {

  @Input()
  itemIdIn: Item;

  @Input()
  resCode: string;

  @Output()
  itemIdOut: EventEmitter<string> = new EventEmitter<string>();

  private _imageThumbs;
  private _imageThumbSub: Subscription;
  private _currenciesSub: Subscription;
  private _currencyCode: string;


  constructor() { }

  ngOnInit() {
    this._imageThumbSub = MeteorObservable.subscribe('itemImageThumbsByRestaurant', this.resCode).subscribe(() => {
      this._imageThumbs = ItemImagesThumbs.find({});
    });
    this._currenciesSub = MeteorObservable.subscribe('getCurrenciesByRestaurantsId', [this.resCode]).subscribe(() => {
      this._currencyCode = Currencies.collection.find({}).fetch()[0].code + ' ';
    });
  }

  getItemThumb(_itemId: string): string {
    let _imageThumb;
    _imageThumb = ItemImagesThumbs.find().fetch().filter((i) => i.itemId === _itemId)[0];
    if (_imageThumb) {
      return _imageThumb.url;
    }
  }

  goToDetail(_itemId: string) {
    this.itemIdOut.emit(_itemId);
  }

  /**
   * Return Item price by current restaurant
   * @param {Item} _pItem 
   */
  getItemPrice(_pItem: Item): number {
    return _pItem.restaurants.filter(r => r.restaurantId === this.resCode)[0].price;
  }

  /**
  * Function to get item avalaibility 
  */
  getItemAvailability(): boolean {
    let _itemRestaurant = this.itemIdIn;
    let aux = _itemRestaurant.restaurants.find(element => element.restaurantId === this.resCode);
    return aux.isAvailable;
  }

  ngOnDestroy() {
    this._imageThumbSub.unsubscribe();
    this._currenciesSub.unsubscribe();
  }
}