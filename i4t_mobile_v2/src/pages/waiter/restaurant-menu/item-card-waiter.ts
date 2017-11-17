
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ItemImagesThumbs } from 'qmo_web/both/collections/administration/item.collection';
import { Item } from 'qmo_web/both/models/administration/item.model';
import { Currencies } from 'qmo_web/both/collections/general/currency.collection';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { UserLanguageServiceProvider } from '../../../providers/user-language-service/user-language-service';

@Component({
  selector: 'item-card-waiter',
  templateUrl: 'item-card-waiter.html'
})

export class ItemCardWaiterComponent implements OnInit, OnDestroy {

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


  constructor(public _translate: TranslateService,
              private _userLanguageService: UserLanguageServiceProvider) {
    _translate.setDefaultLang('en');
  }

  ngOnInit() {
    this._translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
    this.removeSubscriptions();
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
    } else {
      return 'assets/img/default-plate.png';
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
    this.removeSubscriptions();
  }

  /**
   * Remove all subscriptions
   */
  removeSubscriptions():void{
    if( this._imageThumbSub ){ this._imageThumbSub.unsubscribe(); }
    if( this._currenciesSub ){ this._currenciesSub.unsubscribe(); }
  }
}