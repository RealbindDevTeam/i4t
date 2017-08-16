import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MdDialogRef } from '@angular/material';
import { Meteor } from 'meteor/meteor';
import { MdSnackBar } from '@angular/material';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Categories } from '../../../../../../../both/collections/administration/category.collection';
import { Category } from '../../../../../../../both/models/administration/category.model';
import { Sections } from '../../../../../../../both/collections/administration/section.collection';
import { Section } from '../../../../../../../both/models/administration/section.model';

import template from './categories-edit.component.html';
import style from './categories-edit.component.scss';

@Component({
    selector: 'categories-edit',
    template,
    styles: [ style ],
    providers:[ UserLanguageService ]
})
export class CategoriesEditComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    public _categoryToEdit          : Category;
    private _editForm               : FormGroup;

    private _categories             : Observable<Category[]>;
    private _sections               : Observable<Section[]>;

    private _categoriesSub          : Subscription;    
    private _sectionsSub            : Subscription;

    private _categorySection        : string;

    /**
     * CategoriesEditComponent constructor
     * @param {FormBuilder} _formBuilder 
     * @param {TranslateService} _translate
     * @param {MdDialogRef<any>} _dialogRef 
     * @param {MdSnackBar} snackBar
     * @param {NgZone} _ngZone
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _formBuilder: FormBuilder, 
                 private _translate: TranslateService, 
                 public _dialogRef: MdDialogRef<any>, 
                 public snackBar: MdSnackBar,
                 private _ngZone:NgZone,
                 private _userLanguageService: UserLanguageService ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._editForm = this._formBuilder.group({
            editId: [ this._categoryToEdit._id ],
            editName: [ this._categoryToEdit.name, Validators.required ],
            editIsActive: [ this._categoryToEdit.is_active ],
            editSection: [ this._categoryToEdit.section ]
        });
        this._categorySection = this._categoryToEdit.section;
        this._categoriesSub = MeteorObservable.subscribe( 'categories', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._categories = Categories.find( { } ).zone();
            });
        });
        this._sectionsSub = MeteorObservable.subscribe( 'sections', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._sections = Sections.find( { } ).zone();
            });
        });
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
                    modification_user: this._user,
                    modification_date: new Date(),
                    name: this._editForm.value.editName,
                    is_active: this._editForm.value.editIsActive,
                    section: this._editForm.value.editSection
                }
            });

            let _lMessage:string = this.itemNameTraduction( 'CATEGORIES.CATEGORY_EDITED' );
            this.snackBar.open( _lMessage, '',{
                duration: 2500
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
     * Return traduction
     * @param {string} itemName 
     */
    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._categoriesSub.unsubscribe();
        this._sectionsSub.unsubscribe();
    }
}