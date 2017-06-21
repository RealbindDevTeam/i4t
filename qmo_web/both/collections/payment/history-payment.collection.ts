import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { HistoryPayment } from '../../models/payment/history-payment.model';

export const HistoryPayments = new MongoObservable.Collection<HistoryPayment>('history_payment');

/**
 * Function to validate if user exists
 */
function loggedIn(){
    return !!Meteor.user();
}

/**
 * Allow HistoryPaymentCollection collecion insert and update functions
 */
HistoryPayments.allow({
    insert: loggedIn,
    update: loggedIn
});