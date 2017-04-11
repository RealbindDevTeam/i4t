import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { Order, OrderItem } from '../../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../../both/collections/restaurant/order.collection';
import { Item } from '../../../../../../../both/models/administration/item.model';
import { Items } from '../../../../../../../both/collections/administration/item.collection';
import { GarnishFood } from '../../../../../../../both/models/administration/garnish-food.model';
import { GarnishFoodCol } from '../../../../../../../both/collections/administration/garnish-food.collection';
import { Addition } from '../../../../../../../both/models/administration/addition.model';
import { Additions } from '../../../../../../../both/collections/administration/addition.collection';

import template from './order-list.component.html';
import style from './order-list.component.scss';

@Component({
    selector: 'order-list',
    template,
    styles: [ style ]
})
export class OrdersListComponent implements OnInit, OnDestroy {

    @Input() restaurantId: string;
    @Input() tableQRCode: string;
    
    private _ordersSub: Subscription;
    private _itemsSub: Subscription;
    private _garnishFoodSub: Subscription;
    private _additionsSub: Subscription;

    private _orders: Observable<Order[]>;
    private _ordersTable: Observable<Order[]>;
    private _items: Observable<Item[]>;
    private _itemsToShowDetail: Observable<Item[]>;
    private _garnishFoodCol: Observable<GarnishFood[]>;
    private _additions: Observable<Addition[]>;

    private _showOrderItemDetail:boolean = false;
    private _currentOrder: Order;
    private _customerCanEdit: boolean = false;
    private _showDetails: boolean = false;

    private _editOrderItemForm: FormGroup;
    private _garnishFormGroup: FormGroup = new FormGroup({});
    private _additionsFormGroup: FormGroup= new FormGroup({});

    private _createdGarnishFood: GarnishFood[] = [];
    private _createdAdditions: Addition[] = [];
    private _orderItemGarnishFood:string[] = [];
    private _orderItemAdditions: string[] = [];

    private _maxGarnishFoodElements: number = 0;
    private _garnishFoodElementsCount: number = 0;
    private _showGarnishFoodError: boolean = false;

    private _lastQuantity: number = 1;
    private _quantityCount: number = 1;
    private _finalPrice:number = 0;
    private _unitPrice: number = 0;

    private _showCustomerOrders: boolean = true;
    private _showOtherOrders: boolean = false;
    private _showAllOrders: boolean = false;
    _initialValue = 'customer';
    private _orderCustomerIndex: number = -1;
    private _orderOthersIndex:number = -1;

    /**
     * OrdersComponent Constructor
     * @param {TranslateService} _translate 
     */
    constructor( private _translate: TranslateService ) {
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        this._ordersSub = MeteorObservable.subscribe( 'getOrders', this.restaurantId, this.tableQRCode,[ 'REGISTERED','IN_PROCESS','CONFIRMED' ] ).subscribe();
        this._orders = Orders.find( { creation_user: Meteor.userId() } ).zone();
        this._ordersTable = Orders.find( { creation_user: { $not: Meteor.userId() } } ).zone();
        this._itemsSub = MeteorObservable.subscribe( 'itemsByRestaurant', this.restaurantId ).subscribe();
        this._items = Items.find( { } ).zone();

        this._showOrderItemDetail = false;

        this._editOrderItemForm = new FormGroup({
            observations: new FormControl( '', [ Validators.maxLength( 50 ) ] ),
            garnishFood: this._garnishFormGroup,
            additions: this._additionsFormGroup
        });

        this._garnishFoodSub = MeteorObservable.subscribe( 'garnishFoodByRestaurant', this.restaurantId ).subscribe();
        this._garnishFoodCol = GarnishFoodCol.find( { } ).zone();
        this._additionsSub = MeteorObservable.subscribe( 'additionsByRestaurant', this.restaurantId ).subscribe();
        this._additions = Additions.find( { } ).zone();
    }

    /**
     * This function allow filter orders
     * @param {number} _pFilter
     */
    changeOrderFilter( _pFilter:string ){
        if( _pFilter === 'all' ){
            this._showAllOrders = true;
            this._showCustomerOrders = true;
            this._showOtherOrders = true;
        } else if( _pFilter === 'customer' ){
            this._showAllOrders = false;
            this._showCustomerOrders = true;
            this._showOtherOrders = false;
        } else if( _pFilter === 'other' ){
            this._showAllOrders = false;
            this._showCustomerOrders = false;
            this._showOtherOrders = true;
        }
        this._showDetails = false;
        this.viewItemDetail( true );
    }

