import { Meteor } from 'meteor/meteor';
import { Currencies } from '../../../../both/collections/general/currency.collection';
import { Restaurants } from '../../../../both/collections/restaurant/restaurant.collection';

/**
 * Meteor publication currencies
 */
Meteor.publish( 'currencies', () => Currencies.find( { isActive: true } ) );

/**
 * Meteor publication return currencies by restaurants Id
 */
Meteor.publish( 'getCurrenciesByRestaurantsId', function( _restaurantsId: string[] ) {
    let _ids:string[] = [];
    Restaurants.collection.find( { _id: { $in: _restaurantsId } } ).forEach( ( r ) => {
        _ids.push( r.currencyId );
    });
    return Currencies.collection.find( { _id: { $in: _ids } } );
});