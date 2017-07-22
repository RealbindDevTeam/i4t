import { Meteor } from 'meteor/meteor';
import { PaymentTransactions } from '../../../../both/collections/payment/payment-transaction.collection';

/**
 * Meteor publication EmailContents
 */
Meteor.publish('getTransactions', function () {
    return PaymentTransactions.find({});
});