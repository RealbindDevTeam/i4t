import { Meteor } from 'meteor/meteor';
import { PaymentTransactions } from '../../../../both/collections/payment/payment-transaction.collection';

/**
 * Meteor publication EmailContents
 */
Meteor.publish('getUserTransactions', function (userId: string) {
    return PaymentTransactions.find({ creation_user: userId });
});