import { Meteor } from 'meteor/meteor';
import { Countries } from '../../../../both/collections/settings/country.collection';
import { Restaurants } from '../../../../both/collections/restaurant/restaurant.collection';

/**
 * Meteor publication countries
 */
Meteor.publish( 'countries', () => Countries.find( { is_active: true } ) );


/**
 * Country by restaurant
 */
Meteor.publish('getCountryByRestaurantId', function( _restaurantId: string){
    check(_restaurantId, String);
    let restaurant = Restaurants.collection.findOne({_id: _restaurantId});
    return Countries.collection.find({_id: restaurant.countryId});
});