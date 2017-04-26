import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { TranslateService } from 'ng2-translate';
import { Subcategories } from '../../../../../../both/collections/administration/subcategory.collection';
import { Subcategory } from '../../../../../../both/models/administration/subcategory.model';
import { Categories } from '../../../../../../both/collections/administration/category.collection';
import { Category } from '../../../../../../both/models/administration/category.model';
import { SubcategoryEditComponent } from './subcategories-edit/subcategories-edit.component';

import template from './subcategories.component.html';
import style from './subcategories.component.scss';

@Component({
    selector: 'subcategory',
    template,
    styles: [ style ]
})
export class SubcategoryComponent implements OnInit, OnDestroy{

    private _subcategoryForm: FormGroup;

    private _subcategories: Observable<Subcategory[]>;
    private _categories: Observable<Category[]>;

    private _subcategorySub: Subscription;    
    private _categoriesSub: Subscription;

    _selectedValue:string;
    _dialogRef: MdDialogRef<any>;

    /**
     * SubcategoryComponent constructor
     */
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, public _dialog: MdDialog ){
        var _userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
        this._selectedValue = "";
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._subcategoryForm = new FormGroup({
            name: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 50 ) ] ),
            category: new FormControl( '' )  
        });       
        this._categories = Categories.find( { } ).zone();
        this._categoriesSub = MeteorObservable.subscribe( 'categories', Meteor.userId() ).subscribe();
        this._subcategories = Subcategories.find( { } ).zone();
        this._subcategorySub = MeteorObservable.subscribe( 'subcategories', Meteor.userId() ).subscribe();
    }

    /**
     * Function to add subcategory
     */
    addSubcategory():void{
        if( !Meteor.userId() ){
            alert('Please log in to add a restaurant');
            return;
        }

        if( this._subcategoryForm.valid ){
            Subcategories.insert({
                creation_user: Meteor.userId(),
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                is_active: true,
                name: this._subcategoryForm.value.name,
                category: this._subcategoryForm.value.category
            });
            this._subcategoryForm.reset();
            this._selectedValue = "";
        }
    }

    /**
     * This function set category value in the form when the value select change
     */
    changeCategory( _pCategory ):void{
        this._subcategoryForm.controls['category'].setValue( _pCategory );
    }

    /**
     * Function to cancel add Subcategory
     */
    cancel():void{
        this._subcategoryForm.controls['name'].reset();
        this._selectedValue = "";
    }

    /**
     * Function to update Subcategory status
     * @param {Subcategory} _subcategory
     */
    updateStatus( _subcategory:Subcategory ):void{
        Subcategories.update( _subcategory._id,{
            $set: {
                is_active: !_subcategory.is_active,
                modification_date: new Date(),
                modification_user: Meteor.userId()
            }
        });
    }

    /**
     * When useer wants edit Subcategory, this function open dialog with Subcategory information
     * @param {Subcategory} _subcategory
     */
    open( _subcategory: Subcategory ){
        this._dialogRef = this._dialog.open( SubcategoryEditComponent, {
            disableClose : true,
            width: '60%'
        });
        this._dialogRef.componentInstance._subcategoryToEdit = _subcategory;
        this._dialogRef.afterClosed().subscribe(result => {
            this._dialogRef = null;
        });
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._categoriesSub.unsubscribe();
        this._subcategorySub.unsubscribe();
    }
}