    /**
     * Function to view item detail
     * @param {boolean} _boolean 
     */
    viewItemDetail( _boolean : boolean ):void {
        var card = document.getElementById("item-detail");
        var img = document.getElementById("card");
        var center = document.getElementById("center");

        if(!_boolean){
            card.style.right = "0";
            card.classList.add("item-detail-shadow");
            document.getElementById("content").style.marginRight = "396px";
            center.style.width = "95%";
        } else {
            card.style.right = "-396px";
            card.classList.remove("item-detail-shadow");
            document.getElementById("content").style.marginRight = "0";
            center.style.width = "80%";
        }
    }

    /**
     * Delete OrderItem in order
     * @param {Order} _pOrder 
     * @param {string} _pItemId 
     */
    deleteOrderItem( _pItemId:string ):void{
        if( confirm( "Esta seguro de eliminar el item de la orden?" ) ) {
            let _lOrderItemToremove:OrderItem = this._currentOrder.items.filter( o => _pItemId === o.itemId )[0];
            let _lNewTotalPayment:number = this._currentOrder.totalPayment - _lOrderItemToremove.paymentItem;

            Orders.update( { _id: this._currentOrder._id },{ $pull: { items:{ itemId: _pItemId } } } );
            Orders.update( { _id: this._currentOrder._id }, 
                           { $set: { totalPayment: _lNewTotalPayment, 
                                     modification_user: Meteor.userId(), 
                                     modification_date: new Date() 
                                   } 
                           } 
                         );
            this._showOrderItemDetail = false;
            this.viewItemDetail( true );
        }
    }
    
    /**
     * Show customer order detail
     * @param {Order} _pOrder
     * @param {number} _pIndex
     */
    showCustomerOrderDetail( _pOrder: Order, _pIndex:number ):void{
        if ( this._orderCustomerIndex == _pIndex ) {
            this._orderCustomerIndex = -1;
        } else {
            this._orderCustomerIndex = _pIndex;
        }

        if( _pOrder.status === 'REGISTERED' ){
            this._customerCanEdit = true;
        } else {
            this._customerCanEdit = false;
        }
        this._orderOthersIndex = -1;
        this._currentOrder = _pOrder;
        this.resetEditionValues();

        this._showOrderItemDetail = false;
        this._showDetails = true;
        this.viewItemDetail( true );
    }

    /**
     * Show table order detail
     * @param {Order} _pOrder 
     * @param {number} _pIndex
     */
    showOthersOrderDetail( _pOrder: Order, _pIndex:number ):void{
        if ( this._orderOthersIndex == _pIndex ) {
            this._orderOthersIndex = -1;
        } else {
            this._orderOthersIndex = _pIndex;
        }
        this._orderCustomerIndex = -1;
        this._customerCanEdit = false;
        this._currentOrder = _pOrder;
        this.resetEditionValues();

        this._showOrderItemDetail = false;
        this._showDetails = true;
        this.viewItemDetail( true );
    }

    /**
     * Show order item detail
     * @param {OrderItem} _pOrderItem 
     */
    showOrderItemDetail( _pOrderItem:OrderItem ):void{
        this.resetEditionValues();

        this._quantityCount = _pOrderItem.quantity;
        this._editOrderItemForm.controls['observations'].setValue( _pOrderItem.observations );
        this._orderItemGarnishFood = _pOrderItem.garnishFood;
        this._orderItemAdditions = _pOrderItem.additions;
        this._finalPrice = _pOrderItem.paymentItem;

        this._itemsToShowDetail = Items.find( { _id: _pOrderItem.itemId } ).zone();
        this.prepareGarnishFoodToEdit();
        this.prepareAdditionsToEdit();

        this._showOrderItemDetail = true;
        this.viewItemDetail( false );
    }

