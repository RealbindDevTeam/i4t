import { Meteor } from 'meteor/meteor';
import { Cities } from '../../../../both/collections/settings/city.collection';
import { Restaurants } from '../../../../both/collections/restaurant/restaurant.collection';

/**
 * Meteor publication cities
 */
Meteor.publish( 'cities', () => Cities.find() );

/**
 * City by restaurant
 */
Meteor.publish('getCityByRestaurantId', function( _restaurantId: string){
    check(_restaurantId, String);
    let restaurant = Restaurants.collection.findOne({_id: _restaurantId});
    return Cities.collection.find({_id: restaurant.cityId});
});