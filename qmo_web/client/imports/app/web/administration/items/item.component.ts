import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Item, ItemImage, ItemPrice } from '../../../../../../both/models/administration/item.model';
import { Items, ItemImages } from '../../../../../../both/collections/administration/item.collection';
import { ItemEditionComponent } from './items-edition/item-edition.component';
import { Currency } from '../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../both/collections/general/currency.collection';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';

import template from './item.component.html';
import style from './item.component.scss';

@Component({
    selector: 'item',
    template,
    styles: [ style ]
})
export class ItemComponent implements OnInit, OnDestroy {

    private _itemsSub           : Subscription;
    private _itemImagesSub      : Subscription;
    private _currenciesSub      : Subscription;
    private _restaurantSub      : Subscription;

    private _items              : Observable<Item[]>;
    private _restaurants        : Observable<Restaurant[]>;

    public _dialogRef           : MdDialogRef<any>;

    /**
     * ItemComponent contructor
     * @param {Router} _router
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {NgZone} _ngZone
     * @param {MdDialog} _dialog
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _router: Router, 
                 private _formBuilder: FormBuilder, 
                 private _translate: TranslateService, 
                 private _ngZone: NgZone,
                 public _dialog: MdDialog,
                 private _userLanguageService: UserLanguageService ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._items = Items.find( { } ).zone();
        this._itemsSub = MeteorObservable.subscribe( 'items', Meteor.userId() ).subscribe();
        this._itemImagesSub = MeteorObservable.subscribe( 'itemImages', Meteor.userId() ).subscribe();
        this._currenciesSub = MeteorObservable.subscribe( 'currencies' ).subscribe();
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } ).zone();
            });
        });
   }

    /**
     * This function open item creation wizard
     */
    openItemCreation():void{
        this._router.navigate(['app/itemsCreation']);
    }

    /**
     * When user wants edit item, this function open dialog with Item information
     * @param {Item} _item
     */
    open( _item: Item ){
        this._dialogRef = this._dialog.open( ItemEditionComponent, {
            disableClose : true,
            width: '75%'
        });
        this._dialogRef.componentInstance._itemToEdit = _item;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * Function to update Item updateStatus
     * @param {Item} _item
     */
    updateStatus( _item: Item ):void {
        Items.update( _item._id, {
            $set: {
                is_active: !_item.is_active,
                modification_date: new Date(),
                modification_user: Meteor.userId()
            }
        });
    }

    /**
     * Function to show Item Prices
     * @param {ItemPrice} _pItemPrices
     */
    showItemPrices( _pItemPrices: ItemPrice[] ):string{
        let _lPrices: string = '';
        _pItemPrices.forEach( ( ip ) => {
            let _lCurrency: Currency = Currencies.findOne( { _id: ip.currencyId } );
            if( _lCurrency ){
                let price: string = ip.price + ' ' + _lCurrency.code + ' / '
                _lPrices += price;
            }
        });
        return _lPrices;
    }

    /**
     * Function to show Item Taxes
     * @param {ItemPrice[]} _pItemPrices
     */
    showItemTaxes( _pItemPrices:ItemPrice[] ):string{
        let _lTaxes: string = '';
        _pItemPrices.forEach( ( ip ) => {
            if( ip.itemTax ){
                let _lCurrency: Currency = Currencies.findOne( { _id: ip.currencyId } );
                if( _lCurrency ){
                    let tax: string = ip.itemTax + ' ' + _lCurrency.code + ' / '
                    _lTaxes += tax;
                }
            }
        });
        return _lTaxes;
    }

    /**
     * Go to add new Restaurant
     */
    goToAddRestaurant(){
        this._router.navigate(['/app/restaurantRegister']);
    }

    /**
     * Return item image
     * @param {string} _itemId
     */
    getItemImage( _itemId:string ):string{
        let _lItemImage: ItemImage = ItemImages.findOne( { itemId: _itemId } );
        if( _lItemImage ){
            return _lItemImage.url;
        } else{
            return '/images/default-plate.png';
        }
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._itemsSub.unsubscribe();
        this._itemImagesSub.unsubscribe();
        this._currenciesSub.unsubscribe();
        this._restaurantSub.unsubscribe();
    }
}