    /**
     * Reset orderItem edition values
     */
    resetEditionValues():void{
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
    prepareGarnishFoodToEdit():void{
        this._createdGarnishFood = GarnishFoodCol.collection.find( { } ).fetch();
        for( let gar of this._createdGarnishFood ){
            let _lGarnishFood:GarnishFood = gar;
            let find = this._orderItemGarnishFood.filter( g => g === _lGarnishFood._id );

            if( find.length > 0 ){
                if( this._garnishFormGroup.contains( gar.name ) ){
                    this._garnishFormGroup.controls[ gar.name ].setValue( true );
                } else {
                    let control: FormControl = new FormControl( true );
                    this._garnishFormGroup.addControl( gar.name, control );
                }
            } else {
                if( this._garnishFormGroup.contains( gar.name ) ){
                    this._garnishFormGroup.controls[ gar.name ].setValue( false );
                } else {
                    let control: FormControl = new FormControl( false );
                    this._garnishFormGroup.addControl( gar.name, control );
                }
            }
        }
    }

    /**
     * When orderItem is in edited mode, this function prepare their addition elements
     */
    prepareAdditionsToEdit():void{
        this._createdAdditions = Additions.collection.find( { } ).fetch();
        for( let add of this._createdAdditions ){
            let _lAddition:Addition = add;
            let find = this._orderItemAdditions.filter( a => a === _lAddition._id );

            if( find.length > 0 ){
                if( this._additionsFormGroup.contains( add.name ) ){
                    this._additionsFormGroup.controls[ add.name ].setValue( true );
                } else {
                    let control: FormControl = new FormControl( true );
                    this._additionsFormGroup.addControl( add.name, control );
                }
            } else {
                if( this._additionsFormGroup.contains( add.name ) ){
                    this._additionsFormGroup.controls[ add.name ].setValue( false );
                } else {
                    let control: FormControl = new FormControl( false );
                    this._additionsFormGroup.addControl( add.name, control );
                }
            }
        }
    }

    /**
     * Set max garnish food elements in order item detail
     * @param {number} _pGarnishFoodQuantity
     */
    setMaxGarnishFoodElements( _pGarnishFoodQuantity: number ):void {
        this._maxGarnishFoodElements = _pGarnishFoodQuantity;
    }

    /**
     * Set item unit price
     * @param {number} _pItemPrice
     */
    setUnitPrice( _pItemPrice:number ):void{
        this._unitPrice = _pItemPrice;
    }

    /**
     * Validate Garnish food selections and show message error if count is greater than item.garnishFoodQuantity
     * in order item edition
     */
    validateGarnishFoodElements():void{
        if( this._garnishFoodElementsCount > this._maxGarnishFoodElements ){
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
    addCount():void{
        this._lastQuantity = this._quantityCount;
        this._quantityCount += 1;
        this.calculateFinalPriceQuantity();
    }

    /**
     * Subtract quantity item
     */
    removeCount():void{
        if ( this._quantityCount > 1 ){
            this._lastQuantity = this._quantityCount;
            this._quantityCount -= 1;
        }
        this.calculateFinalPriceQuantity();
    }

    /**
     * Calculate final price when item quantity is entered
     */
    calculateFinalPriceQuantity():void{
        if( Number.isFinite( this._quantityCount ) ) {
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
    calculateFinalPriceGarnishFood( _event:any, _price:number ):void{
        if( _event.checked ){
            this._finalPrice =  ( Number.parseInt( this._finalPrice.toString() ) + ( Number.parseInt( _price.toString() ) * this._quantityCount ) );
            this._garnishFoodElementsCount += 1;
            this.validateGarnishFoodElements();
        } else {
            this._finalPrice = Number.parseInt(this._finalPrice.toString()) - (Number.parseInt(_price.toString()) * this._quantityCount );
            this._garnishFoodElementsCount -= 1;
            this.validateGarnishFoodElements();
        }
    }

    /**
     * Calculate final price when addition is selected
     * @param {any} _event 
     * @param {number} _price 
     */
    calculateFinalPriceAddition( _event:any, _price:number ):void{
        if( _event.checked ){
            this._finalPrice =  ( Number.parseInt( this._finalPrice.toString() ) + ( Number.parseInt( _price.toString() ) * this._quantityCount ) );
        } else {
            this._finalPrice = Number.parseInt(this._finalPrice.toString()) - (Number.parseInt(_price.toString()) * this._quantityCount);
        }
    }

    /**
     * Edit OrderItem in current order
     * @param {string} _pItemToInsert
     */
    editOrderItem( _pItemToInsert:string ):void{
        if( this._editOrderItemForm.valid ){
            let arr:any[] = Object.keys( this._editOrderItemForm.value.garnishFood );
            let _lGarnishFoodToInsert:string[] = [];

            arr.forEach( ( gar ) => {
                if( this._editOrderItemForm.value.garnishFood[ gar ] ){
                    let _lGarnishF:GarnishFood = GarnishFoodCol.findOne( { name: gar } );
                    _lGarnishFoodToInsert.push( _lGarnishF._id );
                }
            });

            let arrAdd:any[] = Object.keys( this._editOrderItemForm.value.additions );
            let _lAdditionsToInsert:string[] = [];

            arrAdd.forEach( ( add ) => {
                if( this._editOrderItemForm.value.additions[ add ] ){
                    let _lAddition:Addition = Additions.findOne( { name: add } );
                    _lAdditionsToInsert.push( _lAddition._id );
                }
            });

            let _lOrderItem: OrderItem = { itemId: _pItemToInsert,
                                           quantity: this._quantityCount,
                                           observations: this._editOrderItemForm.value.observations,
                                           garnishFood: _lGarnishFoodToInsert,
                                           additions: _lAdditionsToInsert,
                                           paymentItem: this._finalPrice
                                         };


            let _lOrderItemToremove:OrderItem = this._currentOrder.items.filter( o => _lOrderItem.itemId === o.itemId )[0];
            let _lNewTotalPayment:number = this._currentOrder.totalPayment - _lOrderItemToremove.paymentItem;

            Orders.update( { _id: this._currentOrder._id },{ $pull: { items:{ itemId: _lOrderItem.itemId } } } );
            Orders.update( { _id: this._currentOrder._id }, 
                           { $set: { totalPayment: _lNewTotalPayment, 
                                     modification_user: Meteor.userId(), 
                                     modification_date: new Date() 
                                   } 
                           } 
                         );

            let _lOrder = Orders.findOne( { _id: this._currentOrder._id } );
            let _lTotalPaymentAux: number = Number.parseInt(_lOrder.totalPayment.toString()) + Number.parseInt(_lOrderItem.paymentItem.toString());

            Orders.update( { _id: _lOrder._id },
                           { $push: { items: _lOrderItem } }
                         );
            Orders.update({ _id: _lOrder._id },
                          {
                             $set: {
                                    modification_user: Meteor.userId(),
                                    modification_date: new Date(),
                                    totalPayment: _lTotalPaymentAux
                                   }
                          }
                         );
            this._currentOrder = Orders.findOne( { _id: this._currentOrder._id } );
            this._showOrderItemDetail = false;
            this.viewItemDetail( true );
        }
    }

    /**
     * Cancel customer order if the order is in REGISTERED status
     * @param {Order} _pOrder 
     */
    cancelCustomerOrder( _pOrder: Order ){
        if( confirm( "Esta seguro de cancelar la orden?" ) ) {
            if( _pOrder.status === 'REGISTERED' ){
                Orders.update( { _id: _pOrder._id }, { $set: { status: 'CANCELED', modification_user: Meteor.userId(),
                                                            modification_date: new Date() 
                                                            } 
                                                    } 
                            );
                this._showDetails = false;
            } else {
                alert('La orden No se puede cancelar.');
            }
            this.viewItemDetail( true );
        }
    }

    /**
     * Confirm customer order
     * @param {Order} _pOrder 
     */
    confirmCustomerOrder( _pOrder: Order ){
        let _lItemsIsAvailable: boolean = true;
        if( confirm( "Esta seguro de confirmar la orden?" ) ) {
            if( _pOrder.status === 'REGISTERED' ){
                let _lOrderItems: OrderItem[] = _pOrder.items;
                _lOrderItems.forEach( ( it ) => {
                    let _lItem:Item = Items.findOne( { _id: it.itemId } );
                    if( _lItem.isAvailable === false ){
                        _lItemsIsAvailable = false;
                    }
                });
                if( _lItemsIsAvailable ){
                    Orders.update( { _id: _pOrder._id }, { $set: { status: 'CONFIRMED', modification_user: Meteor.userId(),
                                                                   modification_date: new Date() 
                                                                 } 
                                                         } 
                                 );
                    this._showDetails = false;
                } else {
                    alert('La orden presenta items que no se encuentran disponibles');
                }
            } else {
                alert('La orden no se puede confirmar');
            }
            this.viewItemDetail( true );
        }
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this._ordersSub.unsubscribe();
        this._itemsSub.unsubscribe();
        this._garnishFoodSub.unsubscribe();
        this._additionsSub.unsubscribe();
    }
}