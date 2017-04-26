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
        if(_lAccount){
            console.log('Existe cuenta');
            return Orders.find({restaurantId: _lAccount.restaurantId, tableId: _lAccount.tableId, status: 'DELIVERED'});
        }else{
            console.log('No existe cuenta');
            return Orders.find({restaurantId: "", tableId: "", status: ""});
        }
    }else{
        console.log('No existe tableId y restauranteId');
        return Orders.find({restaurantId: "", tableId: "", status: ""});
    }
});
