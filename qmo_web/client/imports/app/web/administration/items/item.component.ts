import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Item, ItemImage, ItemPrice } from '../../../../../../both/models/administration/item.model';
import { Items, ItemImages } from '../../../../../../both/collections/administration/item.collection';
import { ItemEditionComponent } from './items-edition/item-edition.component';
import { Currency } from '../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../both/collections/general/currency.collection';

import template from './item.component.html';
import style from './item.component.scss';

@Component({
    selector: 'item',
    template,
    styles: [ style ]
})
export class ItemComponent implements OnInit, OnDestroy {

    private _itemsSub: Subscription;
    private _itemImagesSub: Subscription;
    private _currenciesSub: Subscription;

    private _items: Observable<Item[]>;
    private _itemImages: Observable<ItemImage[]>;

    public _dialogRef: MdDialogRef<any>;

    /**
     * ItemComponent contructor
     * @param {Router} _router
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {MdDialog} _dialog
     */
    constructor( private _router: Router, private _formBuilder: FormBuilder, private _translate: TranslateService, public _dialog: MdDialog ){
        var _userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._items = Items.find( { } ).zone();
        this._itemsSub = MeteorObservable.subscribe( 'items', Meteor.userId() ).subscribe();
        this._itemImages = ItemImages.find( { } ).zone();
        this._itemImagesSub = MeteorObservable.subscribe( 'itemImages', Meteor.userId() ).subscribe();
        this._currenciesSub = MeteorObservable.subscribe( 'currencies' ).subscribe();
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
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._itemsSub.unsubscribe();
        this._itemImagesSub.unsubscribe();
        this._currenciesSub.unsubscribe();
    }
}