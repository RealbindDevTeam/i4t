import { Meteor } from 'meteor/meteor';
import { Countries } from '../../../../both/collections/settings/country.collection';
import { Restaurants } from '../../../../both/collections/restaurant/restaurant.collection';

/**
 * Meteor publication countries
 */
Meteor.publish('countries', function () {
    return Countries.collection.find({ is_active: true });
});


/**
 * Country by restaurant
 */
Meteor.publish('getCountryByRestaurantId', function (_restaurantId: string) {
    check(_restaurantId, String);
    let restaurant = Restaurants.collection.findOne({ _id: _restaurantId });
    return Countries.collection.find({ _id: restaurant.countryId });
});

/**
 * Meteor publication return countries by restaurants Id
 */
Meteor.publish('getCountriesByRestaurantsId', function (_restaurantsId: string[]) {
    let _ids: string[] = [];
    Restaurants.collection.find({ _id: { $in: _restaurantsId } }).forEach((r) => {
        _ids.push(r.countryId);
    });
    return Countries.collection.find({ _id: { $in: _ids } });
});


/**
 * Meteor publicaation return countries by admin user Id
 */
Meteor.publish('getCountriesByAdminUser', function(){
    let _countriesIds: string[] = [];
    Restaurants.collection.find( { creation_user: this.userId } ).forEach( (restaurant) =>{
        _countriesIds.push(restaurant.countryId);
    });

    return Countries.collection.find({ _id: { $in: _countriesIds}, is_active: true});
});