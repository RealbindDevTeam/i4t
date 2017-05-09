import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { Item, ItemRestaurant, ItemPrice } from '../../../../../../../both/models/administration/item.model';
import { Items } from '../../../../../../../both/collections/administration/item.collection';
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

import template from './item-creation.component.html';
import style from './item-creation.component.scss';

@Component({
    selector: 'item-creation',
    template,
    styles: [ style ]
})
export class ItemCreationComponent implements OnInit, OnDestroy { 
    
    private _user = Meteor.userId();
    private _itemForm: FormGroup;
    private _garnishFormGroup: FormGroup = new FormGroup({});    
    private _additionsFormGroup: FormGroup = new FormGroup({});
    private _restaurantsFormGroup: FormGroup = new FormGroup({});
    private _currenciesFormGroup: FormGroup = new FormGroup({});
    private _taxesFormGroup: FormGroup = new FormGroup({});

    private _sections: Observable<Section[]>;
    private _categories: Observable<Category[]>;
    private _subcategories: Observable<Subcategory[]>;
    private _currencies: Observable<Currency[]>;

    private _itemsSub: Subscription;
    private _sectionsSub: Subscription;    
    private _categorySub: Subscription;
    private _subcategorySub: Subscription;
    private _restaurantSub: Subscription;
    private _garnishFoodSub: Subscription;
    private _additionSub: Subscription;
    private _currenciesSub: Subscription;
    private _countriesSub: Subscription;

    private _restaurantsId: string[] = [];
    private _restaurantSectionsIds: string[]= [];
    private _restaurantList:Restaurant[] = [];
    private _restaurantCurrencies: string [] = [];
    private _restaurantTaxes: string [] = [];
    private _garnishFood: GarnishFood[] = [];
    private _additions: Addition[] = [];

    private _showGarnishFood: boolean = false;
    private _createImage: boolean = false;
    private _showAdditions: boolean = false;
    private _showRestaurants = false;
    private _showCurrencies: boolean = false;
    private _showTaxes: boolean = false;

    public _selectedIndex: number = 0;
    private _filesToUpload: Array<File>;
    private _itemImageToInsert: File;
    private _nameImageFile: string;
    private _restaurantsSelectedCount: number = 0;

