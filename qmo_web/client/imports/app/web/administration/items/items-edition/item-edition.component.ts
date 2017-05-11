import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { Item, ItemImage, ItemImageThumb, ItemRestaurant, ItemPrice } from '../../../../../../../both/models/administration/item.model';
import { Items, ItemImages, ItemImagesThumbs } from '../../../../../../../both/collections/administration/item.collection';
import { uploadItemImage } from '../../../../../../../both/methods/administration/item.methods';
import { Sections } from '../../../../../../../both/collections/administration/section.collection';
import { Section } from '../../../../../../../both/models/administration/section.model';
import { Categories } from '../../../../../../../both/collections/administration/category.collection';
import { Category } from '../../../../../../../both/models/administration/category.model';
import { Subcategory } from '../../../../../../../both/models/administration/subcategory.model';
import { Subcategories } from '../../../../../../../both/collections/administration/subcategory.collection';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { GarnishFood } from '../../../../../../../both/models/administration/garnish-food.model';
import { GarnishFoodCol } from '../../../../../../../both/collections/administration/garnish-food.collection';
import { Addition } from '../../../../../../../both/models/administration/addition.model';
import { Additions } from '../../../../../../../both/collections/administration/addition.collection';
import { Currency } from '../../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../../both/collections/general/currency.collection';
import { Country } from '../../../../../../../both/models/settings/country.model';
import { Countries } from '../../../../../../../both/collections/settings/country.collection';

import template from './item-edition.component.html';
import style from './item-edition.component.scss';

