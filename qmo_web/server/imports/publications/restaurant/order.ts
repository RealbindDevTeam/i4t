import { Meteor } from 'meteor/meteor';
import { Orders } from '../../../../both/collections/restaurant/order.collection';
import { check } from 'meteor/check';
import { Table } from '../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../both/collections/restaurant/table.collection';

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
    return Orders.collection.find({ restaurantId: _restaurantId, tableId: _tableId, status: {$in: _status} });
});