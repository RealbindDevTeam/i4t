import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { Item } from '../../../../../../../both/models/administration/item.model';
import { Items, ItemImagesStore } from '../../../../../../../both/collections/administration/item.collection';
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

import template from './item-creation.component.html';
import style from './item-creation.component.scss';

@Component({
    selector: 'item-creation',
    template,
    styles: [ style ]
})
export class ItemCreationComponent implements OnInit, OnDestroy { 

    private _itemForm: FormGroup;
    private _garnishFormGroup: FormGroup = new FormGroup({});    
    private _additionsFormGroup: FormGroup = new FormGroup({});

    private _sections: Observable<Section[]>;
    private _categories: Observable<Category[]>;
    private _subcategories: Observable<Subcategory[]>;
    private _restaurants: Observable<Restaurant[]>;

    private _itemsSub: Subscription;
    private _itemsImagesSub: Subscription;
    private _sectionsSub: Subscription;    
    private _categorySub: Subscription;
    private _subcategorySub: Subscription;
    private _restaurantSub: Subscription;
    private _garnishFoodSub: Subscription;
    private _additionSub: Subscription;

    private _restaurantsGarnishFood: string[];
    private _garnishFood: GarnishFood[] = [];
    private _additions: Addition[] = [];

    private _showGarnishFood: boolean = true;
    private _createImage: boolean = false;
    private _showAdditions: boolean = true;
    private _checkedGarnishFood: boolean = false;
    private _garnishFoodQuantity: number = 0;
    private _showGarnishFoodError: boolean = false;
    private _checkedAdditions: boolean = false;

    public _selectedIndex: number = 0;
    private _filesToUpload: Array<File>;
    private _itemImageToInsert: File;
    private _nameImageFile: string;

    private _selectedSectionValue: string;
    private _selectedCategoryValue: string;
    private _selectedSubcategoryValue: string;

    private _create_sectionId: string;
    private _create_categoryId: string;
    private _create_subcategoryId: string;
    private _create_name: string;
    private _create_description: string;
    private _create_price: number;
    private _create_taxPercentage: number;
    private _create_observations: boolean;
    private _create_garnishFoodIsAcceped: boolean;
    private _create_garnishFoodQuantity: number;
    private _create_additionsIsAccepted: boolean;

