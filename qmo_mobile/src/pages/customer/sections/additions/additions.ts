import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NavController, NavParams, Content } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Addition } from 'qmo_web/both/models/administration/addition.model';
import { Additions } from 'qmo_web/both/collections/administration/addition.collection';
import { Restaurants, RestaurantImageThumbs } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { Cities } from 'qmo_web/both/collections/settings/city.collection';
import { Countries } from 'qmo_web/both/collections/settings/country.collection';
import { Sections } from 'qmo_web/both/collections/administration/section.collection';
import { Categories } from 'qmo_web/both/collections/administration/category.collection';
import { Subcategories } from 'qmo_web/both/collections/administration/subcategory.collection';
import { Items, ItemImagesThumbs } from 'qmo_web/both/collections/administration/item.collection';
import { Order, OrderItem, OrderAddition } from 'qmo_web/both/models/restaurant/order.model';
import { ItemDetailPage } from '../item-detail/item-detail';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-add-additions',
  templateUrl: 'additions.html'
})
export class AdditionsPage implements OnInit, OnDestroy {

    private _additionsDetailFormGroup   : FormGroup = new FormGroup({});
    private _additionsFormGroup         : FormGroup = new FormGroup({});
    private _additionsSub               : Subscription;
    private _additions                  : any;

    private _restaurantId               : string;
    private _tableId                    : string;

    /**
     * AdditionsPage constructor
     */
    constructor( public _navCtrl: NavController,
                 public _navParams: NavParams,
                 private _translate: TranslateService ){
        this._restaurantId = this._navParams.get("res_id");
        this._tableId      = this._navParams.get("table_id");
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        this._additionsSub = MeteorObservable.subscribe( 'additionsByRestaurant', this._restaurantId ).subscribe( () => {
            this._additions = Additions.find( { } ).zone();
            this._additions.subscribe( () => { this.buildAdditionsForms(); });
        });
    }

    /**
     * Build controls in additions forms
     */
    buildAdditionsForms():void{
        Additions.collection.find( { } ).fetch().forEach( ( add ) => {
            if( this._additionsFormGroup.contains( add._id ) ){
                this._additionsFormGroup.controls[ add._id ].setValue( false );
            } else {
                let control: FormControl = new FormControl( false );
                this._additionsFormGroup.addControl( add._id, control );
            }

            if( this._additionsDetailFormGroup.contains( add._id ) ){
                this._additionsDetailFormGroup.controls[ add._id ].setValue( '' );
            } else {
                let control: FormControl = new FormControl( '', [ Validators.minLength(1), Validators.maxLength(2) ] );
                this._additionsDetailFormGroup.addControl( add._id, control );
            }
        });
    }

    /**
     * Return addition information
     * @param {Addition} _pAddition
     */
    getAdditionInformation( _pAddition : Addition ):string {
        return _pAddition.name + ' - ' + _pAddition.restaurants.filter( r => r.restaurantId === this._restaurantId )[0].price + ' ';
    }

    /**
     * Add Additions to Order
     */
    AddAdditionsToOrder() : void{
        let _lOrderAdditionsToInsert : OrderAddition[] = [];
        let _lAdditionsPrice : number = 0;
        let arrAdd : any[] = Object.keys( this._additionsDetailFormGroup.value );

        arrAdd.forEach( ( add ) => {
            if( this._additionsDetailFormGroup.value[ add ] ){
                let _lAddition:Addition = Additions.findOne( { _id: add } );
                let _lOrderAddition : OrderAddition = {
                    additionId: add,
                    quantity: this._additionsDetailFormGroup.value[ add ],
                    paymentAddition: ( this.getAdditionPrice( _lAddition ) * ( this._additionsDetailFormGroup.value[ add ] ) )
                };
                _lAdditionsPrice += _lOrderAddition.paymentAddition;
                _lOrderAdditionsToInsert.push( _lOrderAddition );
            }
        });
        MeteorObservable.call( 'AddAdditionsToOrder2', _lOrderAdditionsToInsert, this._restaurantId, this._tableId, _lAdditionsPrice ).subscribe( () => {
            let _lMessage:string = this.itemNameTraduction( 'MOBILE.ORDERS.ADDITON_AGGREGATED' );
            /**this.snackBar.open( _lMessage, '',{
                duration: 2500
            });*/
        }, ( error ) => { alert( `Error: ${error}` ) ; } );
        this._navCtrl.pop();
    }

    /**
     * Return Addition price
     * @param {Addition} _pAddition 
     */
    getAdditionPrice( _pAddition: Addition ):number{
        return _pAddition.restaurants.filter( r => r.restaurantId === this._restaurantId )[0].price;
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
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this._additionsSub.unsubscribe();
    }
}