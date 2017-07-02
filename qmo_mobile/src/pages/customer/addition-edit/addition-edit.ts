import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { App, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { Addition } from 'qmo_web/both/models/administration/addition.model';
import { Additions } from 'qmo_web/both/collections/administration/addition.collection';
import { Order, OrderItem, OrderAddition } from 'qmo_web/both/models/restaurant/order.model';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';
import { Items } from 'qmo_web/both/collections/administration/item.collection';
import { Restaurant } from 'qmo_web/both/models/restaurant/restaurant.model';
import { Restaurants, RestaurantImageThumbs } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { Storage } from '@ionic/storage';
import { CodeTypeSelectPage } from '../code-type-select/code-type-select';
import { SectionsPage } from '../sections/sections';
import { ItemEditPage } from '../item-edit/item-edit';

@Component({
    selector: 'page-additions-page',
    templateUrl: 'addition-edit.html'
})
export class AdditionEditPage implements OnInit, OnDestroy {

    private _additionsDetailFormGroup   : FormGroup = new FormGroup({});
    private _addition                   : OrderAddition;
    
    constructor(public _navCtrl : NavController,
                public _navParams: NavParams,
                private _formBuilder: FormBuilder,){
        this._addition = this._navParams.get("addition");
    }

    ngOnInit(){
        this._additionsDetailFormGroup = this._formBuilder.group({
            control : new FormControl( this._addition.quantity, [ Validators.minLength(1), Validators.maxLength(2) ] )
        });
    }

    /**
     * Return addition information
     * @param {Addition} _pAddition
     */
    getAdditionInformation() : void {
        console.log(this._addition);
        //return this._addition.name + ' - ' /*+ _pAddition.restaurants.filter( r => r.restaurantId === this.restaurantId )[0].price + ' '*/;
    }

    ngOnDestroy(){
    }
}