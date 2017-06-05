import { Meteor } from 'meteor/meteor';
import { Orders } from '../../../../both/collections/restaurant/order.collection';
import { check } from 'meteor/check';
import { Table } from '../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../both/collections/restaurant/table.collection';
import { UserDetails } from '../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../both/models/auth/user-detail.model';
import { Account } from '../../../../both/models/restaurant/account.model';
import { Accounts } from '../../../../both/collections/restaurant/account.collection';

/**
 * Meteor publication orders with restaurantId and status conditions
 * @param {string} _restaurantId
 * @param {string} _status
 */
Meteor.publish('getOrders', function (_restaurantId: string, _tableQRCode: string, _status: string[]) {
    check(_restaurantId, String);
    check(_tableQRCode, String);

    let _lTable: Table = Tables.collection.findOne({ QR_code: _tableQRCode });
    return Orders.collection.find({ restaurantId: _restaurantId, tableId: _lTable._id, status: { $in: _status } });
});

/**
 * Meteor publications orders with restaurantId and status conditions
 * @param {string}
 * @param {string}
*/
Meteor.publish('getOrdersByTableId', function (_restaurantId: string, _tableId, _status: string[]) {
    check(_restaurantId, String);
    return Orders.collection.find({ restaurantId: _restaurantId, tableId: _tableId, status: { $in: _status } });
});

/**
 * Meteor publications orders with userId and status conditions
 * @param {string}
 * @param {string}
*/
Meteor.publish('getOrdersByUserId', function (_userId: string, _status: string[]) {
    check(_userId, String);
    let _lUserDetail: UserDetail = UserDetails.findOne({ user_id: _userId });
    if(_lUserDetail.current_restaurant && _lUserDetail.current_table){
        return Orders.collection.find({ restaurantId: _lUserDetail.current_restaurant, tableId: _lUserDetail.current_table, status: { $in: _status } });
    }
    return;
});

/**
 * Meteor publication orders with restaurantId condition
 * @param {string} _restaurantId
*/
Meteor.publish('getOrdersByRestaurantId', function (_restaurantId: string, _status: string[]) {
    check(_restaurantId, String);
    return Orders.collection.find({ restaurantId: _restaurantId, status: { $in: _status } });
});

/**
 * Meteor publication orders by restaurant work
 * @param {string} _userId
 * @param {sring[]} _status
 */
Meteor.publish('getOrdersByRestaurantWork', function (_userId: string, _status: string[]) {
    check(_userId, String);
    let _lUserDetail: UserDetail = UserDetails.findOne({ user_id: _userId });
    return Orders.collection.find({ restaurantId: _lUserDetail.restaurant_work, status: { $in: _status } });
});


/**
 * Meteor publication orders by account
 * @param {string} _userId
 */
Meteor.publish('getOrdersByAccount', function (_userId: string) {
    check(_userId, String);
    let _lUserDetail: UserDetail = UserDetails.findOne({ user_id: _userId });
    if(_lUserDetail.current_restaurant !== "" && _lUserDetail.current_table !== ""){
        let _lAccount: Account = Accounts.findOne({restaurantId: _lUserDetail.current_restaurant, 
                                                   tableId: _lUserDetail.current_table,
                                                   status: 'OPEN'});
        return Orders.find( { creation_user: _userId, restaurantId: _lAccount.restaurantId, tableId: _lAccount.tableId, status: 'ORDER_STATUS.DELIVERED' } );
    }else{
        return Orders.find( { creation_user: _userId, restaurantId: "", tableId: "", status: ""} );
    }
});

/**
 * Meteor publication return orders with translate confirmation pending
 */
Meteor.publish( 'getOrdersWithConfirmationPending', function( _restaurantId:string, _tableId:string ) {
    check( _restaurantId, String );
    check( _tableId, String );   
    return Orders.find( { restaurantId: _restaurantId,
                          tableId: _tableId,
                          status: 'ORDER_STATUS.PENDING_CONFIRM', 
                          'translateInfo.markedToTranslate': true, 
                          'translateInfo.confirmedToTranslate': false } );
});