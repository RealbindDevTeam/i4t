import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Additions } from 'qmo_web/both/collections/administration/addition.collection';
import { Restaurants, RestaurantImageThumbs } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { Cities } from 'qmo_web/both/collections/settings/city.collection';
import { Countries } from 'qmo_web/both/collections/settings/country.collection';
import { Sections } from 'qmo_web/both/collections/administration/section.collection';
import { Categories } from 'qmo_web/both/collections/administration/category.collection';
import { Subcategories } from 'qmo_web/both/collections/administration/subcategory.collection';
import { Items, ItemImagesThumbs } from 'qmo_web/both/collections/administration/item.collection';
import { ItemDetailPage } from '../item-detail/item-detail';
import { AdditionsPage } from './additions/additions';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-sections',
  templateUrl: 'sections.html'
})
export class SectionsPage implements OnInit, OnDestroy {

  @ViewChild(Content) content: Content;

  private _userLang: string;
  private _sections;
  private _sectionsSub: Subscription;
  private _restaurants;
  private _restaurantSub: Subscription;
  private _cities;
  private _citySub: Subscription;
  private _countries;
  private _countrySub: Subscription;
  private _categories;
  private _categorySub: Subscription;
  private _subcategories;
  private _subcategorySub: Subscription;
  private _items;
  private _itemSub: Subscription;
  private _imageThumbs;
  private _imageThumbSub: Subscription;
  private _restaurantThumbSub: Subscription;
  private _additions;
  private _additionsSub: Subscription;

  private _res_code: string = '';
  private _table_code: string = '';
  private selected: string;
  private _item_code: string;
  private _additionsShow: boolean = false;

  constructor(public _navCtrl: NavController, public _navParams: NavParams, public _translate: TranslateService, public _storage: Storage) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);

    this._res_code = this._navParams.get("res_id");
    this._table_code = this._navParams.get("table_id");
    
    this.selected = 'all';
  }

  ngOnInit() {

    this._sectionsSub = MeteorObservable.subscribe('sectionsByRestaurant', this._res_code).subscribe(() => {
      this._sections = Sections.find({});
    });
    this._restaurantSub = MeteorObservable.subscribe('getRestaurantByCurrentUser', Meteor.userId()).subscribe(() => {
      this._restaurants = Restaurants.find({});
    });
    this._citySub = MeteorObservable.subscribe('getCityByRestaurantId', this._res_code).subscribe(() => {
      this._cities = Cities.find({});
    });
    this._countrySub = MeteorObservable.subscribe('getCountryByRestaurantId', this._res_code).subscribe(() => {
      this._countries = Countries.find({});
    });
    this._categorySub = MeteorObservable.subscribe('categoriesByRestaurant', this._res_code).subscribe(() => {
      this._categories = Categories.find({});
    });
    this._subcategorySub = MeteorObservable.subscribe('subcategoriesByRestaurant', this._res_code).subscribe(() => {
      this._subcategories = Subcategories.find({});
    });
    this._itemSub = MeteorObservable.subscribe('itemsByRestaurant', this._res_code).subscribe(() => {
      this._items = Items.find({});
    });
    this._imageThumbSub = MeteorObservable.subscribe('itemImageThumbsByRestaurant', this._res_code).subscribe(() => {
      this._imageThumbs = ItemImagesThumbs.find({});
    });
    this._restaurantThumbSub = MeteorObservable.subscribe('restaurantImageThumbsByRestaurantId', this._res_code).subscribe();

    this._additionsSub = MeteorObservable.subscribe( 'additionsByRestaurant', this._res_code ).subscribe( () => {
        this._additions = Additions.find({});
        this._additions.subscribe( () => { 
          let _lAdditions: number = Additions.collection.find( { } ).count();
          _lAdditions > 0 ? this._additionsShow = true : this._additionsShow = false;
        });
    });
  }

  validateSection(section_selected) {
    if (section_selected == 'all') {
      this._items = Items.find({});
      this._categories = Categories.find({});
      this._subcategories = Subcategories.find({});
    } else if(section_selected === 'addition'){
      this.goToAddAdditions();
    }
    else {
      this._items = Items.find({ sectionId: section_selected });
      this._categories = Categories.find({ section: section_selected });
      this._subcategories = Subcategories.find({});
    }
  }

  goTop() {
    this.content.scrollToTop();
  }

  goToDetail(_itemId) {
    this._navCtrl.push(ItemDetailPage, { item_id: _itemId, res_id: this._res_code, table_id: this._table_code });
  }

  getItem(event){
    this._item_code = event;
    this._navCtrl.push(ItemDetailPage, { item_id: this._item_code, res_id: this._res_code, table_id: this._table_code });
  }

  goToAddAdditions(){
    this._navCtrl.push(AdditionsPage, { res_id: this._res_code, table_id: this._table_code });
  }

  getRestaurantThumb(_id: string): string {
    let _imageThumb;
    _imageThumb = RestaurantImageThumbs.find().fetch().filter((i) => i.restaurantId === _id)[0];
    if (_imageThumb) {
      return _imageThumb.url;
    }
  }

  ngOnDestroy() {
    this._sectionsSub.unsubscribe();
    this._restaurantSub.unsubscribe();
    this._citySub.unsubscribe();
    this._countrySub.unsubscribe();
    this._categorySub.unsubscribe();
    this._subcategorySub.unsubscribe();
    this._itemSub.unsubscribe();
    this._restaurantThumbSub.unsubscribe();
    this._additionsSub.unsubscribe();
  }
}