    private _selectedSectionValue: string;
    private _selectedCategoryValue: string;
    private _selectedSubcategoryValue: string;

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
            restaurants: this._restaurantsFormGroup,
            currencies: this._currenciesFormGroup,
            taxes: this._taxesFormGroup,
            observations: new FormControl( false ),
            image: new FormControl( '' ),
            garnishFoodIsAcceped: new FormControl( false ),
            garnishFoodQuantity: new FormControl( '0' ),
            garnishFood: this._garnishFormGroup,
            additionsIsAccepted: new FormControl( false ),
            additions: this._additionsFormGroup
        });

        this._sectionsSub = MeteorObservable.subscribe( 'sections', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._sections = Sections.find( { is_active: true } ).zone();
            });
        });
        this._categorySub = MeteorObservable.subscribe( 'categories', this._user ).subscribe();
        this._subcategorySub = MeteorObservable.subscribe( 'subcategories', this._user ).subscribe();      
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                Restaurants.collection.find({}).fetch().forEach( ( res ) => {
                    this._restaurantsId.push( res._id );
                });
                this._countriesSub = MeteorObservable.subscribe( 'getCountriesByRestaurantsId', this._restaurantsId ).subscribe();
                this._currenciesSub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', this._restaurantsId ).subscribe();
                this._currencies = Currencies.find( { } ).zone();
            });
        });
        this._itemsSub = MeteorObservable.subscribe( 'items', this._user ).subscribe();
        this._garnishFoodSub = MeteorObservable.subscribe( 'garnishFood', this._user ).subscribe();   
        this._additionSub = MeteorObservable.subscribe( 'additions', this._user ).subscribe();
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
            if( this._itemForm.controls['name'].valid && this._itemForm.controls['description'].valid && 
                this._restaurantsSelectedCount > 0 ){
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

            let _lNewItem = Items.collection.insert({
                creation_user: this._user,
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                is_active: true,
                sectionId: this._itemForm.value.section,
                categoryId: this._itemForm.value.category,
                subcategoryId: this._itemForm.value.subcategory,
                name: this._itemForm.value.name,
                restaurants: [],
                prices: [],
                observations: this._itemForm.value.observations,
                garnishFoodIsAcceped: this._itemForm.value.garnishFoodIsAcceped,
                garnishFoodQuantity: this._itemForm.value.garnishFoodQuantity,
                garnishFood: _lGarnishFoodToInsert,
                additionsIsAccepted: this._itemForm.value.additionsIsAccepted,
                additions: _lAdditionsToInsert,
                isAvailable: true
            });  

            /*if( this._createImage ){
                uploadItemImage( this._itemImageToInsert, 
                                 Meteor.userId(),
                                 _lNewItem ).then( ( result ) => {

                }).catch( ( error ) => {
                    alert( 'Upload image error. Only accept .png, .jpg, .jpeg files.' );
                });   
            }*/
        }
        this.cancel();
    }

    /**
     * Function to change Section
     * @param {string} _section
     */
    changeSection( _section ):void{
        this._selectedSectionValue = _section;
        this._itemForm.controls['section'].setValue( _section );
        
        this._categories = Categories.find( { section: _section, is_active: true } ).zone();
        if( this._categories.isEmpty ){ this._selectedCategoryValue = ""; }

        let _lSection:Section = Sections.findOne( { _id: _section } );

        if( Restaurants.find( { _id: { $in: _lSection.restaurants } } ).zone().isEmpty ){
            this._showRestaurants = true;
            Restaurants.collection.find( { _id: { $in: _lSection.restaurants } } ).fetch().forEach( (r) => {
                let control: FormControl = new FormControl( false );
                this._restaurantsFormGroup.addControl( r.name, control );
                this._restaurantSectionsIds.push( r._id );
                this._restaurantList.push( r );
            });
        }

        if( GarnishFoodCol.find( { 'restaurants.restaurantId': { $in: this._restaurantSectionsIds } } ).zone().isEmpty ){
            this._showGarnishFood = true;
            GarnishFoodCol.collection.find( { 'restaurants.restaurantId': { $in: this._restaurantSectionsIds } } ).fetch().forEach( ( gar ) => {
                let control: FormControl = new FormControl( false );
                this._garnishFormGroup.addControl( gar.name, control );
            });
            this._garnishFood = GarnishFoodCol.collection.find( { 'restaurants.restaurantId': { $in: this._restaurantSectionsIds } } ).fetch();
        }

        if( Additions.find( { 'restaurants.restaurantId': { $in: this._restaurantSectionsIds } } ).zone().isEmpty ){
            this._showAdditions = true;
            Additions.collection.find( { 'restaurants.restaurantId': { $in: this._restaurantSectionsIds } } ).fetch().forEach( ( ad ) => {
                let control: FormControl = new FormControl( false );
                this._additionsFormGroup.addControl( ad.name, control );
            });
            this._additions = Additions.collection.find( { 'restaurants.restaurantId': { $in: this._restaurantSectionsIds } } ).fetch();
        }
    }

    /**
     * This function allow create item price with diferent currencies
     * @param {string} _pRestaurantName 
     * @param {any} _pEvent 
     */
    onCheckRestaurant( _pRestaurantName: string, _pEvent:any ):void{
        let _lRestaurant: Restaurant = this._restaurantList.filter( r => r.name === _pRestaurantName )[0];
        if( _pEvent.checked ){
            this._restaurantsSelectedCount++;
            let _lCountry: Country = Countries.findOne( { _id: _lRestaurant.countryId } );
            if( this._restaurantCurrencies.indexOf( _lRestaurant.currencyId ) <= -1 ){
                let _lCurrency: Currency = Currencies.findOne( { _id: _lRestaurant.currencyId } );
                let _initValue: string = '';
                if( _lCurrency.decimal !== 0 ){
                    for( let i = 0; i < ( _lCurrency.decimal ).toString().slice( ( _lCurrency.decimal.toString().indexOf( '.' ) ), ( _lCurrency.decimal.toString().length ) ).length - 1; i++ ){
                        _initValue += '0';
                    }
                    _initValue = '0.' + _initValue;
                }
                let control: FormControl = new FormControl( _initValue, [ Validators.required ] );
                this._currenciesFormGroup.addControl( _lRestaurant.currencyId, control );
                this._restaurantCurrencies.push( _lRestaurant.currencyId );

                if( _lCountry.itemsWithDifferentTax === true ){
                    let control: FormControl = new FormControl( '0', [ Validators.required ] );
                    this._taxesFormGroup.addControl( _lRestaurant.currencyId, control );
                    this._restaurantTaxes.push( _lRestaurant.currencyId );
                }
            }
        } else {
            this._restaurantsSelectedCount--;
            let _aux:number = 0;
            let _auxTax:number = 0;
            let arr:any[] = Object.keys( this._itemForm.value.restaurants );
             arr.forEach( ( rest ) => {
                if( this._itemForm.value.restaurants[ rest ] ){
                    let _lRes: Restaurant = this._restaurantList.filter( r => r.name === rest )[0];
                    if( _lRestaurant.currencyId === _lRes.currencyId ){
                        _aux ++;             
                    }
                    let _lCountry: Country = Countries.findOne( { _id: _lRes.countryId } );
                    if( _lCountry.itemsWithDifferentTax === true ){
                        _auxTax ++;
                    }
                }            
            });

            if( _aux === 0 ){ this._restaurantCurrencies.splice( this._restaurantCurrencies.indexOf( _lRestaurant.currencyId ), 1 ); }
            if( _auxTax === 0 ){ this._restaurantTaxes.splice( this._restaurantTaxes.indexOf( _lRestaurant.currencyId ), 1 ); }
        }
        this._restaurantCurrencies.length > 0 ? this._showCurrencies = true : this._showCurrencies = false;
        this._restaurantTaxes.length > 0 ? this._showTaxes = true : this._showTaxes = false;
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
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._sectionsSub.unsubscribe();
        this._categorySub.unsubscribe();
        this._subcategorySub.unsubscribe();
        this._restaurantSub.unsubscribe();    
        this._garnishFoodSub.unsubscribe();
        this._itemsSub.unsubscribe();
        this._additionSub.unsubscribe();
        this._currenciesSub.unsubscribe();
        this._countriesSub.unsubscribe();
    }
}