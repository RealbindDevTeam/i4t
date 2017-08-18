import { MongoObservable } from 'meteor-rxjs';
import { Restaurant, RestaurantImage, RestaurantImageThumb, RestaurantTurn } from '../../models/restaurant/restaurant.model';
import { Meteor } from 'meteor/meteor';

/**
 * Function to validate if user exists
 */
function loggedIn(){
    return !!Meteor.user();
}

/**
 * Restaurants Collection
 */
export const Restaurants =  new MongoObservable.Collection<Restaurant>('restaurants');

/**
 * Allow Restaurant collecion insert and update functions
 */
Restaurants.allow({
    insert: loggedIn,
    update: loggedIn
});

/**
 * Restaurant Image Thumbs Collection
 */
export const RestaurantImageThumbs = new MongoObservable.Collection<RestaurantImageThumb>('restaurantImageThumbs');

/**
 * Allow Restaurant Image Thumbs Collection insert, update and remove functions
 */
RestaurantImageThumbs.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/**
 * Restaurant Images Collection
 */
export const RestaurantImages = new MongoObservable.Collection<RestaurantImage>('restaurantImages');

/**
 * Allow Restaurant Images collection insert, update and remove functions
 */
RestaurantImages.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/**
 * Restaurants Collection
 */

export const RestaurantTurns = new MongoObservable.Collection<RestaurantTurn>('restaurant_turns');

/**
 * Allow Restaurant Turns collection insert and update functions
 */
RestaurantTurns.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});