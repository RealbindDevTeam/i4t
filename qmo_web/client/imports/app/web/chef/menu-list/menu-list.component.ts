import { Component, OnInit, OnDestroy, NgZone, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { MdSnackBar, MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Section } from '../../../../../../both/models/administration/section.model';
import { Sections } from '../../../../../../both/collections/administration/section.collection';
import { Category } from '../../../../../../both/models/administration/category.model';
import { Categories } from '../../../../../../both/collections/administration/category.collection';
import { Subcategory } from '../../../../../../both/models/administration/subcategory.model';
import { Subcategories } from '../../../../../../both/collections/administration/subcategory.collection';
import { Item, ItemImage } from '../../../../../../both/models/administration/item.model';
import { Items, ItemImages } from '../../../../../../both/collections/administration/item.collection';
import { OrderMenu } from '../../customer/orders/order-navigation/order-menu';
import { OrderNavigationService } from '../../customer/orders/order-navigation/order-navigation.service';
import { GarnishFood } from '../../../../../../both/models/administration/garnish-food.model';
import { GarnishFoodCol } from '../../../../../../both/collections/administration/garnish-food.collection';
import { Addition } from '../../../../../../both/models/administration/addition.model';
import { Additions } from '../../../../../../both/collections/administration/addition.collection';
import { Order, OrderItem, OrderAddition } from '../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../both/collections/restaurant/order.collection';
import { Currencies } from '../../../../../../both/collections/general/currency.collection';
import { AlertConfirmComponent } from '../../../web/general/alert-confirm/alert-confirm.component';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';

import template from './menu-list.component.html';
import style from './menu-list.component.scss';

@Component({
    selector: 'menu-list',
    template,
    styles: [style]
})
export class MenuListComponent implements OnInit, OnDestroy {

    @Output() finishOrdenCreation = new EventEmitter();

    private _newOrderForm: FormGroup;
    private _garnishFormGroup: FormGroup = new FormGroup({});
    private _additionsFormGroup: FormGroup = new FormGroup({});
    private _additionsDetailFormGroup: FormGroup = new FormGroup({});
    private _mdDialogRef: MdDialogRef<any>;

    private _sectionsSub: Subscription;
    private _categoriesSub: Subscription;
    private _subcategoriesSub: Subscription;
    private _itemsSub: Subscription;
    private _garnishFoodSub: Subscription;
    private _additionsSub: Subscription;
    private _ordersSub: Subscription;
    private _itemImagesSub: Subscription;
    private _currenciesSub: Subscription;
    private _restaurantSub: Subscription;

    private _sections: Observable<Section[]>;
    private _categories: Observable<Category[]>;
    private _subcategories: Observable<Subcategory[]>;
    private _items: Observable<Item[]>;
    private _itemDetail: Observable<Item[]>;
    private _garnishFoodCol: Observable<GarnishFood[]>;
    private _additions: Observable<Addition[]>;

    private restaurantId: string;

    private _finalPrice: number = 0;
    private _maxGarnishFoodElements: number = 0;
    private _garnishFoodElementsCount: number = 0;
    private _numberColums: number = 3;
    private _showGarnishFoodError: boolean = false;
    private _unitPrice: number = 0;
    private _lastQuantity: number = 1;
    private _quantityCount: number = 1;
    private _currencyCode: string;
    private titleMsg: string;
    private btnAcceptLbl: string;

    private _orderMenus: OrderMenu[] = [];
    private orderMenuSetup: OrderMenu[] = [];

    /**
     * MenuListComponent Constructor
     * @param {FormBuilder} _formBuilder 
     * @param {TranslateService} _translate 
     * @param {OrderNavigationService} _navigation 
     * @param {NgZone} _ngZone 
     * @param {MdSnackBar} snackBar
     * @param {UserLanguageService} _userLanguageService
     */
    constructor(private _formBuilder: FormBuilder,
        private _translate: TranslateService,
        private _navigation: OrderNavigationService,
        private _ngZone: NgZone,
        public snackBar: MdSnackBar,
        private _userLanguageService: UserLanguageService,
        protected _mdDialog: MdDialog) {
        _translate.use(this._userLanguageService.getLanguage(Meteor.user()));
        _translate.setDefaultLang('en');
        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit() {
        this.removeSubscriptions();

        this._restaurantSub = MeteorObservable.subscribe('getRestaurantByRestaurantWork', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
                this.restaurantId = Restaurants.collection.find({}).fetch()[0]._id;
            });
        });

        this._itemsSub = MeteorObservable.subscribe('getItemsByRestaurantWork', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
                this._items = Items.find({}).zone();
            });
        });
        this._itemImagesSub = MeteorObservable.subscribe('getItemImageByRestaurantWork', Meteor.userId()).subscribe();
        this._garnishFoodSub = MeteorObservable.subscribe('garnishFoodByRestaurantWork', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
                this._garnishFoodCol = GarnishFoodCol.find({}).zone();
                GarnishFoodCol.collection.find({}).fetch().forEach((gar) => {
                    let control: FormControl = new FormControl(false);
                    this._garnishFormGroup.addControl(gar._id, control);
                });
            });
        });
        this._additionsSub = MeteorObservable.subscribe('additionsByRestaurantWork', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
                this._additions = Additions.find({}).zone();
                this._additions.subscribe(() => { this.buildCustomerMenu(); this.buildAdditionsForms(); });
            });
        });
        this._sectionsSub = MeteorObservable.subscribe('getSectionsByRestaurantWork', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
                this._sections = Sections.find({}).zone();
                this._sections.subscribe(() => { this.buildCustomerMenu(); });
            });
        });
        this._categoriesSub = MeteorObservable.subscribe('getCategoriesByRestaurantWork', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
                this._categories = Categories.find({}).zone();
                this._categories.subscribe(() => { this.buildCustomerMenu(); });
            });
        });
        this._subcategoriesSub = MeteorObservable.subscribe('getSubcategoriesByRestaurantWork', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
                this._subcategories = Subcategories.find({}).zone();
                this._subcategories.subscribe(() => { this.buildCustomerMenu(); });
            });
        });
        this._currenciesSub = MeteorObservable.subscribe('getCurrenciesByRestaurantWork', Meteor.userId()).subscribe(() => {
            this._ngZone.run(() => {
                this._currencyCode = Currencies.findOne({}).code + ' ';
            });
        });
        this._newOrderForm = new FormGroup({
            observations: new FormControl('', [Validators.maxLength(50)]),
            garnishFood: this._garnishFormGroup,
            additions: this._additionsFormGroup
        });
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions(): void {
        if (this._sectionsSub) { this._sectionsSub.unsubscribe(); }
        if (this._categoriesSub) { this._categoriesSub.unsubscribe(); }
        if (this._subcategoriesSub) { this._subcategoriesSub.unsubscribe(); }
        if (this._itemsSub) { this._itemsSub.unsubscribe(); }
        if (this._garnishFoodSub) { this._garnishFoodSub.unsubscribe(); }
        if (this._additionsSub) { this._additionsSub.unsubscribe(); }
        //if (this._ordersSub) { this._ordersSub.unsubscribe(); }
        if (this._itemImagesSub) { this._itemImagesSub.unsubscribe(); }
        if (this._currenciesSub) { this._currenciesSub.unsubscribe(); }
        if (this._restaurantSub) { this._restaurantSub.unsubscribe(); }
    }

    /**
     * Build Customer Menu
     */
    buildCustomerMenu(): void {
        this.orderMenuSetup = [];
        Sections.find().fetch().forEach((s) => {
            let _lCategoryCount: number = 0;
            _lCategoryCount = Categories.find({ section: { $in: [s._id] } }).fetch().length;

            if (_lCategoryCount > 0) {
                let _lSubcategoryCount: number = 0;
                let _lCategories: OrderMenu[] = [];

                Categories.find({ section: { $in: [s._id] } }).fetch().forEach((c) => {
                    let _lSubcategories: OrderMenu[] = [];
                    _lSubcategoryCount = Subcategories.find({ category: { $in: [c._id] } }).fetch().length;

                    if (_lSubcategoryCount > 0) {
                        Subcategories.find({ category: { $in: [c._id] } }).fetch().forEach((s) => {
                            _lSubcategories.push(new OrderMenu(s.name, { id: s._id, type: 'Sub' }, []));
                        });
                        _lCategories.push(new OrderMenu(c.name, { id: c._id, type: 'Ca' }, _lSubcategories));
                    } else {
                        _lCategories.push(new OrderMenu(c.name, { id: c._id, type: 'Ca' }, []));
                    }
                });
                this.orderMenuSetup.push(new OrderMenu(s.name, { id: s._id, type: 'Se' }, _lCategories));
            } else {
                this.orderMenuSetup.push(new OrderMenu(s.name, { id: s._id, type: 'Se' }, []));
            }
        });

        let _lAdditions: number = Additions.collection.find({}).count();
        if (_lAdditions > 0) {
            this.orderMenuSetup.push(new OrderMenu(this.itemNameTraduction('ORDER_CREATE.ADDITIONS'), { id: 9999, type: 'Ad' }, []));
        }

        this._navigation.setOrderMenus(this.orderMenuSetup);
        this._navigation.orderMenus.subscribe(orderMenus => {
            this._orderMenus = orderMenus;
        });
    }

    /**
     * Build controls in additions forms
     */
    buildAdditionsForms(): void {
        Additions.collection.find({}).fetch().forEach((add) => {
            if (this._additionsFormGroup.contains(add._id)) {
                this._additionsFormGroup.controls[add._id].setValue(false);
            } else {
                let control: FormControl = new FormControl(false);
                this._additionsFormGroup.addControl(add._id, control);
            }

            if (this._additionsDetailFormGroup.contains(add._id)) {
                this._additionsDetailFormGroup.controls[add._id].setValue('');
            } else {
                let control: FormControl = new FormControl({ value: '', disabled: true }, [Validators.minLength(1), Validators.maxLength(2)]);
                this._additionsDetailFormGroup.addControl(add._id, control);
            }
        });
    }

    /**
     * This function evaluate Id returned in the menu and filter item collection
     * @param {any} _any 
     */
    evaluateId(_any: any): void {
        if (_any.type === 'Se') {
            this._items = Items.find({ sectionId: { $in: ['' + _any.id + ''] } }).zone();
        } else if (_any.type === 'Ca') {
            this._items = Items.find({ categoryId: { $in: ['' + _any.id + ''] } }).zone();
        } else if (_any.type === 'Sub') {
            this._items = Items.find({ subcategoryId: { $in: ['' + _any.id + ''] } }).zone();
        } else if (_any.type === 'Ad') {
            this.showAllItems();
            this._additionsDetailFormGroup.reset();
            this.viewItemDetail(true);
            this.viewAdditionDetail(false);
        }
    }

    /**
     * Show All restaurant items
     */
    showAllItems(): void {
        this._items = Items.find({}).zone();
    }

    /**
     * This function show item information
     * @param {Item} _pItem 
     */
    showItemInformation(_pItem: Item): void {
        this._itemDetail = Items.find({ _id: _pItem._id }).zone();
        //this._finalPrice = this.getItemPrice(_pItem);
        //this._unitPrice = this.getItemPrice(_pItem);
        this.resetItemDetailVariables();
        this.viewAdditionDetail(true);
        this.viewItemDetail(false);
    }

    /**
     * Return Item price by current restaurant
     * @param {Item} _pItem 
     */

    getItemPrice(_pItem: Item): number {
        return _pItem.restaurants.filter(r => r.restaurantId === this.restaurantId)[0].price;
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
     * Return to order component
     * @param {boolean} _finish 
     */

    finishOrderCreation(_finish: boolean): void {
        this.finishOrdenCreation.emit(_finish);
    }


    /**
     * This function allow view item detail
     * @param {boolean} _boolean 
     */
    viewItemDetail(_boolean: boolean): void {
        var card = document.getElementById("item-selected");

        if (!_boolean) {
            card.style.width = "396px";
        } else {
            card.style.width = "0";
            card.removeAttribute("style");
        }
    }

    /**
     * This function allow view additions
     * @param {boolean} _boolean 
     */
    viewAdditionDetail(_boolean: boolean): void {
        var card = document.getElementById("addition-detail");

        if (!_boolean) {
            card.style.width = "396px";
        } else {
            card.style.width = "0";
            card.removeAttribute("style");
        }
    }

    /**
     * Reset item detail Variables
     */
    resetItemDetailVariables(): void {
        this._lastQuantity = 1;
        this._quantityCount = 1;
        this._showGarnishFoodError = false;
        this._garnishFoodElementsCount = 0;
        this._newOrderForm.reset();
    }

    /**
     * Return _quantityCount
     */
    get quantityCount(): number {
        return this._quantityCount;
    }

    /**
     * Add quantity item
     */
    addCount(): void {
        this._lastQuantity = this._quantityCount;
        this._quantityCount += 1;
        this.calculateFinalPriceQuantity();
    }

    /**
     * Subtract quantity item
     */
    removeCount(): void {
        if (this._quantityCount > 1) {
            this._lastQuantity = this._quantityCount;
            this._quantityCount -= 1;
        }
        this.calculateFinalPriceQuantity();
    }

    /**
     * Calculate final price when item quantity is entered
     */
    calculateFinalPriceQuantity(): void {
        if (Number.isFinite(this._quantityCount)) {
            this._finalPrice = this._unitPrice * this._quantityCount;
            this._garnishFoodElementsCount = 0;
            this._garnishFormGroup.reset();
            this._additionsFormGroup.reset();
            this._showGarnishFoodError = false;
        }
    }

    /**
     * Validate Garnish food selections and show message error if count is greater than item.garnishFoodQuantity
     */
    validateGarnishFoodElements(): void {
        if (this._garnishFoodElementsCount > this._maxGarnishFoodElements) {
            this._showGarnishFoodError = true;
        } else {
            this._showGarnishFoodError = false;
        }
    }

    /**
     * Return _finalPrice
     */
    get finalPrice(): number {
        return this._finalPrice;
    }

    /**
     * Set max garnish food elements
     * @param {number} _pGarnishFoodQuantity
     */
    setMaxGarnishFoodElements(_pGarnishFoodQuantity: number): void {
        this._maxGarnishFoodElements = _pGarnishFoodQuantity;
    }

    /**
     * Return addition information
     * @param {Addition} _pAddition
     */
    getAdditionInformation(_pAddition: Addition): string {
        return _pAddition.name + ' - ' + _pAddition.restaurants.filter(r => r.restaurantId === this.restaurantId)[0].price + ' ';
    }

    /**
     * Return garnish food information
     * @param {GarnishFood} _pGarnishFood
     */

    getGarnishFoodInformation(_pGarnishFood: GarnishFood): string {
        return _pGarnishFood.name + ' - ' + _pGarnishFood.restaurants.filter(r => r.restaurantId === this.restaurantId)[0].price + ' ';
    }

    /**
     * Return traduction
     * @param {string} itemName 
     */
    itemNameTraduction(itemName: string): string {
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res;
        });
        return wordTraduced;
    }

    /**
     * Function to get item avalaibility 
     */
    getItemAvailability(itemId: string): boolean {
        let _itemRestaurant: Item = Items.collection.findOne({ _id: itemId }, { fields: { _id: 0, restaurants: 1 } });
        let aux = _itemRestaurant.restaurants.find(element => element.restaurantId === this.restaurantId);
        return aux.isAvailable;
    }


    /**
    * This function open de error dialog according to parameters 
    * @param {string} title
    * @param {string} subtitle
    * @param {string} content
    * @param {string} btnCancelLbl
    * @param {string} btnAcceptLbl
    * @param {boolean} showBtnCancel
    */
    openDialog(title: string, subtitle: string, content: string, btnCancelLbl: string, btnAcceptLbl: string, showBtnCancel: boolean) {

        this._mdDialogRef = this._mdDialog.open(AlertConfirmComponent, {
            disableClose: true,
            data: {
                title: title,
                subtitle: subtitle,
                content: content,
                buttonCancel: btnCancelLbl,
                buttonAccept: btnAcceptLbl,
                showBtnCancel: showBtnCancel
            }
        });
        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = result;
            if (result.success) {

            }
        });
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy() {
        this.removeSubscriptions();
    }
}