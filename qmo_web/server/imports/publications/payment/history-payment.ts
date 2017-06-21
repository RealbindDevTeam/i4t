import { Meteor } from 'meteor/meteor';
import { HistoryPayments } from '../../../../both/collections/payment/history-payment.collection';

/**
 * Meteor publication EmailContents
 */
Meteor.publish('getHistoryPaymentsByRestaurant', function (_restaurantId: string) {
    return HistoryPayments.find({ restaurantId: _restaurantId });
});