import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MdSnackBar, MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { UserDetails } from '../../../../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../../../../both/models/auth/user-detail.model';
import { Table } from '../../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../../both/collections/restaurant/table.collection';
import { Order } from '../../../../../../../both/models/restaurant/order.model';
import { Orders } from '../../../../../../../both/collections/restaurant/order.collection';
import { Payment } from '../../../../../../../both/models/restaurant/payment.model';
import { Payments } from '../../../../../../../both/collections/restaurant/payment.collection';
import { WaiterCallDetail } from '../../../../../../../both/models/restaurant/waiter-call-detail.model';
import { WaiterCallDetails } from '../../../../../../../both/collections/restaurant/waiter-call-detail.collection';
import { Account } from '../../../../../../../both/models/restaurant/account.model';
import { Accounts } from '../../../../../../../both/collections/restaurant/account.collection'; 
import { AlertConfirmComponent } from '../../../../web/general/alert-confirm/alert-confirm.component';

import template from './exit-table.component.html';
import style from './exit-table.component.scss';

@Component({
    selector: 'exit-table',
    template,
    styles: [ style ]
})
export class ExitTableComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    private _userDetailsSub         : Subscription;
    private _ordersSub              : Subscription;
    private _paymentsSub            : Subscription;
    private _waiterCallDetSub       : Subscription;
    private _tablesSub              : Subscription;
    private _accountsSub            : Subscription;

    private _userDetails            : Observable<UserDetail[]>;
    private _tables                 : Observable<Table[]>;
    private _orders                 : Observable<Order[]>;

    private _dialogRef              : MdDialogRef<any>;
    private titleMsg                : string;
    private btnAcceptLbl            : string;
    private _showWaiterCard         : boolean = false;

    /**
     * ExitTableComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     * @param {UserLanguageService} _userLanguageService
     * @param {MdDialog} _mdDialog
     * @param {MdSnackBar} _snackBar
     * @param {Router} _router
     */
    constructor( private _translate: TranslateService, 
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService,
                 protected _mdDialog: MdDialog,
                 public _snackBar: MdSnackBar,
                 private _router: Router ) {
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this.removeSubscriptions();
        this._userDetailsSub = MeteorObservable.subscribe( 'getUserDetailsByUser', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._userDetails = UserDetails.find( { } ).zone();
            });
        });
        this._ordersSub = MeteorObservable.subscribe( 'getOrdersByUserId', this._user, ['ORDER_STATUS.REGISTERED','ORDER_STATUS.IN_PROCESS','ORDER_STATUS.PREPARED',
                                                                                        'ORDER_STATUS.DELIVERED','ORDER_STATUS.PENDING_CONFIRM'] ).subscribe( () => {
            this._ngZone.run( () => {
                this._orders = Orders.find( { } ).zone();
                this._orders.subscribe( () => { this.validateOrdersMarkedToCancel(); } );
            });
        });
        this._paymentsSub = MeteorObservable.subscribe( 'getUserPayments', this._user ).subscribe();
        this._waiterCallDetSub = MeteorObservable.subscribe( 'countWaiterCallDetailByUsrId', this._user ).subscribe();
        this._tablesSub = MeteorObservable.subscribe( 'getTableByCurrentTable', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._tables = Tables.find( { } ).zone();
            });
        });
        this._accountsSub = MeteorObservable.subscribe( 'getAccountsByUserId', this._user ).subscribe();
    }

    /**
     * Validate orders marked to cancel
     */
    validateOrdersMarkedToCancel():void{
        let _lOrdersToCancelCount: number =  Orders.collection.find( { status: { $in: [ 'ORDER_STATUS.IN_PROCESS','ORDER_STATUS.PREPARED' ] }, markedToCancel: true } ).count();
        _lOrdersToCancelCount > 0 ? this._showWaiterCard = true : this._showWaiterCard = false;
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._userDetailsSub ){ this._userDetailsSub.unsubscribe(); }
        if( this._ordersSub ){ this._ordersSub.unsubscribe(); }
        if( this._paymentsSub ){ this._paymentsSub.unsubscribe(); }
        if( this._waiterCallDetSub ){ this._waiterCallDetSub.unsubscribe(); }
        if( this._tablesSub ){ this._tablesSub.unsubscribe(); }
        if( this._accountsSub ){ this._accountsSub.unsubscribe(); }
    }

    /**
     * Allow user exit restaurant table
     */
    exitRestaurantTable( _pCurrentRestaurant:string, _pCurrentTable:string ):void{
        let _lUserOrdersCount: number = Orders.collection.find( { creation_user: this._user, 
                                        restaurantId: _pCurrentRestaurant, tableId: _pCurrentTable } ).count();
        let _lUserWaiterCallsCount: number = WaiterCallDetails.collection.find( { restaurant_id: _pCurrentRestaurant, table_id: _pCurrentTable, 
                                             type: 'CALL_OF_CUSTOMER', user_id: this._user, status: 'completed' } ).count();
        let _lUserPaymentsCount: number = Payments.collection.find( { creation_user: this._user, restaurantId: _pCurrentRestaurant, 
                                          tableId: _pCurrentTable, status: 'PAYMENT.NO_PAID' } ).count();

        if( _lUserOrdersCount === 0 && _lUserWaiterCallsCount === 0 && _lUserPaymentsCount === 0 ){
            this._dialogRef = this._mdDialog.open( AlertConfirmComponent, {
                disableClose: true,
                data: {
                    title: 'Salida del Restaurante',
                    subtitle: '',
                    content: 'Estas seguro de salir del restaurante?',
                    buttonCancel: this.itemNameTraduction( 'NO' ),
                    buttonAccept: this.itemNameTraduction( 'YES' ),
                    showCancel: true
                }
            });
            this._dialogRef.afterClosed().subscribe( result => {
                this._dialogRef = result;
                if ( result.success ){
                    let _lTable: Table = Tables.findOne( { _id: _pCurrentTable } );
                    Tables.update( { _id: _pCurrentTable }, { $set: { amount_people: _lTable.amount_people - 1 } } );
                    let _lTableAux: Table = Tables.findOne( { _id: _pCurrentTable } ); 
                    if( _lTableAux.amount_people === 0 && _lTableAux.status === 'BUSY' ){
                        Tables.update( { _id: _pCurrentTable }, { $set: { status: 'FREE' } } );
                        Accounts.update( { restaurantId: _pCurrentRestaurant, tableId: _pCurrentTable }, { $set: { status: 'CLOSED' } } )
                    }     
                    UserDetails.update( { user_id: this._user }, { $set: { current_restaurant: '', current_table: '' } } );
                    let _lMessage:string = 'Has salido del Restaurante. Hasta Pronto!'
                    this._snackBar.open( _lMessage, '',{ duration: 2500 } );              
                }
            });
        } else {
            let _lOrdersRegisteredStatus: number = Orders.collection.find( { creation_user: this._user, restaurantId: _pCurrentRestaurant, 
                                                   tableId: _pCurrentTable, status: 'ORDER_STATUS.REGISTERED' } ).count();
            let _lOrdersInProcessStatus: number = Orders.collection.find( { creation_user: this._user, restaurantId: _pCurrentRestaurant, 
                                                  tableId: _pCurrentTable, status: 'ORDER_STATUS.IN_PROCESS' } ).count();
            let _lOrdersPreparedStatus: number = Orders.collection.find( { creation_user: this._user, restaurantId: _pCurrentRestaurant, 
                                                 tableId: _pCurrentTable, status: 'ORDER_STATUS.PREPARED' } ).count();
            let _lOrdersDeliveredStatus: number = Orders.collection.find( { creation_user: this._user, restaurantId: _pCurrentRestaurant, 
                                                  tableId: _pCurrentTable, status: 'ORDER_STATUS.DELIVERED' } ).count();
            let _lOrdersToConfirm: number = Orders.collection.find( { restaurantId: _pCurrentRestaurant, tableId: _pCurrentTable, 'translateInfo.firstOrderOwner': this._user, 
                                            'translateInfo.markedToTranslate': true, status: 'ORDER_STATUS.PENDING_CONFIRM', toPay : false } ).count();
            let _lOrdersWithPendingConfirmation: number = Orders.collection.find( { restaurantId: _pCurrentRestaurant, tableId: _pCurrentTable, 'translateInfo.lastOrderOwner': this._user, 
                                            'translateInfo.markedToTranslate': true, status: 'ORDER_STATUS.PENDING_CONFIRM', toPay : false } ).count();
            
            if( _lOrdersRegisteredStatus > 0 && _lOrdersInProcessStatus === 0 && _lOrdersPreparedStatus === 0 
                && _lOrdersDeliveredStatus === 0 && _lOrdersToConfirm === 0 && _lOrdersWithPendingConfirmation === 0 
                && _lUserWaiterCallsCount === 0 && _lUserPaymentsCount === 0 ){
                    this._dialogRef = this._mdDialog.open( AlertConfirmComponent, {
                        disableClose: true,
                        data: {
                            title: 'Tienes Ordenes Registradas!',
                            subtitle: '',
                            content: 'Si te vas del restaurante las ordenes se cancelaran. Estas seguro de salir?',
                            buttonCancel: this.itemNameTraduction( 'NO' ),
                            buttonAccept: this.itemNameTraduction( 'YES' ),
                            showCancel: true
                        }
                    });
                    this._dialogRef.afterClosed().subscribe( result => {
                        this._dialogRef = result;
                        if ( result.success ){
                            Orders.find( { creation_user: this._user, restaurantId: _pCurrentRestaurant, 
                                           tableId: _pCurrentTable, status: 'ORDER_STATUS.REGISTERED' } ).fetch().forEach( ( order ) => {
                                                Orders.update( { _id: order._id }, { $set: { status: 'ORDER_STATUS.CANCELED', modification_date: new Date() } } );
                            });
                            let _lTable: Table = Tables.findOne( { _id: _pCurrentTable } );
                            Tables.update( { _id: _pCurrentTable }, { $set: { amount_people: _lTable.amount_people - 1 } } );
                            let _lTableAux: Table = Tables.findOne( { _id: _pCurrentTable } ); 
                            if( _lTableAux.amount_people === 0 && _lTableAux.status === 'BUSY' ){
                                Tables.update( { _id: _pCurrentTable }, { $set: { status: 'FREE' } } );
                                Accounts.update( { restaurantId: _pCurrentRestaurant, tableId: _pCurrentTable }, { $set: { status: 'CLOSED' } } )
                            }
                            UserDetails.update( { user_id: this._user }, { $set: { current_restaurant: '', current_table: '' } } );
                            let _lMessage:string = 'Has salido del Restaurante. Hasta Pronto!'
                            this._snackBar.open( _lMessage, '',{ duration: 2500 } );
                        }
                    });
            } else {
                if( ( _lOrdersToConfirm > 0 || _lOrdersWithPendingConfirmation > 0 ) && _lOrdersRegisteredStatus === 0 && _lOrdersInProcessStatus === 0
                    && _lOrdersPreparedStatus === 0 && _lOrdersDeliveredStatus === 0 && _lUserWaiterCallsCount === 0
                    && _lUserPaymentsCount === 0 ){
                        this._dialogRef = this._mdDialog.open( AlertConfirmComponent, {
                            disableClose: true,
                            data: {
                                title: 'Ordenes Pendientes por confirmar!',
                                subtitle: '',
                                content: 'Las ordenes deben ser atendidas para salir del restaurante',
                                buttonCancel: '',
                                buttonAccept: 'Aceptar',
                                showCancel: false
                            }
                        });
                } else {
                    if( _lUserWaiterCallsCount > 0 && _lOrdersRegisteredStatus === 0 && _lOrdersInProcessStatus === 0
                        && _lOrdersPreparedStatus === 0 && _lOrdersDeliveredStatus === 0 && _lOrdersToConfirm === 0 
                        && _lOrdersWithPendingConfirmation === 0 && _lUserPaymentsCount === 0 ){
                            this._dialogRef = this._mdDialog.open( AlertConfirmComponent, {
                                disableClose: true,
                                data: {
                                    title: 'Llamados al Mesero Pendientes',
                                    subtitle: '',
                                    content: 'Los llamados al mesero deben ser atendidos o los puedes cancelar para salir',
                                    buttonCancel: '',
                                    buttonAccept: 'Aceptar',
                                    showCancel: false
                                }
                            });
                    } else {
                        if( _lUserPaymentsCount > 0 && _lOrdersRegisteredStatus === 0 && _lOrdersInProcessStatus === 0
                            && _lOrdersPreparedStatus === 0 && _lOrdersDeliveredStatus === 0 && _lOrdersToConfirm === 0 
                            && _lOrdersWithPendingConfirmation === 0 && _lUserWaiterCallsCount === 0 ){
                                this._dialogRef = this._mdDialog.open( AlertConfirmComponent, {
                                    disableClose: true,
                                    data: {
                                        title: 'Tienes Pagos Pendientes',
                                        subtitle: '',
                                        content: 'Un mesero ya se acercara a tu mesa para recibir tus pagos y asi poder salir',
                                        buttonCancel: '',
                                        buttonAccept: 'Aceptar',
                                        showCancel: false
                                    }
                                });
                        } else {
                            if( _lOrdersDeliveredStatus > 0 && _lOrdersRegisteredStatus === 0 && _lOrdersInProcessStatus === 0
                                && _lOrdersPreparedStatus === 0 && _lOrdersToConfirm === 0 && _lOrdersWithPendingConfirmation === 0
                                && _lUserWaiterCallsCount === 0 && _lUserPaymentsCount === 0 ){
                                    this._dialogRef = this._mdDialog.open( AlertConfirmComponent, {
                                        disableClose: true,
                                        data: {
                                            title: 'Tienes Ordenes Entregadas',
                                            subtitle: '',
                                            content: 'Paga las ordenes que se te han entregado y asi podras salir del restaurante',
                                            buttonCancel: '',
                                            buttonAccept: 'Aceptar',
                                            showCancel: false
                                        }
                                    });
                            } else {
                                this._dialogRef = this._mdDialog.open( AlertConfirmComponent, {
                                    disableClose: true,
                                    data: {
                                        title: 'Operacion Invalida',
                                        subtitle: '',
                                        content: 'El estado de tus ordenes no te permite salir del restaurante. Deseas Llamar un mesero para gestionar tus ordenes?',
                                        buttonCancel: this.itemNameTraduction( 'NO' ),
                                        buttonAccept: this.itemNameTraduction( 'YES' ),
                                        showCancel: true
                                    }
                                });
                                this._dialogRef.afterClosed().subscribe( result => {
                                    this._dialogRef = result;
                                    if ( result.success ){
                                        Orders.find( { creation_user: this._user, restaurantId: _pCurrentRestaurant, tableId: _pCurrentTable, 
                                                       status: { $in: [ 'ORDER_STATUS.IN_PROCESS', 'ORDER_STATUS.PREPARED' ] } } ).fetch().forEach( ( order ) => {
                                                 Orders.update( { _id: order._id }, { $set: { markedToCancel: true, modification_date: new Date() } } );
                                        });
                                        var data : any = {
                                            restaurants : _pCurrentRestaurant,
                                            tables : _pCurrentTable,
                                            user : this._user,
                                            waiter_id : "",
                                            status : "waiting",
                                            type : 'USER_EXIT_TABLE',
                                        }
                                        let isWaiterCalls = WaiterCallDetails.collection.find( { restaurant_id : _pCurrentRestaurant, table_id : _pCurrentTable, 
                                                            type : data.type, status: { $in : [ 'waiting', 'completed'] } } ).count();
                                        if( isWaiterCalls === 0 ){            
                                            setTimeout(() => {
                                                MeteorObservable.call( 'findQueueByRestaurant', data ).subscribe( () => {
                                                    let _lMessage:string = 'Mesero llamado correctamente'
                                                    this._snackBar.open( _lMessage, '',{
                                                        duration: 2500
                                                    });
                                                });
                                            }, 1500 );
                                        } else {
                                            this._dialogRef = this._mdDialog.open( AlertConfirmComponent, {
                                                disableClose: true,
                                                data: {
                                                    title: 'Mesero En Camino',
                                                    subtitle: '',
                                                    content: 'Un mesero ya recibio tu solicitud y va para tu mesa',
                                                    buttonCancel: '',
                                                    buttonAccept: 'Aceptar',
                                                    showCancel: false
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
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
     * This function allow go to Orders
     */
    goToOrders(){
        this._router.navigate(['/app/orders']);
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this.removeSubscriptions();
    }
}