@Component({
    selector: 'item-edition',
    template,
    styles: [ style ]
})
export class ItemEditionComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    public _itemToEdit: Item;
    private _itemEditionForm: FormGroup;
    private _garnishFormGroup: FormGroup = new FormGroup({}); 
    private _additionsFormGroup: FormGroup = new FormGroup({});
    private _restaurantsFormGroup: FormGroup = new FormGroup({});
    private _currenciesFormGroup: FormGroup = new FormGroup({});
    private _taxesFormGroup: FormGroup = new FormGroup({});

    private _sections: Observable<Section[]>;
    private _categories: Observable<Category[]>;
    private _subcategories: Observable<Subcategory[]>;
    private _restaurants: Observable<Restaurant[]>;
    private _currencies: Observable<Currency[]>;

    private _itemsSub: Subscription;
    private _itemImagesSub: Subscription;
    private _itemImageThumbsSub: Subscription;
    private _sectionsSub: Subscription;    
    private _categorySub: Subscription;
    private _subcategorySub: Subscription;
    private _restaurantSub: Subscription;
    private _garnishFoodSub: Subscription;
    private _additionSub: Subscription;
    private _currenciesSub: Subscription;
    private _countriesSub: Subscription;

    public _selectedIndex: number = 0;
    private _showGarnishFood: boolean = true;
    private _showAddition: boolean = true;
    //private _checkedGarnishFood: boolean = false;
    private _garnishFoodQuantity: number = 0;
    private _showRestaurants = false;
    //private _checkedAdditions: boolean = false;

    private _itemSection: string;
    private _itemCategory: string;
    private _itemSubcategory: string;
    private _selectedCategory: string = "";
    private _selectedSection: string = "";
    private _selectedSubcategory: string = "";

    private _garnishFoodList: GarnishFood[];
    private _itemGarnishFood: string[];
    private _garnishFoodCreation: GarnishFood[];
    private _restaurantsGarnishFood: string[];
    private _edition_garnishFood: string[];
    private _additionCreation: Addition[];
    private _itemAdditions: string[];
    private _additionList: Addition[];
    private _edition_addition: string[];
    private _restaurantList:Restaurant[] = [];
    private _itemRestaurants: ItemRestaurant[] = [];

    private _editImage: boolean = false;
    private _editFilesToUpload: Array<File>;
    private _editItemImageToInsert: File;
    private _nameImageFileEdit: string;
    private _itemEditImage: string;

    /**
     * ItemEditionComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {NgZone} _ngZone
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, private _ngZone: NgZone, public _dialogRef: MdDialogRef<any> ){
        var _userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
        this._itemGarnishFood = [];
        this._garnishFoodCreation = [];
        this._garnishFoodList = [];
        this._editFilesToUpload = [];
        this._restaurantsGarnishFood = []; 
        this._edition_garnishFood = [];
        this._additionCreation = [];
        this._itemAdditions = [];
        this._additionList = [];
        this._edition_addition = [];
    }

    /**
     * implements ngOnInit function
     */
    ngOnInit(){
        let _restaurantsId: string[] = [];        
        this._itemEditionForm = this._formBuilder.group({
            editId: [ this._itemToEdit._id ],
            editIsActive: [ this._itemToEdit.is_active ],
            editSectionId: [ this._itemToEdit.sectionId ],
            editCategoryId: [ this._itemToEdit.categoryId ],
            editSubcategoryId: [ this._itemToEdit.subcategoryId ],
            editName: [ this._itemToEdit.name ],
            editDescription: [ this._itemToEdit.description ],
            editRestaurants: this._restaurantsFormGroup,
            editCurrencies: this._currenciesFormGroup,
            editTaxes: this._taxesFormGroup,
            //editPrice: [ this._itemToEdit.price ],
            //editTaxPercentage: [ this._itemToEdit.taxPercentage ],
            editObservations: [ this._itemToEdit.observations ],
            editImage: [ '' ],
            //editGarnishFoodIsAcceped: [ this._itemToEdit.garnishFoodIsAcceped ],
            editGarnishFoodQuantity: [ this._itemToEdit.garnishFoodQuantity ],
            editGarnishFood: this._garnishFormGroup,
            //editAdditionsIsAccepted: [ this._itemToEdit.additionsIsAccepted ],
            editAdditions: this._additionsFormGroup,
            editIsAvailable: [ this._itemToEdit.isAvailable ]
        });

        this._itemSection = this._itemToEdit.sectionId;
        this._selectedSection = this._itemToEdit.sectionId;
        this._itemCategory = this._itemToEdit.categoryId;
        this._selectedCategory = this._itemToEdit.categoryId;
        this._itemSubcategory = this._itemToEdit.subcategoryId;
        this._selectedSubcategory = this._itemToEdit.subcategoryId;
        this._itemGarnishFood = this._itemToEdit.garnishFood;
        this._itemAdditions = this._itemToEdit.additions;
        this._garnishFoodQuantity = this._itemToEdit.garnishFoodQuantity;
        //this._checkedGarnishFood = this._itemToEdit.garnishFoodIsAcceped;
        //this._checkedAdditions = this._itemToEdit.additionsIsAccepted;

        this._itemsSub = MeteorObservable.subscribe( 'items', this._user ).subscribe();
        this._itemImagesSub = MeteorObservable.subscribe( 'itemImages', this._user ).subscribe();
        this._itemImageThumbsSub = MeteorObservable.subscribe( 'itemImageThumbs', this._user ).subscribe();
        this._sectionsSub = MeteorObservable.subscribe( 'sections', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._sections = Sections.find( { is_active: true } ).zone();
            });
        });
        this._categorySub = MeteorObservable.subscribe( 'categories', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._categories = Categories.find( { section: this._itemSection } ).zone();
            });
        });
        this._subcategorySub = MeteorObservable.subscribe( 'subcategories', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._subcategories = Subcategories.find( { category: this._itemCategory } ).zone();
            });
        });
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } ).zone();
                Restaurants.collection.find( { } ).fetch().forEach( ( rest ) => {
                    _restaurantsId.push( rest._id );
                    let restaurant:Restaurant = rest;    
                    let find = this._itemRestaurants.filter( r => r.restaurantId === restaurant._id );

                    if( find.length > 0 ){
                        let control: FormControl = new FormControl( true );                                          
                        this._restaurantsFormGroup.addControl( restaurant.name, control );  
                        this._restaurantList.push( restaurant );
                    } else {
                        let control: FormControl = new FormControl( false );                                          
                        this._restaurantsFormGroup.addControl( restaurant.name, control );  
                        this._restaurantList.push( restaurant );
                    }
                });
                this._countriesSub = MeteorObservable.subscribe( 'getCountriesByRestaurantsId', _restaurantsId ).subscribe();
                this._currenciesSub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', _restaurantsId ).subscribe();
                this._currencies = Currencies.find( { } ).zone();
            });
        });
        this._garnishFoodSub = MeteorObservable.subscribe( 'garnishFood', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._garnishFoodCreation = GarnishFoodCol.collection.find().fetch();
                for( let gar of this._garnishFoodCreation ){
                    let garnishF:GarnishFood = gar;
                    let find = this._itemGarnishFood.filter( g => g == garnishF._id );

                    if( find.length > 0 ){
                        let control: FormControl = new FormControl( true );
                        this._garnishFormGroup.addControl( garnishF.name, control );
                        this._garnishFoodList.push( garnishF );
                    } else {
                        let control: FormControl = new FormControl( false );
                        this._garnishFormGroup.addControl( garnishF.name, control );
                        this._garnishFoodList.push( garnishF );
                    }
                }

                if( this._garnishFoodList.length === 0 ){
                    this._showGarnishFood = false;
                }
            });
        });

        this._additionSub = MeteorObservable.subscribe( 'additions', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._additionCreation = Additions.collection.find().fetch();
                for( let add of this._additionCreation ){
                    let addition:Addition = add;
                    let findAdd = this._itemAdditions.filter( d => d == addition._id );

                    if( findAdd.length > 0 ){
                        let control: FormControl = new FormControl( true );
                        this._additionsFormGroup.addControl( addition.name, control );
                        this._additionList.push( addition );
                    } else {
                        let control: FormControl = new FormControl( false );
                        this._additionsFormGroup.addControl( addition.name, control );
                        this._additionList.push( addition );
                    }
                }
                if( this._additionList.length === 0 ){
                    this._showAddition = false;
                }
            });
        });

        let _lSection:Section = Sections.collection.findOne( { _id: this._itemSection } );
        this._restaurants = Restaurants.find( { _id: { $in: _lSection.restaurants } } ).zone();

        let _lItemImage:ItemImage = ItemImages.collection.findOne( { itemId: this._itemToEdit._id } );
        this._itemEditImage = _lItemImage.url;
    }

    /**
     * This function get selectedIndex
     */
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    /**
     * This function set selectedIndex
     * @param {number} _selectedIndex
     */
    set selectedIndex( _selectedIndex: number ) {
        this._selectedIndex = _selectedIndex;
    }

    /**
     * This function allow move in wizard tabs
     * @param {number} _index
     */
    canMove( _index: number ): boolean {
        switch ( _index ) {
        case 0:
            return true;
        case 1:
            if( this._itemEditionForm.controls['editSectionId'].valid ){
                return true;
            } else {
                return false;
            }
        case 2:
            if( this._itemEditionForm.controls['editName'].valid
                && this._itemEditionForm.controls['editDescription'].valid ){
                    return true
                } else {
                    return false;
                }
        default:
            return true;
        }
    }

    /**
     * This function move to the next tab
     */
    next(): void {
        if( this.canMove( this._selectedIndex + 1 ) ) {
            this._selectedIndex ++;
        }
    }

    /**
     * This function move to the previous tab
     */
    previous(): void {
        if( this._selectedIndex === 0 ) {
            return;
        }
        if( this.canMove( this._selectedIndex - 1 ) ) {
            this._selectedIndex --;
        }
    }

    /**
     * This fuction allow wizard to create restaurant
     */
    canFinish(): boolean {
        return this._itemEditionForm.valid;
    }

    /**
     * Function to change Section
     * @param {string} _section
     */
    changeSectionEdit( _section ):void{
        let _restaurantSectionsIds: string[]= [];
        this._itemEditionForm.controls['editSectionId'].setValue( _section );

        this._categories = Categories.find( { section: _section, is_active: true } ).zone();
        if( this._categories.isEmpty ){ this._selectedCategory = ""; }

        let _lSection:Section = Sections.findOne( { _id: _section } );

        if( Restaurants.find( { _id: { $in: _lSection.restaurants } } ).zone().isEmpty ){
            this._showRestaurants = true;
            Restaurants.collection.find( { _id: { $in: _lSection.restaurants } } ).fetch().forEach( (r) => {
                if( this._restaurantsFormGroup.contains( r.name ) ){
                    this._restaurantsFormGroup.controls[ r.name ].setValue( false );
                } else {
                    let control: FormControl = new FormControl( false );
                    this._restaurantsFormGroup.addControl( r.name, control );
                }
                _restaurantSectionsIds.push( r._id );
                this._restaurantList.push( r );
            });
        }

        if( GarnishFoodCol.find( { 'restaurants.restaurantId': { $in: _restaurantSectionsIds } } ).zone().isEmpty ){
            this._showGarnishFood = true;
            GarnishFoodCol.collection.find( { 'restaurants.restaurantId': { $in: _restaurantSectionsIds } } ).fetch().forEach( ( gar ) => {
                if( this._garnishFormGroup.contains( gar.name ) ){
                    this._garnishFormGroup.controls[ gar.name ].setValue( false );
                } else {
                    let control: FormControl = new FormControl( false );
                    this._garnishFormGroup.addControl( gar.name, control );
                }
            });
            this._garnishFoodList = GarnishFoodCol.collection.find( { 'restaurants.restaurantId': { $in: _restaurantSectionsIds } } ).fetch();
        }

        if( Additions.find( { 'restaurants.restaurantId': { $in: _restaurantSectionsIds } } ).zone().isEmpty ){
            this._showAddition = true;
            Additions.collection.find( { 'restaurants.restaurantId': { $in: _restaurantSectionsIds } } ).fetch().forEach( ( ad ) => {
                if( this._additionsFormGroup.contains( ad.name ) ){
                    this._additionsFormGroup.controls[ ad.name ].setValue( false );
                } else {
                    let control: FormControl = new FormControl( false );
                    this._additionsFormGroup.addControl( ad.name, control );
                }
            });
            this._additionList = Additions.collection.find( { 'restaurants.restaurantId': { $in: _restaurantSectionsIds } } ).fetch();
        }

        //this._restaurants = Restaurants.find( { _id: { $in: _lSection.restaurants } } ).zone();
        /*Restaurants.collection.find( { _id: { $in: _lSection.restaurants } } ).fetch().forEach( (r) => {
            this._restaurantsGarnishFood.push( r._id );
        } );*/
        /*this._garnishFoodList = GarnishFoodCol.collection.find( { restaurants: { $in: this._restaurantsGarnishFood } } ).fetch();
        for( let gar of this._garnishFoodList ){
            let control: FormControl = new FormControl( false );
            this._garnishFormGroup.addControl( gar.name, control );
        }
        if( this._garnishFoodList.length === 0 ){
            this._showGarnishFood = false;
        }

        this._additionList = Additions.collection.find( { restaurants: { $in: this._restaurantsGarnishFood } } ).fetch();
        for( let add of this._additionList ){
            let control: FormControl = new FormControl( false );
            this._additionsFormGroup.addControl( add.name, control );
        }
        if( this._additionList.length === 0 ){
            this._showAddition = false;
        }*/
    }

    /**
     * Function to change category
     * @param {string} _category
     */
    changeCategoryEdit( _category ){
        this._itemEditionForm.controls['editCategoryId'].setValue( _category );
        this._subcategories = Subcategories.find( { category: _category, is_active: true } ).zone();
        if( this._subcategories.isEmpty ){ this._selectedSubcategory = "";}
    }

    /**
     * Function to change subcategory
     * @param {string} _subcategory
     */
    changeSubcategoryEdit( _subcategory ){
        this._itemEditionForm.controls['editSubcategoryId'].setValue( _subcategory );
    }

    /**
     * When user wants edit item image, this function allow insert the image in the store
     * @param {any} _fileInput
     */
    onChangeEditImage( _fileInput:any ):void{
        this._editImage = true;
        this._editFilesToUpload = <Array<File>> _fileInput.target.files;
        this._editItemImageToInsert = this._editFilesToUpload[0];
        this._nameImageFileEdit = this._editItemImageToInsert.name;
    }

    /**
     * Function to edit Item
     */
    editItem():void{
        if( !Meteor.userId() ){
            alert('Please log in to edit a item');
            return;
        }

        if( this._itemEditionForm.valid ){
            let arr:any[] = Object.keys( this._itemEditionForm.value.editGarnishFood );

            arr.forEach( ( gar ) => {
                if( this._itemEditionForm.value.editGarnishFood[ gar ] ){
                    let garnishF:GarnishFood = GarnishFoodCol.findOne( { name: gar } );
                    this._edition_garnishFood.push( garnishF._id );
                }
            });

            let arrAdd:any[] = Object.keys( this._itemEditionForm.value.editAdditions );
            arrAdd.forEach( ( add ) => {
                if( this._itemEditionForm.value.editAdditions[ add ] ){
                    let addition:Addition = Additions.findOne( { name: add } );
                    this._edition_addition.push( addition._id );
                }
            });

            Items.update( this._itemEditionForm.value.editId, {
                $set:{
                    modification_user: Meteor.userId(),
                    modification_date: new Date(),
                    is_active: this._itemEditionForm.value.editIsActive,
                    sectionId: this._itemEditionForm.value.editSectionId,
                    categoryId: this._itemEditionForm.value.editCategoryId,
                    subcategoryId: this._itemEditionForm.value.editSubcategoryId,
                    name: this._itemEditionForm.value.editName,
                    description: this._itemEditionForm.value.editDescription,
                    //price: this._itemEditionForm.value.editPrice,
                    //taxPercentage: this._itemEditionForm.value.editTaxPercentage,
                    observations: this._itemEditionForm.value.editObservations,
                    //garnishFoodIsAcceped: this._checkedGarnishFood,
                    garnishFoodQuantity: this._itemEditionForm.value.editGarnishFoodQuantity,
                    garnishFood: this._edition_garnishFood,
                    //additionsIsAccepted: this._checkedAdditions,
                    additions: this._edition_addition,
                    isAvailable: this._itemEditionForm.value.editIsAvailable
                }
            });

            if( this._editImage ){
                let _lItemImage:ItemImage = ItemImages.findOne( { itemId: this._itemEditionForm.value.editId } );
                let _lItemImageThumb: ItemImageThumb =  ItemImagesThumbs.findOne( { itemId: this._itemEditionForm.value.editId } );

                ItemImages.remove( { _id: _lItemImage._id } );
                ItemImagesThumbs.remove( { _id: _lItemImageThumb._id } );

                uploadItemImage( this._editItemImageToInsert, 
                                 Meteor.userId(),
                                 this._itemEditionForm.value.editId ).then( ( result ) => {
                    
                }).catch( (error) => {
                    alert( 'Update image error. Only accept .png, .jpg, .jpeg files.' );
                });
            }
            this._dialogRef.close();
        }        
    }

    /**
     * Function to control garnish food elements
     
    changeGarnishFoodCheck(){
        if( this._checkedGarnishFood === false ){
            this._checkedGarnishFood = true;
            this._garnishFoodQuantity = 1;
            this._itemEditionForm.controls['editGarnishFoodQuantity'].enable();
        } else {
            this._checkedGarnishFood = false;
            this._itemEditionForm.controls['editGarnishFoodQuantity'].setValue( '0' );
            this._garnishFormGroup.reset();
        }
    }*/

    /**
     * Function to control addition elements
     
    changeAdditionCheck(){
        if( this._checkedAdditions === false ){
            this._checkedAdditions = true;
            this._itemEditionForm.controls['editAdditions'].enable();
        } else {
            this._checkedAdditions = false;
            this._additionsFormGroup.reset();
        }
    }*/

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._itemsSub.unsubscribe();
        this._itemImagesSub.unsubscribe();
        this._itemImageThumbsSub.unsubscribe();
        this._sectionsSub.unsubscribe();
        this._categorySub.unsubscribe();
        this._subcategorySub.unsubscribe();
        this._restaurantSub.unsubscribe();
        this._garnishFoodSub.unsubscribe();
        this._additionSub.unsubscribe();
        this._currenciesSub.unsubscribe();
        this._countriesSub.unsubscribe();
    }
}