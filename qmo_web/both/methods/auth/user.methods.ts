import { Meteor } from 'meteor/meteor';
import { User } from '../../models/auth/user.model';
import { UserDetail } from '../../models/auth/user-detail.model';
import { UserDetails } from '../../collections/auth/user-detail.collection';
import { Account } from '../../models/restaurant/account.model';
import { Accounts } from '../../collections/restaurant/account.collection';
import { Order } from '../../models/restaurant/order.model';
import { Orders } from '../../collections/restaurant/order.collection';
import { Payments } from '../../collections/restaurant/payment.collection';
import { WaiterCallDetails } from '../../collections/restaurant/waiter-call-detail.collection';

if( Meteor.isServer ){
    Meteor.methods({
        penalizeCustomer: function( _pCustomerUser : User ){
            let _lUserDetail: UserDetail = UserDetails.findOne( { user_id: _pCustomerUser._id } );
            let _lCustomerRestaurant: string = _lUserDetail.current_restaurant;
            let _lCustomerTable: string = _lUserDetail.current_table;
            let _lCustomerAccount: Account = Accounts.findOne( { restaurantId: _lCustomerRestaurant, tableId: _lCustomerTable, status: 'OPEN' } );

            if( _lCustomerAccount ){
                let _lOrdersRegisteredStatus: number = Orders.find( { creation_user: this._user, restaurantId: _lCustomerRestaurant, 
                                                                      tableId: _lCustomerTable, status: 'ORDER_STATUS.REGISTERED' } ).fetch().length;
                let _lOrdersInProcessStatus: number = Orders.find( { creation_user: this._user, restaurantId: _lCustomerRestaurant, 
                                                                     tableId: _lCustomerTable, status: 'ORDER_STATUS.IN_PROCESS' } ).fetch().length;
                let _lOrdersPreparedStatus: number = Orders.find( { creation_user: this._user, restaurantId: _lCustomerRestaurant, 
                                                                    tableId: _lCustomerTable, status: 'ORDER_STATUS.PREPARED' } ).fetch().length;
                let _lOrdersDeliveredStatus: number = Orders.find( { creation_user: this._user, restaurantId: _lCustomerRestaurant, 
                                                                     tableId: _lCustomerTable, status: 'ORDER_STATUS.DELIVERED', toPay: false } ).fetch().length;
                let _lOrdersToConfirm: number = Orders.find( { restaurantId: _lCustomerRestaurant, tableId: _lCustomerTable, 'translateInfo.firstOrderOwner': this._user, 
                                                               'translateInfo.markedToTranslate': true, status: 'ORDER_STATUS.PENDING_CONFIRM', toPay : false } ).fetch().length;
                let _lOrdersWithPendingConfirmation: number = Orders.find( { restaurantId: _lCustomerRestaurant, tableId: _lCustomerTable, 'translateInfo.lastOrderOwner': this._user, 
                                                                             'translateInfo.markedToTranslate': true, status: 'ORDER_STATUS.PENDING_CONFIRM', toPay : false } ).fetch().length;
                let _lUserWaiterCallsCount: number = WaiterCallDetails.find( { restaurant_id: _lCustomerRestaurant, table_id: _lCustomerTable, 
                                                                               type: 'CALL_OF_CUSTOMER', user_id: this._user, status: 'completed' } ).fetch().length;
                let _lUserPaymentsCount: number = Payments.find( { creation_user: this._user, restaurantId: _lCustomerRestaurant, 
                                                                   tableId: _lCustomerTable, status: 'PAYMENT.NO_PAID', received: false } ).fetch().length;
                
                                                                                   
            } else {
                // Error de cuenta no encontrada
            }
        }
    });
}