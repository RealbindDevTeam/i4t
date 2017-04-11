import { Meteor } from 'meteor/meteor';
import { Currencies } from '../../../../both/collections/general/currency.collection';

/**
 * Meteor publication currencies
 */
Meteor.publish( 'currencies', function publishCurrencies(){
    return Currencies.find( { } );
});