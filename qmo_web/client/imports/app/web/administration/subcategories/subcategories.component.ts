import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { MdSnackBar } from '@angular/material';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Subcategories } from '../../../../../../both/collections/administration/subcategory.collection';
import { Subcategory } from '../../../../../../both/models/administration/subcategory.model';
import { Categories } from '../../../../../../both/collections/administration/category.collection';
import { Category } from '../../../../../../both/models/administration/category.model';
import { SubcategoryEditComponent } from './subcategories-edit/subcategories-edit.component';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';

import template from './subcategories.component.html';
import style from './subcategories.component.scss';

@Component({
    selector: 'subcategory',
    template,
    styles: [ style ]
})
export class SubcategoryComponent implements OnInit, OnDestroy{

    private _user = Meteor.userId();
    private _subcategoryForm        : FormGroup;

    private _subcategories          : Observable<Subcategory[]>;
    private _categories             : Observable<Category[]>;
    private _restaurants            : Observable<Restaurant[]>;

    private _subcategorySub         : Subscription;    
    private _categoriesSub          : Subscription;
    private _restaurantSub          : Subscription;

    _selectedValue                  : string;
    _dialogRef                      : MdDialogRef<any>;

    /**
     * SubcategoryComponent constructor
     * @param {MdDialog} _dialog
     * @param {MdSnackBar} snackBar
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {Router} _router
     * @param {NgZone} _ngZone
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( public _dialog: MdDialog, 
                 public snackBar: MdSnackBar,
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
        this._subcategoryForm = new FormGroup({
            name: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 50 ) ] ),
            category: new FormControl( '' )  
        });
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } ).zone();
            });
        });
        this._categoriesSub = MeteorObservable.subscribe( 'categories', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._categories = Categories.find( { } ).zone();
            });
        });
        this._subcategorySub = MeteorObservable.subscribe( 'subcategories', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._subcategories = Subcategories.find( { } ).zone();
            });
        });
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
            let _lNewSubcategory = Subcategories.collection.insert({
                creation_user: this._user,
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                is_active: true,
                name: this._subcategoryForm.value.name,
                category: this._subcategoryForm.value.category
            });

            if( _lNewSubcategory ){
                let _lMessage:string = this.itemNameTraduction( 'SUBCATEGORIES.SUBCATEGORY_CREATED' );
                this.snackBar.open( _lMessage, '',{
                    duration: 2500
                });
            }

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
                modification_user: this._user
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
        this._subcategorySub.unsubscribe();
        this._restaurantSub.unsubscribe();
    }
}