    /**
     * ItemComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {NgZone} _ngZone
     */
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, private _ngZone: NgZone, private _router: Router ){
        var _userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang ); 
        this._selectedSectionValue = "";
        this._selectedCategoryValue = "";
        this._selectedSubcategoryValue = "";
        this._restaurantsGarnishFood = [];
        this._filesToUpload = [];
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._itemForm = new FormGroup({
            section: new FormControl( '', [ Validators.required ] ),
            category: new FormControl( '' ),
            subcategory: new FormControl( '' ),
            name: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 55 ) ] ),
            description: new FormControl( '', [ Validators.required, Validators.minLength( 1 ),Validators.maxLength( 200 ) ] ),
            price: new FormControl('', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 20 ) ] ),
            taxPercentage: new FormControl( '', [ Validators.maxLength( 3 ) ] ),
            observations: new FormControl( false ),
            image: new FormControl( '' ),
            garnishFoodIsAcceped: new FormControl( false ),
            garnishFoodQuantity: new FormControl( '0' ),
            garnishFood: this._garnishFormGroup,
            additionsIsAccepted: new FormControl( false ),
            additions: this._additionsFormGroup
            
        });
        this._sections = Sections.find( { is_active: true } ).zone();
        this._sectionsSub = MeteorObservable.subscribe( 'sections', Meteor.userId() ).subscribe();
        this._categorySub = MeteorObservable.subscribe( 'categories', Meteor.userId() ).subscribe();
        this._subcategorySub = MeteorObservable.subscribe( 'subcategories', Meteor.userId() ).subscribe();      
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe();
        this._garnishFoodSub = MeteorObservable.subscribe( 'garnishFood', Meteor.userId() ).subscribe();   
        this._itemsSub = MeteorObservable.subscribe( 'items', Meteor.userId() ).subscribe();
        this._itemsImagesSub = MeteorObservable.subscribe( 'itemImages', Meteor.userId() ).subscribe();
        this._additionSub = MeteorObservable.subscribe( 'additions', Meteor.userId() ).subscribe();
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
            if( this._itemForm.controls['section'].valid ){
                return true;
            } else {
                return false;
            }
        case 2:
            if( this._itemForm.controls['name'].valid && this._itemForm.controls['price'].valid
                && this._itemForm.controls['description'].valid ){
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
        return this._itemForm.valid;
    }

    /**
     * Function to add Item
     */
    addItem():void{
        if( !Meteor.userId() ){
            alert( 'Please log in to add item' );
            return;
        }

        if( this._itemForm.valid ){
            let arr:any[] = Object.keys( this._itemForm.value.garnishFood );
            let _lGarnishFoodToInsert:string[] = [];

            arr.forEach( ( gar ) => {
                if( this._itemForm.value.garnishFood[ gar ] ){
                    let _lGarnishF:GarnishFood = GarnishFoodCol.findOne( { name: gar } );
                    _lGarnishFoodToInsert.push( _lGarnishF._id );
                }
            });

            let arrAdd:any[] = Object.keys( this._itemForm.value.additions );
            let _lAdditionsToInsert:string[] = [];

            arrAdd.forEach( ( add ) => {
                if( this._itemForm.value.additions[ add ] ){
                    let _lAddition:Addition = Additions.findOne( { name: add } );
                    _lAdditionsToInsert.push( _lAddition._id );
                }
            });

            if( this._createImage ){
                this._create_sectionId = this._itemForm.value.section;
                this._create_categoryId = this._itemForm.value.category;
                this._create_subcategoryId = this._itemForm.value.subcategory;
                this._create_name = this._itemForm.value.name;
                this._create_description = this._itemForm.value.description;
                this._create_price = this._itemForm.value.price;
                this._create_taxPercentage = this._itemForm.value.taxPercentage;
                this._create_observations = this._itemForm.value.observations;
                this._create_garnishFoodIsAcceped = this._itemForm.value.garnishFoodIsAcceped;
                this._create_garnishFoodQuantity = this._itemForm.value.garnishFoodQuantity;
                this._create_additionsIsAccepted = this._itemForm.value.additionsIsAccepted;

                uploadItemImage( this._itemImageToInsert, Meteor.userId() ).then( ( result ) => {
                    this.insertNewItem( result, _lGarnishFoodToInsert, _lAdditionsToInsert );
                }).catch( ( error ) => {
                    alert( 'Upload image error. Only accept .png, .jpg, .jpeg files.' );
                });   
            } else {
                this.insertNewItem( null, _lGarnishFoodToInsert, _lAdditionsToInsert );
            }
        }
        this.cancel();
    }

    /**
     * This function insert new item
     * @param {any} _pFile
     * @param {string[]} _pGarnishFood
     * @param {string[]} _pAdditions
     */
    insertNewItem( _pFile:any, _pGarnishFood:string[], _pAdditions:string[] ):void{
        if( _pFile != null ){
            Items.insert({
                creation_user: Meteor.userId(),
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                is_active: true,
                sectionId: this._create_sectionId,
                categoryId: this._create_categoryId,
                subcategoryId: this._create_subcategoryId,
                name: this._create_name,
                description: this._create_description,
                price: this._create_price,
                taxPercentage: this._create_taxPercentage,
                observations: this._create_observations,
                itemImageId: _pFile._id,
                urlImage: _pFile.url,
                garnishFoodIsAcceped: this._create_garnishFoodIsAcceped,
                garnishFoodQuantity: this._create_garnishFoodQuantity,
                garnishFood: _pGarnishFood,
                additionsIsAccepted: this._create_additionsIsAccepted,
                additions: _pAdditions,
                isAvailable: true
            });
        } else {
            Items.insert({
                creation_user: Meteor.userId(),
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                is_active: true,
                sectionId: this._itemForm.value.section,
                categoryId: this._itemForm.value.category,
                subcategoryId: this._itemForm.value.subcategory,
                name: this._itemForm.value.name,
                description: this._itemForm.value.description,
                price: this._itemForm.value.price,
                taxPercentage: this._itemForm.value.taxPercentage,
                observations: this._itemForm.value.observations,
                itemImageId: '-',
                urlImage: '-',
                garnishFoodIsAcceped: this._itemForm.value.garnishFoodIsAcceped,
                garnishFoodQuantity: this._itemForm.value.garnishFoodQuantity,
                garnishFood: _pGarnishFood,
                additionsIsAccepted: this._itemForm.value.additionsIsAccepted,
                additions: _pAdditions,
                isAvailable: true
            });
        }
    }

    /**
     * Function to change Section
     * @param {string} _section
     */
    changeSection( _section ):void{
        this._selectedSectionValue = _section;
        this._itemForm.controls['section'].setValue( _section );
        this._categories = Categories.find( { section: _section, is_active: true } ).zone();

        if( this._categories.isEmpty ){
            this._selectedCategoryValue = "";
        }

        let _lSection:Section = Sections.findOne( { _id: _section } );
        this._restaurants = Restaurants.find( { _id: { $in: _lSection.restaurants } } ).zone();
        Restaurants.collection.find( { _id: { $in: _lSection.restaurants } } ).fetch().forEach( (r) => {
            this._restaurantsGarnishFood.push( r._id );
        } );
        this._garnishFood = GarnishFoodCol.collection.find( { restaurants: { $in: this._restaurantsGarnishFood } } ).fetch();
        for( let gar of this._garnishFood ){
            let control: FormControl = new FormControl( false );
            this._garnishFormGroup.addControl( gar.name, control );
        }
        if( this._garnishFood.length === 0 ){
            this._showGarnishFood = false;
        }
        this._additions = Additions.collection.find( { restaurants: { $in: this._restaurantsGarnishFood } } ).fetch();
        for( let ad of this._additions ){
            let control: FormControl = new FormControl( false );
            this._additionsFormGroup.addControl( ad.name, control );
        }
        if( this._additions.length === 0 ){
            this._showAdditions = false;
        }
    }

    /**
     * Function to change category
     * @param {string} _category
     */
    changeCategory( _category ):void{
        this._selectedCategoryValue = _category;
        this._itemForm.controls['category'].setValue( _category );
        this._subcategories = Subcategories.find( { category: _category, is_active: true } ).zone();

        if( this._subcategories.isEmpty ){
            this._selectedSubcategoryValue = "";
        }
    }

    /**
     * Function to change subcategory
     * @param {string} _subcategory
     */
    changeSubcategory( _subcategory ):void{
        this._selectedSubcategoryValue = _subcategory;
        this._itemForm.controls['subcategory'].setValue( _subcategory );
    }

    /**
     * Function to cancel add Item
     */
    cancel():void{
        if( this._selectedSectionValue !== "" ){ this._selectedSectionValue = ""; }
        if( this._selectedCategoryValue !== "" ){ this._selectedCategoryValue = ""; }
        if( this._selectedSubcategoryValue !== "" ){ this._selectedSubcategoryValue = ""; }
        this._itemImageToInsert = new File( [ "" ],"" );
        this._createImage = false;
        this._filesToUpload = [];
        this._itemForm.reset();
        this._router.navigate( [ 'app/items' ] );
    }

    /**
     * When user wants add item image, this function allow insert the image in the store
     * @param {any} _fileInput
     */
    onChangeImage( _fileInput:any ):void{
        this._createImage = true;
        this._filesToUpload = <Array<File>> _fileInput.target.files;
        this._itemImageToInsert = this._filesToUpload[0];
        this._nameImageFile = this._itemImageToInsert.name;
    }

    /**
     * Function to control garnish food elements
     */
    changeGarnishFoodCheck(){
        if( this._checkedGarnishFood === false ){
            this._checkedGarnishFood = true;
            this._garnishFoodQuantity = 1;
            this._itemForm.controls['garnishFoodQuantity'].enable();
        } else {
            this._checkedGarnishFood = false;
            this._itemForm.controls['garnishFoodQuantity'].setValue( '0' );
            this._itemForm.controls['garnishFoodQuantity'].disable();
            this._garnishFormGroup.reset();
        }
    }

    /**
     * Function to control addition elements
     */
    changeAdditionCheck(){
        if( this._checkedAdditions === false ){
            this._checkedAdditions = true;
            this._itemForm.controls['additions'].enable();
        } else {
            this._checkedAdditions = false;
            this._itemForm.controls['additions'].disable();
            this._additionsFormGroup.reset();
        }
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._sectionsSub.unsubscribe();
        this._categorySub.unsubscribe();
        this._subcategorySub.unsubscribe();
        this._restaurantSub.unsubscribe();    
        this._garnishFoodSub.unsubscribe();
        this._itemsSub.unsubscribe();
        this._itemsImagesSub.unsubscribe();
        this._additionSub.unsubscribe();
    }
}