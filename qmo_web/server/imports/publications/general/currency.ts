import { Meteor } from 'meteor/meteor';
import { Currencies } from '../../../../both/collections/general/currency.collection';

/**
 * Meteor publication currencies
 */
Meteor.publish( 'currencies', () => Currencies.find( { isActive: true } ) );