import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Meteor } from 'meteor/meteor';
import { Subcategories } from '../../../../../../../both/collections/administration/subcategory.collection';
import { Subcategory } from '../../../../../../../both/models/administration/subcategory.model';
import { Categories } from '../../../../../../../both/collections/administration/category.collection';
import { Category } from '../../../../../../../both/models/administration/category.model';

import template from './subcategories-edit.component.html';
import style from './subcategories-edit.component.scss';

@Component({
    selector: 'subcategory-edit',
    template,
    styles: [ style ]
})
export class SubcategoryEditComponent implements OnInit, OnDestroy {

    public _subcategoryToEdit: Subcategory;
    private _editForm: FormGroup;

    private _subcategories: Observable<Subcategory[]>;
    private _categories: Observable<Category[]>;

    private _subcategorySub: Subscription;    
    private _categoriesSub: Subscription;

    private _subcategoryCategory: string;

    /**
     * SubcategoryEditComponent constructor
     */
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, public _dialogRef: MdDialogRef<any> ){
        var _userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._editForm = this._formBuilder.group({
            editId: [ this._subcategoryToEdit._id ],
            editName: [ this._subcategoryToEdit.name, Validators.required ],
            editDesc: [ this._subcategoryToEdit.description ],
            editActive: [ this._subcategoryToEdit.is_active ],
            editCategory: [ this._subcategoryToEdit.category ]
        });
        this._subcategoryCategory = this._subcategoryToEdit.category;
        this._categories = Categories.find( { } ).zone();
        this._categoriesSub = MeteorObservable.subscribe( 'categories', Meteor.userId() ).subscribe();
        this._subcategories = Subcategories.find( { } ).zone();
        this._subcategorySub = MeteorObservable.subscribe( 'subcategories', Meteor.userId() ).subscribe();
    }

    /**
     * This function set category value in the form when the value select change
     * @param {string} _category
     */
    changeCategoryEdit( _category ):void{
        this._editForm.controls['editCategory'].setValue( _category) ;
    }

    /**
     * Function to edit Subcategory
     */
    editSubCategory():void{
        if( !Meteor.userId() ){
            alert('Please log in to add a restaurant');
            return;
        }

        if( this._editForm.valid ){
            Subcategories.update( this._editForm.value.editId,{
                $set: {
                    modification_user: Meteor.userId(),
                    modification_date: new Date(),
                    name: this._editForm.value.editName,
                    description: this._editForm.value.editDesc,
                    is_active: this._editForm.value.editActive,
                    category: this._editForm.value.editCategory
                }
            });
        }
        this._dialogRef.close();
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._categoriesSub.unsubscribe();
        this._subcategorySub.unsubscribe();
    }
}