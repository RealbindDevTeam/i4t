import { Component, OnInit, OnDestroy, Input, NgZone, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { MdSnackBar } from '@angular/material';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Order, OrderItem, OrderAddition } from '../../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../../both/collections/restaurant/order.collection';
import { Item, ItemImage, ItemImageThumb } from '../../../../../../../both/models/administration/item.model';
import { Items, ItemImages, ItemImagesThumbs } from '../../../../../../../both/collections/administration/item.collection';
import { GarnishFood } from '../../../../../../../both/models/administration/garnish-food.model';
import { GarnishFoodCol } from '../../../../../../../both/collections/administration/garnish-food.collection';
import { Addition } from '../../../../../../../both/models/administration/addition.model';
import { Additions } from '../../../../../../../both/collections/administration/addition.collection';
import { Currencies } from '../../../../../../../both/collections/general/currency.collection';

import template from './order-list.component.html';
import style from './order-list.component.scss';

@Component({
    selector: 'order-list',
    template,
    styles: [style]
})
export class OrdersListComponent implements OnInit, OnDestroy {

    @Input() restaurantId: string;
    @Input() tableQRCode: string;
    @Input() restaurantCurrency: string;
    @Output() createNewOrder = new EventEmitter();

    private _user = Meteor.userId();
    private _ordersSub: Subscription;
    private _itemsSub: Subscription;
    private _garnishFoodSub: Subscription;
    private _additionsSub: Subscription;
    private _itemImagesSub: Subscription;
    private _itemImageThumbsSub: Subscription;
    private _currenciesSub: Subscription;

    private _orders: Observable<Order[]>;
    private _ordersTable: Observable<Order[]>;
    private _items: Observable<Item[]>;
    private _itemsToShowDetail: Observable<Item[]>;
    private _garnishFoodCol: Observable<GarnishFood[]>;
    private _additions: Observable<Addition[]>;
    private _additionDetails: Observable<Addition[]>;

    private _showOrderItemDetail: boolean = false;
    private _currentOrder: Order;
    private _customerCanEdit: boolean = false;
    private _showDetails: boolean = false;

    private _editOrderItemForm: FormGroup;
    private _garnishFormGroup: FormGroup = new FormGroup({});
    private _additionsFormGroup: FormGroup = new FormGroup({});
    private _additionsDetailFormGroup: FormGroup = new FormGroup({});

    private _orderItemGarnishFood: string[] = [];
    private _orderItemAdditions: string[] = [];

    private _maxGarnishFoodElements: number = 0;
    private _garnishFoodElementsCount: number = 0;
    private _showGarnishFoodError: boolean = false;

    private _lastQuantity: number = 1;
    private _quantityCount: number = 1;
    private _finalPrice: number = 0;
    private _unitPrice: number = 0;
    private _orderItemIndex: number = -1;
    private _currencyCode: string;

    _initialValue = 'customer';
    private _showCustomerOrders: boolean = true;
    private _showOtherOrders: boolean = false;
    private _showAllOrders: boolean = false;
    private _orderCustomerIndex: number = -1;
    private _orderOthersIndex: number = -1;

