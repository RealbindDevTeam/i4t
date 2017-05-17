import { Meteor } from 'meteor/meteor';
import { Table } from '../../models/restaurant/table.model';
import { Tables } from '../../collections/restaurant/table.collection';
import { Account } from '../../models/restaurant/account.model';
import { Accounts } from '../../collections/restaurant/account.collection';
import { Order, OrderItem } from '../../models/restaurant/order.model';
import { Orders } from '../../collections/restaurant/order.collection';
import { Restaurant } from '../../models/restaurant/restaurant.model';
import { Restaurants } from '../../collections/restaurant/restaurant.collection';

if (Meteor.isServer) {
    Meteor.methods({
        /**
         * This Meteor Method add item in user order
         * @param {OrderItem} _itemToInsert
         * @param {string} _tableQRCode
         */
        AddItemToOrder: function (_itemToInsert: OrderItem, _restaurantId: string, _tableQRCode: string, _finalPrice: number) {

            let _lTable: Table = Tables.collection.findOne({ QR_code: _tableQRCode });
            let _lAccount: Account = Accounts.collection.findOne({
                restaurantId: _restaurantId,
                tableId: _lTable._id,
                status: 'OPEN'
            });

            let _lOrder: Order = Orders.collection.findOne({
                creation_user: Meteor.userId(),
                restaurantId: _restaurantId,
                tableId: _lTable._id,
                accountId: _lAccount._id,
                status: 'ORDER_STATUS.REGISTERED'
            });

            if (_lOrder) {
                let _lTotalPaymentAux: number = Number.parseInt(_lOrder.totalPayment.toString()) + Number.parseInt(_itemToInsert.paymentItem.toString());
                Orders.update({
                    creation_user: Meteor.userId(),
                    restaurantId: _restaurantId,
                    tableId: _lTable._id,
                    accountId: _lAccount._id,
                    status: 'ORDER_STATUS.REGISTERED'
                },
                    { $push: { items: _itemToInsert } }
                );
                Orders.update({
                    creation_user: Meteor.userId(),
                    restaurantId: _restaurantId,
                    tableId: _lTable._id,
                    accountId: _lAccount._id,
                    status: 'ORDER_STATUS.REGISTERED'
                },
                    {
                        $set: {
                            modification_user: Meteor.userId(),
                            modification_date: new Date(),
                            totalPayment: _lTotalPaymentAux,
                            orderItemCount: _lOrder.orderItemCount + 1
                        }
                    }
                );
            } else {
                let _lRestaurant: Restaurant = Restaurants.collection.findOne({ _id: _restaurantId });
                let _orderCount: number = _lRestaurant.orderNumberCount + 1;
                _lRestaurant.orderNumberCount = _orderCount;

                Restaurants.update({ _id: _lRestaurant._id }, _lRestaurant);
                Orders.insert({
                    creation_user: Meteor.userId(),
                    creation_date: new Date(),
                    restaurantId: _restaurantId,
                    tableId: _lTable._id,
                    code: _orderCount,
                    status: 'ORDER_STATUS.REGISTERED',
                    accountId: _lAccount._id,
                    items: [_itemToInsert],
                    totalPayment: _finalPrice,
                    orderItemCount: 1
                });
            }
        },

        AddItemToOrder2: function (_itemToInsert: OrderItem, _restaurantId: string, _idTable: string, _finalPrice: number) {

            let _lTable: Table = Tables.collection.findOne({ _id: _idTable });
            let _lAccount: Account = Accounts.collection.findOne({
                restaurantId: _restaurantId,
                tableId: _lTable._id,
                status: 'OPEN'
            });

            let _lOrder: Order = Orders.collection.findOne({
                creation_user: Meteor.userId(),
                restaurantId: _restaurantId,
                tableId: _lTable._id,
                accountId: _lAccount._id,
                status: 'ORDER_STATUS.REGISTERED'
            });

            if (_lOrder) {
                let _lTotalPaymentAux: number = Number.parseInt(_lOrder.totalPayment.toString()) + Number.parseInt(_itemToInsert.paymentItem.toString());
                Orders.update({
                    creation_user: Meteor.userId(),
                    restaurantId: _restaurantId,
                    tableId: _lTable._id,
                    accountId: _lAccount._id,
                    status: 'ORDER_STATUS.REGISTERED'
                },
                    { $push: { items: _itemToInsert } }
                );
                Orders.update({
                    creation_user: Meteor.userId(),
                    restaurantId: _restaurantId,
                    tableId: _lTable._id,
                    accountId: _lAccount._id,
                    status: 'ORDER_STATUS.REGISTERED'
                },
                    {
                        $set: {
                            modification_user: Meteor.userId(),
                            modification_date: new Date(),
                            totalPayment: _lTotalPaymentAux,
                            orderItemCount: _lOrder.orderItemCount + 1
                        }
                    }
                );
            } else {
                let _lRestaurant: Restaurant = Restaurants.collection.findOne({ _id: _restaurantId });
                let _orderCount: number = _lRestaurant.orderNumberCount + 1;
                _lRestaurant.orderNumberCount = _orderCount;

                Restaurants.update({ _id: _lRestaurant._id }, _lRestaurant);
                Orders.insert({
                    creation_user: Meteor.userId(),
                    creation_date: new Date(),
                    restaurantId: _restaurantId,
                    tableId: _lTable._id,
                    code: _orderCount,
                    status: 'ORDER_STATUS.REGISTERED',
                    accountId: _lAccount._id,
                    items: [_itemToInsert],
                    totalPayment: _finalPrice,
                    orderItemCount: 1
                });
            }
        }
    });
}