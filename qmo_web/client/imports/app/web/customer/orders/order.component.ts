import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { Table } from '../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../both/collections/restaurant/table.collection';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { UserDetails } from '../../../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../../../both/models/auth/user-detail.model';

import template from './order.component.html';
import style from './order.component.scss';

@Component({
    selector: 'orders',
    template,
    styles: [ style ]
})
export class OrdersComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    private _ordersForm: FormGroup;

    private _tablesSub: Subscription;
    private _userDetailsSub: Subscription;
    private _restaurantSub: Subscription;

    private _currentRestaurant: Restaurant;
    private _currentQRCode: string;

    private _showError: boolean = false;
    private _showAlphanumericCodeCard: boolean = false;
    private _showRestaurantInformation: boolean = false;
    private _showNewOrderButton: boolean = false;
    private _showOrderCreation: boolean = false;
    private _showOrderList: boolean = false;

    /**
     * OrdersComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     */
    constructor( private _translate: TranslateService, private _ngZone: NgZone ) {
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit() {
        this._ordersForm = new FormGroup({
            qrCode: new FormControl( '', [ Validators.required, Validators.minLength( 1 ) ] )
        });
        this._userDetailsSub = MeteorObservable.subscribe( 'getUserDetailsByUser', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                let _lUserDetail: UserDetail = UserDetails.findOne( { user_id: this._user } );
                if( _lUserDetail.current_restaurant !== "" && _lUserDetail.current_table !== "" ){
                    this._restaurantSub = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', this._user ).subscribe( () => {
                        this._ngZone.run( () => {
                            let _lRestaurant: Restaurant = Restaurants.findOne( { _id: _lUserDetail.current_restaurant } );
                            let _lTable:Table = Tables.findOne( { _id: _lUserDetail.current_table } );
                            this._currentRestaurant = _lRestaurant;
                            this._currentQRCode = _lTable.QR_code;
                            this._showAlphanumericCodeCard = false;
                            this._showRestaurantInformation = true;
                            this._showOrderList = true;
                            this._showNewOrderButton = true;
                        });
                    });
                } else {
                    this._showAlphanumericCodeCard = true;
                    this._showRestaurantInformation = false;
                    this._showOrderList = false;
                    this._showNewOrderButton = false;
                }
            });
        });
        this._tablesSub = MeteorObservable.subscribe( 'getAllTables' ).subscribe();
    }

    /**
     * This function validate if QR Code exists
     */
    validateQRCodeExists(){
        if( this._ordersForm.valid ){
            let _lTable:Table = Tables.findOne( { QR_code: this._ordersForm.value.qrCode } );
            if( _lTable ){
                MeteorObservable.call( 'getRestaurantByQRCode', _lTable.QR_code, this._user ).subscribe( ( _result: Restaurant ) => {
                    this._currentRestaurant = _result;
                    this._currentQRCode = _lTable.QR_code;
                    this._showAlphanumericCodeCard = false;
                    this._showRestaurantInformation = true;
                    this._showOrderList = true;
                    this._showNewOrderButton = true;
                }, ( error ) => {
                    alert(`Failed to get Restaurant: ${error}`);
                });
            } else {
                this._showError = true;
                this._showAlphanumericCodeCard = true;
                this._showRestaurantInformation = false;
                this._showOrderList = false;
                this._showNewOrderButton = false;
            }
        }
    }

    /**
     * This function allow user create new order
     */
    createNewOrder( _event?:any ):void{
        this._showOrderCreation = true;
        this._showRestaurantInformation = false;
        this._showOrderList = false;
        this._showNewOrderButton = false;
    }

    validateFinishOrderCreation( _event:any ):void{
        if( _event ){
            this._showOrderCreation = false;
            this._showRestaurantInformation = true;
            this._showOrderList = true;
            this._showNewOrderButton = true;
        } else {
            this._showOrderCreation = true;
            this._showRestaurantInformation = false;
            this._showOrderList = false;
            this._showNewOrderButton = false;
        }
    }

    /**
     * Function hide message error
     */
    hideMessageError(){
        this._showError = false;
    }

    /**
     * Function to cancel operation
     */
    cancel():void{
        this._ordersForm.reset();
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this._tablesSub.unsubscribe();
        this._userDetailsSub.unsubscribe();
        if( this._restaurantSub ){ this._restaurantSub.unsubscribe(); }
    }
}
