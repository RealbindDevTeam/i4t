import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Meteor } from 'meteor/meteor';
import { Categories } from '../../../../../../../both/collections/administration/category.collection';
import { Category } from '../../../../../../../both/models/administration/category.model';
import { Sections } from '../../../../../../../both/collections/administration/section.collection';
import { Section } from '../../../../../../../both/models/administration/section.model';

import template from './categories-edit.component.html';
import style from './categories-edit.component.scss';

@Component({
    selector: 'categories-edit',
    template,
    styles: [ style ]
})
export class CategoriesEditComponent implements OnInit, OnDestroy {

    public _categoryToEdit: Category;
    private _editForm: FormGroup;

    private _categories: Observable<Category[]>;
    private _sections: Observable<Section[]>;

    private _categoriesSub: Subscription;    
    private _sectionsSub: Subscription;

    private _categorySection: string;

    /**
     * CategoriesEditComponent constructor
     * @param {FormBuilder} _formBuilder 
     * @param {TranslateService} _translate
     * @param {MdDialogRef<any>} _dialogRef 
     */
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, public _dialogRef: MdDialogRef<any> ){
        var userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use(userLang);
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._editForm = this._formBuilder.group({
            editId: [ this._categoryToEdit._id ],
            editName: [ this._categoryToEdit.name, Validators.required ],
            editDesc: [ this._categoryToEdit.description ],
            editIsActive: [ this._categoryToEdit.is_active ],
            editSection: [ this._categoryToEdit.section ]
        });
        this._categorySection = this._categoryToEdit.section;
        this._categories = Categories.find( { } ).zone();
        this._categoriesSub = MeteorObservable.subscribe( 'categories', Meteor.userId() ).subscribe();
        this._sections = Sections.find( { } ).zone();
        this._sectionsSub = MeteorObservable.subscribe( 'sections', Meteor.userId() ).subscribe();
    }

    /**
     * Function to edit Category
     */
    editCategory():void{
        if( !Meteor.userId() ){
            alert('Please log in to add a restaurant');
            return;
        }

        if( this._editForm.valid ){
            Categories.update( this._editForm.value.editId,{
                $set: {
                    modification_user: Meteor.userId(),
                    modification_date: new Date(),
                    name: this._editForm.value.editName,
                    description: this._editForm.value.editDesc,
                    is_active: this._editForm.value.editIsActive,
                    structure: this._editForm.value.editStructure
                }
            });
        }
        this._dialogRef.close();
    }

    /**
     * This function set section value in the form when the value select change
     */
    changeSectionEdit( _section ):void{
        this._editForm.controls['editSection'].setValue( _section );
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._categoriesSub.unsubscribe();
        this._sectionsSub.unsubscribe();
    }
}