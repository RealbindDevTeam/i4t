import { MongoObservable } from 'meteor-rxjs';
import { Restaurant, RestaurantImage, RestaurantImageThumb, RestaurantTurn, RestaurantLegality, RestaurantProfile, RestaurantProfileImage, RestaurantProfileImageThumb } from '../../models/restaurant/restaurant.model';
import { Meteor } from 'meteor/meteor';

/**
 * Function to validate if user exists
 */
function loggedIn() {
    return !!Meteor.user();
}

/**
 * Restaurants Collection
 */
export const Restaurants = new MongoObservable.Collection<Restaurant>('restaurants');

/**
 * Allow Restaurant collecion insert and update functions
 */
Restaurants.allow({
    insert: loggedIn,
    update: loggedIn
});

/**
 * Restaurant Image Thumbs Interface
 */
export interface RestaurantImageThumbsCollection<T> extends MongoObservable.Collection<T> {
    getRestaurantImageThumbUrl(selector?: Object | string): string;
}

/**
 * Restaurant Image Thumbs Collection
 */
export const RestaurantImageThumbs = new MongoObservable.Collection<RestaurantImageThumb>('restaurantImageThumbs') as RestaurantImageThumbsCollection<RestaurantImageThumb>;

/**
 * Allow Restaurant Image Thumbs Collection insert, update and remove functions
 */
RestaurantImageThumbs.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/**
 * Function to return restaurant image thumb
 */
RestaurantImageThumbs.getRestaurantImageThumbUrl = function( _id:string ){
    const image = this.findOne({ restaurantId: _id }) || {};
    return image.url || '/images/default-restaurant.png';
}

/**
 * Restaurant Images Interface
 */
export interface RestaurantImagesCollection<T> extends MongoObservable.Collection<T> {
    getRestaurantImageUrl(selector?: Object | string): string;
}

/**
 * Restaurant Images Collection
 */
export const RestaurantImages = new MongoObservable.Collection<RestaurantImage>('restaurantImages') as RestaurantImagesCollection<RestaurantImage>;

/**
 * Function to return restaurant image
 */
RestaurantImages.getRestaurantImageUrl = function( _id:string ){
    const image = this.findOne({ restaurantId: _id }) || {};
    return image.url || '/images/default-restaurant.png';
}

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

/**
 * Restaurant Legality Collection
 */
export const RestaurantsLegality = new MongoObservable.Collection<RestaurantLegality>('restaurants_legality');

/**
 * Allow Restaurant Legality collection insert and update functions
 */
RestaurantsLegality.allow({
    insert: loggedIn,
    update: loggedIn
});

/**
 * Restaurant Profile Collection
 */
export const RestaurantsProfile = new MongoObservable.Collection<RestaurantProfile>('restaurants_profile');

/**
 * Allow Restaurant Profile collection insert and update functions
 */
RestaurantsProfile.allow({
    insert: loggedIn,
    update: loggedIn
});

/**
 * Restaurant Profile Images Collection
 */
export const RestaurantProfileImages = new MongoObservable.Collection<RestaurantProfileImage>('restaurant_profile_Images');

/**
 * Allow Restaurant Profile Images collection insert, update and remove functions
 */
RestaurantProfileImages.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/**
 * Restaurant Profile Image Thumbs Collection
 */
export const RestaurantProfileImageThumbs = new MongoObservable.Collection<RestaurantProfileImageThumb>('restaurant_profile_Image_Thumbs');

/**
 * Allow Restaurant Profile Image Thumbs Collection insert, update and remove functions
 */
RestaurantProfileImageThumbs.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});
