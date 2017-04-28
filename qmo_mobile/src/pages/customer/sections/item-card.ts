
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ItemImagesThumbs } from 'qmo_web/both/collections/administration/item.collection';
import { Item } from 'qmo_web/both/models/administration/item.model';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'item-card',
  templateUrl: 'item-card.html'
})

export class ItemCardComponent {

  @Input()
  itemIdIn: Item;

  @Input()
  resCode: string;

  @Output()
  itemIdOut: EventEmitter<string> = new EventEmitter<string>();

  private _imageThumbs;
  private _imageThumbSub: Subscription;

  constructor() { }

  ngOnInit() {
    this._imageThumbSub = MeteorObservable.subscribe('itemImageThumbsByRestaurant', this.resCode).subscribe(() => {
      this._imageThumbs = ItemImagesThumbs.find({});
    });
  }

  getItemThumb(_itemId: string): string {
    let _imageThumb
    _imageThumb = ItemImagesThumbs.find().fetch().filter((i) => i.itemId === _itemId)[0];
    if (_imageThumb) {
      return _imageThumb.url;
    }
  }

  goToDetail(_itemId: string){
    console.log('envia itemId' + _itemId);
    this.itemIdOut.emit(_itemId);
  }

}