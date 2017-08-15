import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { MdSnackBar } from '@angular/material';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Categories } from '../../../../../../both/collections/administration/category.collection';
import { Category } from '../../../../../../both/models/administration/category.model';
import { Sections } from '../../../../../../both/collections/administration/section.collection';
import { Section } from '../../../../../../both/models/administration/section.model';
import { CategoriesEditComponent } from './categories-edit/categories-edit.component';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';

import template from './categories.component.html';
import style from './categories.component.scss';

@Component({
    selector: 'category',
    template,
    styles: [ style ]
})
export class CategoryComponent implements OnInit, OnDestroy{

    private _user = Meteor.userId();
    private _categoryForm       : FormGroup;
    private _categories         : Observable<Category[]>;
    private _sections           : Observable<Section[]>;
    private _restaurants        : Observable<Restaurant[]>;

    private _categoriesSub      : Subscription;
    private _sectionsSub        : Subscription;
    private _restaurantSub      : Subscription;

    private _selectedValue      : string;
    public _dialogRef           : MdDialogRef<any>;
    
    /**
     * CategoryComponent constructor
     * @param {MdSnackBar} snackBar
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {MdDialog} _dialog
     * @param {Router} _router
     * @param {NgZone} _ngZone
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( public snackBar: MdSnackBar,
                 public _dialog: MdDialog, 
                 private _formBuilder: FormBuilder, 
                 private _translate: TranslateService, 
                 private _router: Router,
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );         
        this._selectedValue = "";
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._categoryForm = new FormGroup({
            name: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 50 ) ] ),
            section: new FormControl( '' )  
        });    
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } ).zone();
            });
        });
        this._sectionsSub = MeteorObservable.subscribe( 'sections', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._sections = Sections.find( { } ).zone();
            });
        });
        this._categoriesSub = MeteorObservable.subscribe( 'categories', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._categories = Categories.find( { } ).zone();
            });
        });
    }

    /**
     * Function to add Category
     */
    addCategory():void{
        if( !Meteor.userId() ){
            alert('Please log in to add a restaurant');
            return;
        }

        if( this._categoryForm.valid ){
            let _lNewCategory = Categories.collection.insert({
                creation_user: this._user,
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                is_active: true,
                name: this._categoryForm.value.name,
                section: this._categoryForm.value.section
            });

            if( _lNewCategory ){
                let _lMessage:string = this.itemNameTraduction( 'CATEGORIES.CATEGORY_CREATED' );
                this.snackBar.open( _lMessage, '',{
                    duration: 2500
                });
            }

            this._categoryForm.reset();
            this._selectedValue = "";
        }
    }

    /**
     * Function to cancel add Category
     */
    cancel():void{
        this._categoryForm.controls['name'].reset();
        this._selectedValue = "";
    }

    /**
     * When user wants edit Category, this function open dialog with Category information
     * @param {Category} _category 
     */
    open( _category: Category ){
        this._dialogRef = this._dialog.open( CategoriesEditComponent, {
            disableClose : true,
            width: '60%'
        });
        this._dialogRef.componentInstance._categoryToEdit = _category;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * This function set section value in the form when the value select change
     */
    changeSection( _section ):void {
        this._categoryForm.controls['section'].setValue( _section );        
    }

    /**
     * Function to update Category status
     * @param {Category} _category
     */
    updateStatus( _category:Category ):void{
        Categories.update( _category._id,{
            $set: {
                is_active: !_category.is_active,
                modification_date: new Date(),
                modification_user: this._user
            }
        });
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
     * Go to add new Restaurant
     */
    goToAddRestaurant(){
        this._router.navigate(['/app/restaurantRegister']);
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._categoriesSub.unsubscribe();
        this._sectionsSub.unsubscribe();
        this._restaurantSub.unsubscribe();
    }
}