    /**
     * OrdersListComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone
     * @param {MdSnackBar} snackBar
     * @param {UserLanguageService} _userLanguageService
     */
    constructor(private _translate: TranslateService,
        private _ngZone: NgZone,
        public snackBar: MdSnackBar,
        private _userLanguageService: UserLanguageService) {
        _translate.use(this._userLanguageService.getLanguage(Meteor.user()));
        _translate.setDefaultLang('en');
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit() {
        this._ordersSub = MeteorObservable.subscribe('getOrders', this.restaurantId, this.tableQRCode, ['ORDER_STATUS.REGISTERED', 'ORDER_STATUS.IN_PROCESS', 'ORDER_STATUS.PREPARED']).subscribe(() => {
            this._ngZone.run(() => {
                this._orders = Orders.find({ creation_user: this._user }).zone();
                this._ordersTable = Orders.find({ creation_user: { $not: this._user } }).zone();
            });
        });
        this._itemsSub = MeteorObservable.subscribe('itemsByRestaurant', this.restaurantId).subscribe(() => {
            this._ngZone.run(() => {
                this._items = Items.find({}).zone();
            });
        });

        this._showOrderItemDetail = false;

        this._editOrderItemForm = new FormGroup({
            observations: new FormControl('', [Validators.maxLength(50)]),
            garnishFood: this._garnishFormGroup,
            additions: this._additionsFormGroup
        });

        this._garnishFoodSub = MeteorObservable.subscribe('garnishFoodByRestaurant', this.restaurantId).subscribe(() => {
            this._ngZone.run(() => {
                this._garnishFoodCol = GarnishFoodCol.find({}).zone();
            });
        });
        this._additionsSub = MeteorObservable.subscribe('additionsByRestaurant', this.restaurantId).subscribe(() => {
            this._ngZone.run(() => {
                this._additions = Additions.find({}).zone();
            });
        });
        this._itemImagesSub = MeteorObservable.subscribe('itemImagesByRestaurant', this.restaurantId).subscribe();
        this._itemImageThumbsSub = MeteorObservable.subscribe('itemImageThumbsByRestaurant', this.restaurantId).subscribe();
        this._currenciesSub = MeteorObservable.subscribe('getCurrenciesByRestaurantsId', [this.restaurantId]).subscribe(() => {
            this._ngZone.run(() => {
                this._currencyCode = Currencies.findOne({ _id: this.restaurantCurrency }).code + ' ';
            });
        });
    }

    /**
     * This function allow filter orders
     * @param {number} _pFilter
     */
    changeOrderFilter(_pFilter: string) {
        if (_pFilter === 'all') {
            this._showAllOrders = true;
            this._showCustomerOrders = true;
            this._showOtherOrders = true;
        } else if (_pFilter === 'customer') {
            this._showAllOrders = false;
            this._showCustomerOrders = true;
            this._showOtherOrders = false;
        } else if (_pFilter === 'other') {
            this._showAllOrders = false;
            this._showCustomerOrders = false;
            this._showOtherOrders = true;
        }
        this._showDetails = false;
        this.viewItemDetail(true);
    }

    /**
     * Get Item Image
     * @param {string} _pItemId
     */
    getItemImage(_pItemId: string): string {
        let _lItemImage: ItemImageThumb = ItemImagesThumbs.findOne({ itemId: _pItemId });
        if (_lItemImage) {
            return _lItemImage.url;
        } else {
            return '/images/default-plate.png';
        }
    }

    /**
     * Get Item Image
     * @param {string} _pItemId
     */
    getItemDetailImage(_pItemId: string): string {
        let _lItemImage: ItemImage = ItemImages.findOne({ itemId: _pItemId });
        if (_lItemImage) {
            return _lItemImage.url;
        } else {
            return '/images/default-plate.png';
        }
    }

    /**
     * Function to view item detail
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
     * Delete OrderItem in order
     * @param {Order} _pOrder 
     * @param {string} _pItemId 
     */
    deleteOrderItem(_pItemId: string): void {
        if (confirm(this.itemNameTraduction("ORDER_LIST.DELETE_ORDER"))) {
            let _lOrderItemToremove: OrderItem = this._currentOrder.items.filter(o => _pItemId === o.itemId && o.index === this._orderItemIndex)[0];
            let _lNewTotalPayment: number = this._currentOrder.totalPayment - _lOrderItemToremove.paymentItem;

            Orders.update({ _id: this._currentOrder._id }, { $pull: { items: { itemId: _pItemId, index: this._orderItemIndex } } });
            Orders.update({ _id: this._currentOrder._id },
                {
                    $set: {
                        totalPayment: _lNewTotalPayment,
                        modification_user: this._user,
                        modification_date: new Date()
                    }
                }
            );
            this._showOrderItemDetail = false;
            this._currentOrder = Orders.findOne({ _id: this._currentOrder._id });
            this.viewItemDetail(true);
            let _lMessage: string = this.itemNameTraduction('ORDER_LIST.ITEM_DELETED');
            this.snackBar.open(_lMessage, '', {
                duration: 2500
            });
        }
    }

    /**
     * Delete OrderAddition in order
     * @param {string} _pAdditionId 
     */
    deleteOrderAddition(_pAdditionId: string): void {
        if (confirm(this.itemNameTraduction("ORDER_LIST.DELETE_ADDITION_CONFIRM"))) {
            let _lOrderAdditionToremove: OrderAddition = this._currentOrder.additions.filter(ad => ad.additionId === _pAdditionId)[0];
            let _lNewTotalPayment: number = this._currentOrder.totalPayment - _lOrderAdditionToremove.paymentAddition;

            Orders.update({ _id: this._currentOrder._id }, { $pull: { additions: { additionId: _pAdditionId } } });
            Orders.update({ _id: this._currentOrder._id },
                {
                    $set: {
                        totalPayment: _lNewTotalPayment,
                        modification_user: this._user,
                        modification_date: new Date()
                    }
                }
            );
            this._currentOrder = Orders.findOne({ _id: this._currentOrder._id });
            this.viewAdditionDetail(true);
            let _lMessage: string = this.itemNameTraduction('ORDER_LIST.ADDITION_DELETED');
            this.snackBar.open(_lMessage, '', {
                duration: 2500
            });
        }
    }

    /**
     * Show customer order detail
     * @param {Order} _pOrder
     * @param {number} _pIndex
     */
    showCustomerOrderDetail(_pOrder: Order, _pIndex: number): void {
        if (this._orderCustomerIndex == _pIndex) {
            this._orderCustomerIndex = -1;
        } else {
            this._orderCustomerIndex = _pIndex;
        }

        if (_pOrder.status === 'ORDER_STATUS.REGISTERED') {
            this._customerCanEdit = true;
            this._editOrderItemForm.controls['observations'].enable();
        } else {
            this._editOrderItemForm.controls['observations'].disable();
            this._customerCanEdit = false;
        }
        this._orderOthersIndex = -1;
        this._currentOrder = _pOrder;
        this.resetEditionValues();

        this._showOrderItemDetail = false;
        this._showDetails = true;
        this.viewAdditionDetail(true);
        this.viewItemDetail(true);
    }

    /**
     * Show table order detail
     * @param {Order} _pOrder 
     * @param {number} _pIndex
     */
    showOthersOrderDetail(_pOrder: Order, _pIndex: number): void {
        if (this._orderOthersIndex == _pIndex) {
            this._orderOthersIndex = -1;
        } else {
            this._orderOthersIndex = _pIndex;
        }
        this._orderCustomerIndex = -1;
        this._editOrderItemForm.controls['observations'].disable();
        this._customerCanEdit = false;
        this._currentOrder = _pOrder;
        this.resetEditionValues();

        this._showOrderItemDetail = false;
        this._showDetails = true;
        this.viewAdditionDetail(true);
        this.viewItemDetail(true);
    }

    /**
     * Show order item detail
     * @param {OrderItem} _pOrderItem 
     */
    showOrderItemDetail(_pOrderItem: OrderItem): void {
        this.resetEditionValues();

        this._orderItemIndex = _pOrderItem.index;
        this._quantityCount = _pOrderItem.quantity;
        this._editOrderItemForm.controls['observations'].setValue(_pOrderItem.observations);
        this._orderItemGarnishFood = _pOrderItem.garnishFood;
        this._orderItemAdditions = _pOrderItem.additions;
        this._finalPrice = _pOrderItem.paymentItem;

        this._itemsToShowDetail = Items.find({ _id: _pOrderItem.itemId }).zone();
        this.prepareGarnishFoodToEdit();
        this.prepareAdditionsToEdit();

        this._showOrderItemDetail = true;
        this.viewAdditionDetail(true);
        this.viewItemDetail(false);
    }

    /**
     * Show order additions detail
     * @param {OrderAddition} _pAdition
     */
    showAdditionsDetail(_pAdition: OrderAddition): void {
        Additions.collection.find({}).fetch().forEach((add) => {
            if (this._additionsDetailFormGroup.contains(add._id)) {
                this._additionsDetailFormGroup.removeControl(add._id);
            }
        });
        let control: FormControl = new FormControl(_pAdition.quantity, [Validators.minLength(1), Validators.maxLength(2)]);
        this._additionsDetailFormGroup.addControl(_pAdition.additionId, control);
        this._additionDetails = Additions.find({ _id: _pAdition.additionId }).zone();
        this.viewItemDetail(true);
        this.viewAdditionDetail(false);
    }

    /**
     * Reset orderItem edition values
     */
    resetEditionValues(): void {
        this._editOrderItemForm.reset();
        this._garnishFormGroup.reset();
        this._additionsFormGroup.reset();
        this._orderItemGarnishFood = [];
        this._orderItemAdditions = [];
        this._quantityCount = 1;
        this._lastQuantity = 1;
    }

    /**
     * When orderItem is in edited mode, this function prepare their garnish food elements
     */
    prepareGarnishFoodToEdit(): void {
        GarnishFoodCol.collection.find({}).fetch().forEach((gar) => {
            let _lGarnishFood: GarnishFood = gar;
            let find = this._orderItemGarnishFood.filter(g => g === _lGarnishFood._id);

            if (find.length > 0) {
                if (this._garnishFormGroup.contains(gar._id)) {
                    this._garnishFormGroup.controls[gar._id].setValue(true);
                } else {
                    let control: FormControl = new FormControl(true);
                    this._garnishFormGroup.addControl(gar._id, control);
                }
            } else {
                if (this._garnishFormGroup.contains(gar._id)) {
                    this._garnishFormGroup.controls[gar._id].setValue(false);
                } else {
                    let control: FormControl = new FormControl(false);
                    this._garnishFormGroup.addControl(gar._id, control);
                }
            }
        });
    }

    /**
     * When orderItem is in edited mode, this function prepare their addition elements
     */
    prepareAdditionsToEdit(): void {
        Additions.collection.find({}).fetch().forEach((add) => {
            let _lAddition: Addition = add;
            let find = this._orderItemAdditions.filter(a => a === _lAddition._id);

            if (find.length > 0) {
                if (this._additionsFormGroup.contains(add._id)) {
                    this._additionsFormGroup.controls[add._id].setValue(true);
                } else {
                    let control: FormControl = new FormControl(true);
                    this._additionsFormGroup.addControl(add._id, control);
                }
            } else {
                if (this._additionsFormGroup.contains(add._id)) {
                    this._additionsFormGroup.controls[add._id].setValue(false);
                } else {
                    let control: FormControl = new FormControl(false);
                    this._additionsFormGroup.addControl(add._id, control);
                }
            }
        });
    }

    /**
     * Set max garnish food elements in order item detail
     * @param {number} _pGarnishFoodQuantity
     */
    setMaxGarnishFoodElements(_pGarnishFoodQuantity: number): void {
        this._maxGarnishFoodElements = _pGarnishFoodQuantity;
    }

    /**
     * Set item unit price
     * @param {number} _pItemPrice
     */
    setUnitPrice(_pItemPrice: Item): void {
        this._unitPrice = this.getItemPrice(_pItemPrice);
    }

    /**
     * Validate Garnish food selections and show message error if count is greater than item.garnishFoodQuantity
     * in order item edition
     */
    validateGarnishFoodElements(): void {
        if (this._garnishFoodElementsCount > this._maxGarnishFoodElements) {
            this._showGarnishFoodError = true;
        } else {
            this._showGarnishFoodError = false;
        }
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
     * Calculate final price when garnish food is selected
     * @param {any} _event 
     * @param {number} _price 
     */
    calculateFinalPriceGarnishFood(_event: any, _pGarnishFood: GarnishFood): void {
        let _price = _pGarnishFood.restaurants.filter(r => r.restaurantId === this.restaurantId)[0].price;
        if (_event.checked) {
            this._finalPrice = (Number.parseInt(this._finalPrice.toString()) + (Number.parseInt(_price.toString()) * this._quantityCount));
            this._garnishFoodElementsCount += 1;
            this.validateGarnishFoodElements();
        } else {
            this._finalPrice = Number.parseInt(this._finalPrice.toString()) - (Number.parseInt(_price.toString()) * this._quantityCount);
            this._garnishFoodElementsCount -= 1;
            this.validateGarnishFoodElements();
        }
    }

    /**
     * Calculate final price when addition is selected
     * @param {any} _event 
     * @param {number} _price 
     */
    calculateFinalPriceAddition(_event: any, _pAddition: Addition): void {
        let _price = _pAddition.restaurants.filter(r => r.restaurantId === this.restaurantId)[0].price;
        if (_event.checked) {
            this._finalPrice = (Number.parseInt(this._finalPrice.toString()) + (Number.parseInt(_price.toString()) * this._quantityCount));
        } else {
            this._finalPrice = Number.parseInt(this._finalPrice.toString()) - (Number.parseInt(_price.toString()) * this._quantityCount);
        }
    }

    /**
     * Edit OrderItem in current order
     * @param {string} _pItemToInsert
     */
    editOrderItem(_pItemToInsert: string): void {
        if (this._editOrderItemForm.valid) {
            let arr: any[] = Object.keys(this._editOrderItemForm.value.garnishFood);
            let _lGarnishFoodToInsert: string[] = [];

            arr.forEach((gar) => {
                if (this._editOrderItemForm.value.garnishFood[gar]) {
                    _lGarnishFoodToInsert.push(gar);
                }
            });

            let arrAdd: any[] = Object.keys(this._editOrderItemForm.value.additions);
            let _lAdditionsToInsert: string[] = [];

            arrAdd.forEach((add) => {
                if (this._editOrderItemForm.value.additions[add]) {
                    _lAdditionsToInsert.push(add);
                }
            });

            let _lOrderItem: OrderItem = {
                index: this._orderItemIndex,
                itemId: _pItemToInsert,
                quantity: this._quantityCount,
                observations: this._editOrderItemForm.value.observations,
                garnishFood: _lGarnishFoodToInsert,
                additions: _lAdditionsToInsert,
                paymentItem: this._finalPrice
            };


            let _lOrderItemToremove: OrderItem = this._currentOrder.items.filter(o => _lOrderItem.itemId === o.itemId && _lOrderItem.index === o.index)[0];
            let _lNewTotalPayment: number = this._currentOrder.totalPayment - _lOrderItemToremove.paymentItem;

            Orders.update({ _id: this._currentOrder._id }, { $pull: { items: { itemId: _lOrderItem.itemId, index: _lOrderItem.index } } });
            Orders.update({ _id: this._currentOrder._id },
                {
                    $set: {
                        totalPayment: _lNewTotalPayment,
                        modification_user: this._user,
                        modification_date: new Date()
                    }
                }
            );

            let _lOrder = Orders.findOne({ _id: this._currentOrder._id });
            let _lTotalPaymentAux: number = Number.parseInt(_lOrder.totalPayment.toString()) + Number.parseInt(_lOrderItem.paymentItem.toString());

            Orders.update({ _id: _lOrder._id },
                { $push: { items: _lOrderItem } }
            );
            Orders.update({ _id: _lOrder._id },
                {
                    $set: {
                        modification_user: this._user,
                        modification_date: new Date(),
                        totalPayment: _lTotalPaymentAux
                    }
                }
            );
            this._currentOrder = Orders.findOne({ _id: this._currentOrder._id });
            this._showOrderItemDetail = false;
            this.viewItemDetail(true);
            let _lMessage: string = this.itemNameTraduction('ORDER_LIST.ITEM_EDITED');
            this.snackBar.open(_lMessage, '', {
                duration: 2500
            });
        }
    }

    /**
     * Modify addition in order
     */
    editOrderAddition(): void {
        let arrAdd: any[] = Object.keys(this._additionsDetailFormGroup.value);
        let _lOrderAddition: OrderAddition;

        arrAdd.forEach((add) => {
            if (this._additionsDetailFormGroup.value[add]) {
                let _lAddition: Addition = Additions.findOne({ _id: add });
                _lOrderAddition = {
                    additionId: add,
                    quantity: this._additionsDetailFormGroup.value[add],
                    paymentAddition: (this.getAdditionPrice(_lAddition) * (this._additionsDetailFormGroup.value[add]))
                };
            }
        });
        let _lOrderAdditionToremove: OrderAddition = this._currentOrder.additions.filter(ad => ad.additionId === _lOrderAddition.additionId)[0];
        let _lNewTotalPayment: number = this._currentOrder.totalPayment - _lOrderAdditionToremove.paymentAddition;

        Orders.update({ _id: this._currentOrder._id }, { $pull: { additions: { additionId: _lOrderAdditionToremove.additionId } } });
        Orders.update({ _id: this._currentOrder._id },
            {
                $set: {
                    totalPayment: _lNewTotalPayment,
                    modification_user: this._user,
                    modification_date: new Date()
                }
            }
        );
        let _lOrder = Orders.findOne({ _id: this._currentOrder._id });
        let _lTotalPaymentAux: number = Number.parseInt(_lOrder.totalPayment.toString()) + Number.parseInt(_lOrderAddition.paymentAddition.toString());

        Orders.update({ _id: _lOrder._id },
            { $push: { additions: _lOrderAddition } }
        );
        Orders.update({ _id: _lOrder._id },
            {
                $set: {
                    modification_user: this._user,
                    modification_date: new Date(),
                    totalPayment: _lTotalPaymentAux
                }
            }
        );
        this._currentOrder = Orders.findOne({ _id: this._currentOrder._id });
        this.viewAdditionDetail(true);
        let _lMessage: string = this.itemNameTraduction('ORDER_LIST.ADDITION_EDITED');
        this.snackBar.open(_lMessage, '', {
            duration: 2500
        });
    }

    /**
     * Return Addition price
     * @param {Addition} _pAddition 
     */
    getAdditionPrice(_pAddition: Addition): number {
        return _pAddition.restaurants.filter(r => r.restaurantId === this.restaurantId)[0].price;
    }

    /**
     * Cancel customer order if the order is in REGISTERED status
     * @param {Order} _pOrder 
     */
    cancelCustomerOrder(_pOrder: Order) {
        if (confirm(this.itemNameTraduction("ORDER_LIST.CANCEL_ORDER_CONFIRM"))) {
            if (_pOrder.status === 'ORDER_STATUS.REGISTERED') {
                Orders.update({ _id: _pOrder._id }, {
                    $set: {
                        status: 'ORDER_STATUS.CANCELED', modification_user: this._user,
                        modification_date: new Date()
                    }
                }
                );
                this._showDetails = false;
            } else {
                alert(this.itemNameTraduction("ORDER_LIST.ORDER_CANT_CANCEL"));
            }
            this.viewItemDetail(true);
        }
    }

    /**
     * Confirm customer order
     * @param {Order} _pOrder 
     */
    confirmCustomerOrder(_pOrder: Order) {
        let _lItemsIsAvailable: boolean = true;
        if (confirm(this.itemNameTraduction("ORDER_LIST.CONFIRM_ORDER_MESSAGE"))) {
            if (_pOrder.status === 'ORDER_STATUS.REGISTERED') {
                let _lOrderItems: OrderItem[] = _pOrder.items;
                _lOrderItems.forEach((it) => {
                    let _lItem: Item = Items.findOne({ _id: it.itemId });
                    /**
                    if (_lItem.isAvailable === false) {
                        _lItemsIsAvailable = false;
                    }
                     */
                });
                if (_lItemsIsAvailable) {
                    Orders.update({ _id: _pOrder._id }, {
                        $set: {
                            status: 'ORDER_STATUS.IN_PROCESS', modification_user: this._user,
                            modification_date: new Date()
                        }
                    }
                    );
                    this._showDetails = false;
                } else {
                    alert(this.itemNameTraduction("ORDER_LIST.ORDER_ITEMS_UNAVAILABLE"));
                }
            } else {
                alert(this.itemNameTraduction("ORDER_LIST.ORDER_CANT_CONFIRM"));
            }
            this.viewItemDetail(true);
            this._orderCustomerIndex = -1;
        }
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
     * Return Item price by current restaurant
     * @param {Item} _pItem 
     */
    getItemPrice(_pItem: Item): number {
        return _pItem.restaurants.filter(r => r.restaurantId === this.restaurantId)[0].price;
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

    createNewOrderEvent(): void {
        this.createNewOrder.emit(true);
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy() {
        this._ordersSub.unsubscribe();
        this._itemsSub.unsubscribe();
        this._garnishFoodSub.unsubscribe();
        this._additionsSub.unsubscribe();
        this._itemImagesSub.unsubscribe();
        this._currenciesSub.unsubscribe();
        this._itemImageThumbsSub.unsubscribe();
    }
}