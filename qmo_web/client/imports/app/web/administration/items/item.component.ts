import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Item } from '../../../../../../both/models/administration/item.model';
import { Items, ItemImagesStore } from '../../../../../../both/collections/administration/item.collection';
import { ItemEditionComponent } from './items-edition/item-edition.component';
import { Sections } from '../../../../../../both/collections/administration/section.collection';
import { Section } from '../../../../../../both/models/administration/section.model';
import { Category } from '../../../../../../both/models/administration/category.model';
import { Categories } from '../../../../../../both/collections/administration/category.collection';
import { Subcategory } from '../../../../../../both/models/administration/subcategory.model';
import { Subcategories } from '../../../../../../both/collections/administration/subcategory.collection';

import template from './item.component.html';
import style from './item.component.scss';

@Component({
    selector: 'item',
    template,
    styles: [ style ]
})
export class ItemComponent implements OnInit, OnDestroy {

    private _itemsSub: Subscription;
    private _sectionsSub: Subscription;
    private _categoriesSub: Subscription;
    private _subcategorySub: Subscription;

    private _items: Observable<Item[]>;
    private _sections: Observable<Section[]>;
    private _categories: Observable<Category[]>;
    private _subcategories: Observable<Subcategory[]>;

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
        this._sections = Sections.find( { } ).zone();
        this._sectionsSub = MeteorObservable.subscribe( 'sections', Meteor.userId() ).subscribe(); 
        this._categories = Categories.find( { } ).zone();
        this._categoriesSub = MeteorObservable.subscribe( 'categories', Meteor.userId() ).subscribe();
        this._subcategories = Subcategories.find( { } ).zone();
        this._subcategorySub = MeteorObservable.subscribe( 'subcategories', Meteor.userId() ).subscribe();
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
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._itemsSub.unsubscribe();
        this._sectionsSub.unsubscribe();
        this._categoriesSub.unsubscribe();
        this._subcategorySub.unsubscribe();
    }
}