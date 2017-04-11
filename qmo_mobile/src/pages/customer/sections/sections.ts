import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { Subscription, Subject, Observable } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Restaurant } from 'qmo_web/both/models/restaurant/restaurant.model';
import { Restaurants } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { Table } from 'qmo_web/both/models/restaurant/table.model';
import { Tables } from 'qmo_web/both/collections/restaurant/table.collection';
import { City } from 'qmo_web/both/models/settings/city.model';
import { Cities } from 'qmo_web/both/collections/settings/city.collection';
import { Country } from 'qmo_web/both/models/settings/country.model';
import { Countries } from 'qmo_web/both/collections/settings/country.collection';
import { Section } from 'qmo_web/both/models/administration/section.model';
import { Sections } from 'qmo_web/both/collections/administration/section.collection';
import { Category } from 'qmo_web/both/models/administration/category.model';
import { Categories } from 'qmo_web/both/collections/administration/category.collection';
import { Subcategory } from 'qmo_web/both/models/administration/subcategory.model';
import { Subcategories } from 'qmo_web/both/collections/administration/subcategory.collection';
import { Item } from 'qmo_web/both/models/administration/item.model';
import { Items } from 'qmo_web/both/collections/administration/item.collection';
import { ItemDetailPage } from '../item-detail/item-detail';
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
  private _userDetail;
  private _userDetailSub: Subscription;
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

  private _res_code: string = '';
  private _table_code: string = '';
  private selected: string = 'all';
  private _showFabTop: boolean = true;

  constructor(public _navCtrl: NavController, public _navParams: NavParams, public _translate: TranslateService, public _storage: Storage) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);

    this._res_code = this._navParams.get("res_id");
    this._table_code = this._navParams.get("table_id");

    let trobj = {
      edoc_rs: this._res_code,
      evalc_tb: this._table_code
    };

    this._storage.ready().then(() => {
      this._storage.set('trobj', trobj);
    });
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
  }

  validateSection(section_selected) {
    if (section_selected == 'all') {
      this._items = Items.find({});
      this._categories = Categories.find({});
      this._subcategories = Subcategories.find({});
    } else {
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

  ngOnDestroy() {
    this._sectionsSub.unsubscribe();
    this._restaurantSub.unsubscribe();
    this._citySub.unsubscribe();
    this._countrySub.unsubscribe();
    this._categorySub.unsubscribe();
    this._subcategorySub.unsubscribe();
    this._itemSub.unsubscribe();
  }
}