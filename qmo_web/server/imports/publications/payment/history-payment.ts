import { Meteor } from 'meteor/meteor';
import { HistoryPayments } from '../../../../both/collections/payment/history-payment.collection';

/**
 * Meteor publication EmailContents
 */
Meteor.publish('getHistoryPaymentsByUser', function (_userId: string) {
    return HistoryPayments.find({ creation_user: _userId }, { sort: { creation_date: -1 } });
}); 